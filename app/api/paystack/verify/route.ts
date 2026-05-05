import {
  decodeJwtPayload,
  ensurePaidEnrollment,
  getJwtToken,
  getPaystackMetadata,
  logPaystack,
  verifyPaystackTransaction,
} from '@/src/lib/paystack'

export async function POST(req) {
  try {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackKey) return Response.json({ message: 'PAYSTACK_SECRET_KEY is missing.' }, { status: 500 })

    const token = getJwtToken(req)
    if (!token) return Response.json({ message: 'Unauthorized.' }, { status: 401 })

    const decoded = decodeJwtPayload(token)
    const studentId = decoded?.id
    if (!studentId) return Response.json({ message: 'Invalid token.' }, { status: 401 })

    const { reference } = await req.json()
    if (!reference) return Response.json({ message: 'reference is required.' }, { status: 400 })

    const { verifyRes, verifyData } = await verifyPaystackTransaction(reference, paystackKey)

    if (!verifyRes.ok || !verifyData?.status) {
      logPaystack('verify_failed', {
        studentId: String(studentId),
        reference,
        status: verifyRes.status,
        message: verifyData?.message,
      })
      return Response.json({ message: verifyData?.message || 'Payment verification failed.' }, { status: 400 })
    }

    const tx = verifyData?.data
    if (tx?.status !== 'success') {
      logPaystack('verify_not_successful', { reference, paystackStatus: tx?.status })
      return Response.json({ message: 'Payment not successful yet.' }, { status: 400 })
    }

    const { studentId: paidStudentId, courseId } = getPaystackMetadata(tx)
    const amountKobo = Number(tx?.amount || 0)

    if (!courseId || !paidStudentId || paidStudentId !== String(studentId)) {
      logPaystack('verify_metadata_mismatch', {
        reference,
        expectedStudentId: String(studentId),
        paidStudentId,
        courseId,
      })
      return Response.json({ message: 'Payment metadata mismatch.' }, { status: 400 })
    }

    if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
      logPaystack('verify_invalid_amount', { reference, amountKobo })
      return Response.json({ message: 'Invalid payment amount returned by Paystack.' }, { status: 400 })
    }

    await ensurePaidEnrollment({
      studentId: String(studentId),
      courseId,
      amountKobo,
      reference: String(reference),
    })

    logPaystack('verify_success', { studentId: String(studentId), courseId, reference })

    return Response.json({ status: true, enrolled: true, courseId })
  } catch (err) {
    logPaystack('verify_exception', err)
    return Response.json({ message: err?.message || 'Verification failed.' }, { status: 400 })
  }
}

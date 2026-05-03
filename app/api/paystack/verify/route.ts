import { getPayload } from 'payload'
import config from '@/payload.config'

function getToken(req) {
  const auth = req.headers.get('authorization') || ''
  return auth.startsWith('JWT ') ? auth.slice(4) : ''
}

function decodeToken(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
  } catch {
    return null
  }
}

export async function POST(req) {
  try {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackKey) return Response.json({ message: 'PAYSTACK_SECRET_KEY is missing.' }, { status: 500 })

    const token = getToken(req)
    if (!token) return Response.json({ message: 'Unauthorized.' }, { status: 401 })

    const decoded = decodeToken(token)
    const studentId = decoded?.id
    if (!studentId) return Response.json({ message: 'Invalid token.' }, { status: 401 })

    const { reference } = await req.json()
    if (!reference) return Response.json({ message: 'reference is required.' }, { status: 400 })

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    })
    const verifyData = await verifyRes.json()

    if (!verifyRes.ok || !verifyData?.status) {
      return Response.json({ message: verifyData?.message || 'Payment verification failed.' }, { status: 400 })
    }

    const tx = verifyData?.data
    if (tx?.status !== 'success') {
      return Response.json({ message: 'Payment not successful yet.' }, { status: 400 })
    }

    const courseId = String(tx?.metadata?.courseId || '')
    const paidStudentId = String(tx?.metadata?.studentId || '')

    if (!courseId || paidStudentId !== String(studentId)) {
      return Response.json({ message: 'Payment metadata mismatch.' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'enrollments',
      where: {
        and: [
          { student: { equals: studentId } },
          { course: { equals: courseId } },
          { status: { equals: 'paid' } },
        ],
      },
      limit: 1,
    })

    if (existing?.docs?.length === 0) {
      await payload.create({
        collection: 'enrollments',
        data: {
          student: studentId,
          course: Number(courseId) as any,
          status: 'paid',
          amount: Number(tx?.amount || 0) / 100,
          reference: String(reference),
        },
      })
    }

    return Response.json({ status: true, enrolled: true, courseId })
  } catch (err) {
    return Response.json({ message: err?.message || 'Verification failed.' }, { status: 400 })
  }
}

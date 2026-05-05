import { createHmac } from 'node:crypto'
import { ensurePaidEnrollment, getPaystackMetadata, logPaystack } from '@/src/lib/paystack'

export async function POST(req) {
  try {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY
    if (!secret) return Response.json({ ok: false }, { status: 500 })

    const raw = await req.text()
    const signature = req.headers.get('x-paystack-signature') || ''
    const hash = createHmac('sha512', secret).update(raw).digest('hex')

    if (!signature || signature !== hash) {
      logPaystack('webhook_invalid_signature')
      return Response.json({ ok: false }, { status: 401 })
    }

    const payloadBody = JSON.parse(raw)
    if (payloadBody?.event !== 'charge.success') {
      logPaystack('webhook_ignored', { event: payloadBody?.event })
      return Response.json({ ok: true })
    }

    const data = payloadBody?.data || {}
    const reference = String(data?.reference || '')
    const { studentId, courseId } = getPaystackMetadata(data)
    const amountKobo = Number(data?.amount || 0)

    if (!reference || !studentId || !courseId || !Number.isFinite(amountKobo) || amountKobo <= 0) {
      logPaystack('webhook_missing_metadata', { reference, studentId, courseId, amountKobo })
      return Response.json({ ok: true })
    }

    await ensurePaidEnrollment({ studentId, courseId, amountKobo, reference })
    logPaystack('webhook_enrollment_recorded', { studentId, courseId, reference })

    return Response.json({ ok: true })
  } catch (error) {
    logPaystack('webhook_exception', error)
    return Response.json({ ok: false }, { status: 400 })
  }
}

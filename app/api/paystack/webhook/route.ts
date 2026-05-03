import { createHmac } from 'node:crypto'
import { getPayload } from 'payload'
import config from '@/payload.config'

function parseEventReference(eventData) {
  return String(eventData?.reference || '')
}

function parseMeta(eventData) {
  return {
    studentId: String(eventData?.metadata?.studentId || ''),
    courseId: String(eventData?.metadata?.courseId || ''),
  }
}

export async function POST(req) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) return Response.json({ ok: false }, { status: 500 })

    const raw = await req.text()
    const signature = req.headers.get('x-paystack-signature') || ''
    const hash = createHmac('sha512', secret).update(raw).digest('hex')

    if (!signature || signature !== hash) {
      return Response.json({ ok: false }, { status: 401 })
    }

    const payloadBody = JSON.parse(raw)
    if (payloadBody?.event !== 'charge.success') return Response.json({ ok: true })

    const data = payloadBody?.data || {}
    const reference = parseEventReference(data)
    const { studentId, courseId } = parseMeta(data)

    if (!reference || !studentId || !courseId) return Response.json({ ok: true })

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

    if (!existing?.docs?.length) {
      await payload.create({
        collection: 'enrollments',
        data: {
          student: Number(studentId) as any,
          course: Number(courseId) as any,
          status: 'paid',
          amount: Number(data?.amount || 0) / 100,
          reference,
        },
      })
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
}

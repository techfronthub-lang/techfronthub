import { getPayload } from 'payload'
import config from '@/payload.config'
import { sendCoursePurchaseConfirmation } from './auth-email'

export function getPaystackBaseUrl() {
  return process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co'
}

export function parseAmountToNaira(value: unknown) {
  if (value == null) return null
  const cleaned = String(value).replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

export function getJwtToken(req: Request) {
  const auth = req.headers.get('authorization') || ''
  return auth.startsWith('JWT ') ? auth.slice(4) : ''
}

export function decodeJwtPayload(token: string) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
  } catch {
    return null
  }
}

export async function verifyPaystackTransaction(reference: string, secretKey: string) {
  const verifyRes = await fetch(`${getPaystackBaseUrl()}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })

  const verifyData = await verifyRes.json().catch(() => null)
  return { verifyRes, verifyData }
}

export function getPaystackMetadata(data: any) {
  return {
    studentId: String(data?.metadata?.studentId || ''),
    courseId: String(data?.metadata?.courseId || ''),
  }
}

export function getPromotionMetadata(data: any) {
  return {
    campaign: String(data?.metadata?.campaign || ''),
    fullName: String(data?.metadata?.fullName || ''),
    email: String(data?.metadata?.email || ''),
    phone: String(data?.metadata?.phone || ''),
    school: String(data?.metadata?.school || ''),
    role: String(data?.metadata?.role || ''),
    cohort: String(data?.metadata?.cohort || ''),
    plan: String(data?.metadata?.plan || ''),
    planLabel: String(data?.metadata?.planLabel || ''),
  }
}

export async function ensurePaidEnrollment({
  studentId,
  courseId,
  amountKobo,
  reference,
}: {
  studentId: string
  courseId: string
  amountKobo: number
  reference: string
}) {
  const payload = await getPayload({ config })
  const existing = await payload.find({
    collection: 'enrollments',
    where: {
      or: [
        { reference: { equals: reference } },
        {
          and: [
            { student: { equals: studentId } },
            { course: { equals: courseId } },
            { status: { equals: 'paid' } },
          ],
        },
      ],
    },
    limit: 1,
  })

  if (existing?.docs?.length) {
    return { enrollment: existing.docs[0], created: false }
  }

  const [student, course] = await Promise.all([
    payload.findByID({ collection: 'users', id: studentId }).catch(() => null),
    payload.findByID({ collection: 'courses', id: courseId }).catch(() => null),
  ])

  const enrollment = await payload.create({
    collection: 'enrollments',
    data: {
      student: Number(studentId) as any,
      course: Number(courseId) as any,
      status: 'paid',
      amount: amountKobo / 100,
      reference,
    },
  })

  if (student?.email && course) {
    await sendCoursePurchaseConfirmation({
      email: student.email,
      name: student.name,
      courseTitle: course.title || course.slug || `Course #${courseId}`,
      amountNaira: amountKobo / 100,
      reference,
    }).catch((error) => {
      console.error('Failed to send course purchase confirmation email', error)
    })
  }

  return { enrollment, created: true }
}

export function logPaystack(event: string, data?: unknown) {
  if (data === undefined) {
    console.log(`[paystack] ${event}`)
    return
  }

  console.log(`[paystack] ${event}`, data)
}

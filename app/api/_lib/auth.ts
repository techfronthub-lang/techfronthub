import type { Payload } from 'payload'

const PRIVILEGED_ADMIN_EMAILS = new Set(['admin@techfronthub.com'])

export class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export type ActorCollection = 'users' | 'instructors'

export type RequestActor = {
  collection: ActorCollection
  record: any
  token: string
  decoded: Record<string, any> | null
  isAdminLike: boolean
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

export function normalizeRelationId(value: any) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return String(value.id ?? '')
  return String(value)
}

export function coerceRelationshipId(value: any) {
  const normalized = normalizeRelationId(value).trim()
  if (!normalized) return normalized
  return /^\d+$/.test(normalized) ? Number(normalized) : normalized
}

function isAdminLikeUser(user: any) {
  const email = String(user?.email || '').trim().toLowerCase()
  return user?.role === 'admin' || user?.role === 'staff' || PRIVILEGED_ADMIN_EMAILS.has(email)
}

function getBlockedStatusMessage(collection: ActorCollection, record: any) {
  if (collection === 'users') {
    if (record?.status === 'suspended') return 'Your account has been suspended.'
    return ''
  }

  if (record?.status === 'suspended') return 'Your instructor account has been suspended.'
  if (record?.status !== 'active') return 'Your instructor account is pending approval.'
  return ''
}

async function findActorRecord(payload: Payload, decoded: Record<string, any> | null) {
  const actorId = decoded?.id
  if (!actorId) return null

  const candidates: ActorCollection[] = []
  const decodedCollection = decoded?.collection

  if (decodedCollection === 'users' || decodedCollection === 'instructors') {
    candidates.push(decodedCollection)
  }

  if (!candidates.includes('users')) candidates.push('users')
  if (!candidates.includes('instructors')) candidates.push('instructors')

  for (const collection of candidates) {
    try {
      const record = await payload.findByID({
        collection,
        id: String(actorId),
      })

      if (!record) continue

      const decodedEmail = String(decoded?.email || '').trim().toLowerCase()
      if (decodedEmail && String(record?.email || '').trim().toLowerCase() !== decodedEmail) {
        continue
      }

      return { collection, record }
    } catch {
      // Try the next auth collection.
    }
  }

  return null
}

export async function resolveRequestActor(
  req: Request,
  payload: Payload,
  options: { allowBlocked?: boolean } = {},
) {
  const token = getJwtToken(req)
  if (!token) return null

  const decoded = decodeJwtPayload(token)
  const found = await findActorRecord(payload, decoded)
  if (!found?.record) {
    throw new ApiError(401, 'Unauthorized.')
  }

  const blockedMessage = options.allowBlocked ? '' : getBlockedStatusMessage(found.collection, found.record)
  if (blockedMessage) {
    throw new ApiError(403, blockedMessage)
  }

  return {
    collection: found.collection,
    record: found.record,
    token,
    decoded,
    isAdminLike: found.collection === 'users' && isAdminLikeUser(found.record),
  } satisfies RequestActor
}

export function requireActor(actor: RequestActor | null) {
  if (!actor) throw new ApiError(401, 'Unauthorized.')
  return actor
}

export function requireUserActor(actor: RequestActor | null) {
  const resolved = requireActor(actor)
  if (resolved.collection !== 'users') {
    throw new ApiError(403, 'A student account is required for this action.')
  }
  return resolved
}

export function requireInstructorActor(actor: RequestActor | null) {
  const resolved = requireActor(actor)
  if (resolved.collection !== 'instructors') {
    throw new ApiError(403, 'An instructor account is required for this action.')
  }
  return resolved
}

export async function requirePaidEnrollment(payload: Payload, studentId: string, courseId: string) {
  const enrollment = await payload.find({
    collection: 'enrollments',
    where: {
      and: [
        { student: { equals: studentId } },
        { course: { equals: courseId } },
        { status: { equals: 'paid' } },
      ],
    },
    limit: 1,
    depth: 1,
  })

  if (!enrollment?.docs?.length) {
    throw new ApiError(403, 'You are not enrolled in this course.')
  }

  return enrollment.docs[0]
}

export async function requireInstructorCourseOwnership(
  payload: Payload,
  actor: RequestActor,
  courseId: string,
) {
  const course = await payload.findByID({
    collection: 'courses',
    id: String(courseId),
    depth: 0,
  })

  if (actor.isAdminLike) return course

  if (actor.collection !== 'instructors') {
    throw new ApiError(403, 'Only instructors can manage course records.')
  }

  if (normalizeRelationId(course?.instructor) !== String(actor.record.id)) {
    throw new ApiError(403, 'You can only manage your own courses.')
  }

  return course
}

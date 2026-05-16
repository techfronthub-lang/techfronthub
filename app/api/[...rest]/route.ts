import { getCachedPayload } from './payload'
import {
  ApiError,
  normalizeRelationId,
  requireActor,
  resolveRequestActor,
  requireInstructorCourseOwnership,
} from '@/app/api/_lib/auth'
import { buildFindOptions } from '@/app/api/_lib/query'

const PUBLIC_COLLECTION_READS = new Set([
  'courses',
  'categories',
  'packages',
  'testimonials',
  'events',
  'udemy-courses',
])

const OWNED_INSTRUCTOR_COLLECTIONS = new Set(['courses', 'assignments', 'announcements'])
const PUBLIC_GLOBAL_READS = new Set(['site-config', 'sales-page'])
function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        message: error.message,
        ...(error.code ? { code: error.code } : {}),
      },
      { status: error.status },
    )
  }

  const message = error instanceof Error ? error.message : 'Error'
  return Response.json({ message }, { status: 400 })
}

function sanitizeUserSignup(data: Record<string, any>) {
  return {
    name: String(data?.name || '').trim(),
    email: String(data?.email || '').trim().toLowerCase(),
    password: data?.password,
    role: 'student',
    status: 'active',
    emailVerified: false,
  }
}

function sanitizeInstructorSignup(data: Record<string, any>) {
  return {
    name: String(data?.name || '').trim(),
    email: String(data?.email || '').trim().toLowerCase(),
    password: data?.password,
    status: 'pending',
    emailVerified: false,
  }
}

function sanitizeSelfUserPatch(data: Record<string, any>) {
  const next: Record<string, any> = {}
  const allowedFields = ['name', 'phone', 'avatar', 'password']

  for (const field of allowedFields) {
    if (field in data) next[field] = data[field]
  }

  return next
}

function sanitizeSelfInstructorPatch(data: Record<string, any>) {
  const next: Record<string, any> = {}
  const allowedFields = ['name', 'bio', 'expertise', 'photo', 'linkedin', 'twitter', 'github', 'website', 'password']

  for (const field of allowedFields) {
    if (field in data) next[field] = data[field]
  }

  return next
}

async function ensureCurrentPassword(payload: any, actor: any, currentPassword: string) {
  if (!currentPassword) {
    throw new ApiError(400, 'Current password is required before changing your password.')
  }

  try {
    await payload.login({
      collection: actor.collection,
      data: {
        email: actor.record.email,
        password: currentPassword,
      },
    })
  } catch {
    throw new ApiError(400, 'Current password is incorrect.')
  }
}

async function findCollectionRecord(payload: any, collection: string, id: string) {
  return payload.findByID({
    collection: collection as any,
    id,
    depth: 0,
  })
}

async function ensureOwnedInstructorRecord(payload: any, actor: any, collection: string, id: string) {
  if (actor.isAdminLike) {
    return findCollectionRecord(payload, collection, id)
  }

  if (actor.collection !== 'instructors') {
    throw new ApiError(403, 'Only instructors can manage this record.')
  }

  if (collection === 'courses') {
    return requireInstructorCourseOwnership(payload, actor, id)
  }

  const doc = await findCollectionRecord(payload, collection, id)
  const courseId = normalizeRelationId(doc?.course)
  if (!courseId) {
    throw new ApiError(403, 'This record is not linked to a course.')
  }

  await requireInstructorCourseOwnership(payload, actor, courseId)
  return doc
}

async function ensureCanCreateOwnedInstructorRecord(payload: any, actor: any, collection: string, data: Record<string, any>) {
  if (actor.isAdminLike) {
    return data
  }

  if (actor.collection !== 'instructors') {
    throw new ApiError(403, 'Only instructors can create this record.')
  }

  if (collection === 'courses') {
    return { ...data, instructor: actor.record.id }
  }

  const courseId = normalizeRelationId(data?.course)
  if (!courseId) {
    throw new ApiError(400, 'course is required.')
  }

  await requireInstructorCourseOwnership(payload, actor, courseId)
  return data
}

async function handleLogin(payload: any, collection: 'users' | 'instructors', req: Request) {
  const { email, password } = await req.json()
  const normalizedEmail = String(email || '').trim().toLowerCase()

  const existing = await payload.find({
    collection,
    where: { email: { equals: normalizedEmail } },
    limit: 1,
    depth: 0,
  })

  const candidate = existing?.docs?.[0]

  if (!candidate) {
    throw new ApiError(404, 'Account not found.', 'AUTH_ACCOUNT_NOT_FOUND')
  }

  if (candidate?.status === 'suspended') {
    const message =
      collection === 'users'
        ? 'Your account has been suspended.'
        : 'Your instructor account has been suspended.'
    throw new ApiError(403, message)
  }

  const isPrivilegedUser = collection === 'users' && (candidate?.role === 'admin' || candidate?.role === 'staff')

  if (!candidate?.emailVerified && !isPrivilegedUser) {
    throw new ApiError(403, 'Verify your email before signing in. Check your inbox for the OTP code.')
  }

  if (collection === 'instructors' && candidate.status !== 'active') {
    throw new ApiError(403, 'Your instructor account is pending approval.')
  }

  try {
    const result = await payload.login({
      collection,
      data: { email: normalizedEmail, password },
    })

    return Response.json({ user: result.user, token: result.token })
  } catch {
    throw new ApiError(401, 'Invalid credentials. Check your email and password.')
  }
}

async function handle(req: Request) {
  const payload = await getCachedPayload()
  const url = new URL(req.url)
  const pathname = url.pathname.replace('/api/', '')
  const segments = pathname.split('/').filter(Boolean)
  const [collection, id, ...rest] = segments

  if (!collection) {
    return Response.json({ message: 'Not found.' }, { status: 404 })
  }

  try {
    if (rest.length === 0 && id === 'login' && req.method === 'POST' && (collection === 'users' || collection === 'instructors')) {
      return handleLogin(payload, collection, req)
    }

    if (req.method === 'POST' && !id && collection === 'users') {
      const data = await req.json()
      const doc = await payload.create({
        collection: 'users',
        data: sanitizeUserSignup(data),
      })
      return Response.json({ doc }, { status: 201 })
    }

    if (req.method === 'POST' && !id && collection === 'instructors') {
      const data = await req.json()
      const doc = await payload.create({
        collection: 'instructors',
        data: sanitizeInstructorSignup(data),
      })
      return Response.json({ doc }, { status: 201 })
    }

    if (rest.length === 0 && id === 'logout' && req.method === 'POST') {
      return Response.json({ success: true })
    }

    if (rest.length === 0 && id === 'me' && req.method === 'GET') {
      const actor = requireActor(await resolveRequestActor(req, payload))
      if (actor.collection !== collection) {
        throw new ApiError(403, 'Unauthorized.')
      }
      return Response.json({ user: actor.record })
    }

    if (collection === 'globals') {
      const slug = id
      if (!slug) {
        return Response.json({ message: 'Global slug is required.' }, { status: 400 })
      }

      if (req.method === 'GET') {
        if (!PUBLIC_GLOBAL_READS.has(slug)) {
          const actor = await resolveRequestActor(req, payload)
          requireActor(actor)
        }
        const doc = await payload.findGlobal({ slug: slug as any })
        return Response.json({ doc })
      }

      const actor = requireActor(await resolveRequestActor(req, payload))
      if (!actor.isAdminLike) {
        throw new ApiError(403, 'Only admin or staff users can update global content.')
      }

      if (req.method === 'POST' || req.method === 'PATCH') {
        const data = await req.json()
        const doc = await payload.updateGlobal({ slug: slug as any, data })
        return Response.json({ doc })
      }

      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    const actor = await resolveRequestActor(req, payload)
    const isPublicRead = req.method === 'GET' && PUBLIC_COLLECTION_READS.has(collection)

    if (!isPublicRead) {
      requireActor(actor)
    }

    if (req.method === 'GET' && !id) {
      const docs = await payload.find({
        collection: collection as any,
        ...buildFindOptions(url),
      })

      return Response.json({
        docs: docs.docs,
        totalDocs: docs.totalDocs,
        page: docs.page,
        totalPages: docs.totalPages,
      })
    }

    if (req.method === 'GET' && id) {
      const doc = await payload.findByID({
        collection: collection as any,
        id,
        depth: Number(url.searchParams.get('depth') || 0),
      })
      return Response.json({ doc })
    }

    if (req.method === 'POST' && !id) {
      const data = await req.json()

      const resolvedActor = requireActor(actor)

      if (OWNED_INSTRUCTOR_COLLECTIONS.has(collection)) {
        const nextData = await ensureCanCreateOwnedInstructorRecord(payload, resolvedActor, collection, data)
        const doc = await payload.create({
          collection: collection as any,
          data: nextData,
        })
        return Response.json({ doc }, { status: 201 })
      }

      if (!resolvedActor.isAdminLike) {
        throw new ApiError(403, 'You do not have permission to create this record.')
      }

      const doc = await payload.create({
        collection: collection as any,
        data,
      })
      return Response.json({ doc }, { status: 201 })
    }

    if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
      const resolvedActor = requireActor(actor)
      const data = await req.json()

      if (collection === 'users') {
        const isSelf = resolvedActor.collection === 'users' && String(resolvedActor.record.id) === String(id)
        if (!isSelf && !resolvedActor.isAdminLike) {
          throw new ApiError(403, 'You can only update your own user account.')
        }

        const nextData = isSelf && !resolvedActor.isAdminLike ? sanitizeSelfUserPatch(data) : data
        if ('password' in nextData && !resolvedActor.isAdminLike) {
          await ensureCurrentPassword(payload, resolvedActor, String(data?.currentPassword || ''))
        }

        const doc = await payload.update({
          collection: 'users',
          id,
          data: nextData,
        })
        return Response.json({ doc })
      }

      if (collection === 'instructors') {
        const isSelf = resolvedActor.collection === 'instructors' && String(resolvedActor.record.id) === String(id)
        if (!isSelf && !resolvedActor.isAdminLike) {
          throw new ApiError(403, 'You can only update your own instructor account.')
        }

        const nextData = isSelf && !resolvedActor.isAdminLike ? sanitizeSelfInstructorPatch(data) : data
        if ('password' in nextData && !resolvedActor.isAdminLike) {
          await ensureCurrentPassword(payload, resolvedActor, String(data?.currentPassword || ''))
        }

        const doc = await payload.update({
          collection: 'instructors',
          id,
          data: nextData,
        })
        return Response.json({ doc })
      }

      if (OWNED_INSTRUCTOR_COLLECTIONS.has(collection)) {
        await ensureOwnedInstructorRecord(payload, resolvedActor, collection, id)
        const nextData =
          collection === 'courses' && resolvedActor.collection === 'instructors' && !resolvedActor.isAdminLike
            ? { ...data, instructor: resolvedActor.record.id }
            : data

        const doc = await payload.update({
          collection: collection as any,
          id,
          data: nextData,
        })
        return Response.json({ doc })
      }

      if (!resolvedActor.isAdminLike) {
        throw new ApiError(403, 'You do not have permission to update this record.')
      }

      const doc = await payload.update({
        collection: collection as any,
        id,
        data,
      })
      return Response.json({ doc })
    }

    if (req.method === 'DELETE' && id) {
      const resolvedActor = requireActor(actor)

      if (collection === 'users' || collection === 'instructors' || OWNED_INSTRUCTOR_COLLECTIONS.has(collection)) {
        if (!resolvedActor.isAdminLike) {
          throw new ApiError(403, 'You do not have permission to delete this record.')
        }
      } else if (!resolvedActor.isAdminLike) {
        throw new ApiError(403, 'You do not have permission to delete this record.')
      }

      await payload.delete({
        collection: collection as any,
        id,
      })
      return Response.json({ success: true })
    }

    return Response.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API error:', error)
    return jsonError(error)
  }
}

export const GET = handle
export const POST = handle
export const PATCH = handle
export const DELETE = handle
export const PUT = handle

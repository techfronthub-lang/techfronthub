import { getCachedPayload } from '../../[...rest]/payload'
import {
  ApiError,
  coerceRelationshipId,
  normalizeRelationId,
  requirePaidEnrollment,
  requireUserActor,
  resolveRequestActor,
} from '@/app/api/_lib/auth'

function normalizeCompletedIndexes(value: any) {
  if (!Array.isArray(value)) return []

  return Array.from(
    new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item >= 0),
    ),
  ).sort((left, right) => left - right)
}

function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ message: error.message }, { status: error.status })
  }

  const message = error instanceof Error ? error.message : 'Error'
  return Response.json({ message }, { status: 400 })
}

export async function GET(req: Request) {
  try {
    const payload = await getCachedPayload()
    const actor = requireUserActor(await resolveRequestActor(req, payload))
    const url = new URL(req.url)
    const courseId = String(url.searchParams.get('courseId') || '').trim()

    if (courseId) {
      await requirePaidEnrollment(payload, String(actor.record.id), courseId)
      const result = await payload.find({
        collection: 'course-progress',
        where: {
          and: [
            { student: { equals: actor.record.id } },
            { course: { equals: courseId } },
          ],
        },
        limit: 1,
        depth: 1,
      })

      return Response.json({ doc: result?.docs?.[0] || null })
    }

    const result = await payload.find({
      collection: 'course-progress',
      where: {
        student: {
          equals: actor.record.id,
        },
      },
      limit: 200,
      depth: 1,
    })

    const docs = (result?.docs || []).filter((doc: any) => normalizeRelationId(doc?.student) === String(actor.record.id))
    return Response.json({ docs })
  } catch (error) {
    return jsonError(error)
  }
}

async function upsertProgress(req: Request) {
  const payload = await getCachedPayload()
  const actor = requireUserActor(await resolveRequestActor(req, payload))
  const body = await req.json()
  const courseId = String(body?.courseId || '').trim()

  if (!courseId) {
    throw new ApiError(400, 'courseId is required.')
  }

  await requirePaidEnrollment(payload, String(actor.record.id), courseId)

  const lastOpenedLessonIndex = Math.max(0, Number(body?.lastOpenedLessonIndex || 0))
  const completedLessonIndexes = normalizeCompletedIndexes(body?.completedLessonIndexes)
  const studentRelationId = coerceRelationshipId(actor.record.id)
  const courseRelationId = coerceRelationshipId(courseId)

  const existing = await payload.find({
    collection: 'course-progress',
    where: {
      and: [
        { student: { equals: actor.record.id } },
        { course: { equals: courseId } },
      ],
    },
    limit: 1,
    depth: 1,
  })

  if (existing?.docs?.[0]) {
    const doc = await payload.update({
      collection: 'course-progress',
      id: String(existing.docs[0].id),
      data: {
        lastOpenedLessonIndex,
        completedLessonIndexes,
      },
    })
    return Response.json({ doc })
  }

  const doc = await payload.create({
    collection: 'course-progress',
    data: {
      student: studentRelationId,
      course: courseRelationId,
      lastOpenedLessonIndex,
      completedLessonIndexes,
    },
  })

  return Response.json({ doc }, { status: 201 })
}

export const POST = upsertProgress
export const PATCH = upsertProgress

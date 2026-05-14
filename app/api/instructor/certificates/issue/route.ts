import { getCachedPayload } from '../../../[...rest]/payload'
import {
  ApiError,
  coerceRelationshipId,
  requireInstructorActor,
  requireInstructorCourseOwnership,
  resolveRequestActor,
} from '@/app/api/_lib/auth'

function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ message: error.message }, { status: error.status })
  }

  const message = error instanceof Error ? error.message : 'Error'
  return Response.json({ message }, { status: 400 })
}

function buildCertificateCode(courseId: string, studentId: string) {
  const stamp = Date.now().toString(36).toUpperCase()
  return `TFH-${String(courseId).toUpperCase()}-${String(studentId).toUpperCase()}-${stamp}`
}

export async function POST(req: Request) {
  try {
    const payload = await getCachedPayload()
    const actor = requireInstructorActor(await resolveRequestActor(req, payload))
    const body = await req.json()
    const courseId = String(body?.courseId || '').trim()
    const studentId = String(body?.studentId || '').trim()

    if (!courseId || !studentId) {
      throw new ApiError(400, 'courseId and studentId are required.')
    }

    const course = await requireInstructorCourseOwnership(payload, actor, courseId)
    const studentRelationId = coerceRelationshipId(studentId)
    const courseRelationId = coerceRelationshipId(courseId)
    const instructorRelationId = coerceRelationshipId(actor.record.id)

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

    if (!enrollment?.docs?.[0]) {
      throw new ApiError(403, 'This student is not enrolled in the selected course.')
    }

    const existing = await payload.find({
      collection: 'certificates',
      where: {
        and: [
          { student: { equals: studentId } },
          { course: { equals: courseId } },
        ],
      },
      limit: 1,
      depth: 2,
    })

    if (existing?.docs?.[0]) {
      return Response.json({ doc: existing.docs[0], existing: true })
    }

    const student = await payload.findByID({
      collection: 'users',
      id: studentId,
      depth: 0,
    })

    const doc = await payload.create({
      collection: 'certificates',
      data: {
        student: studentRelationId,
        course: courseRelationId,
        instructor: instructorRelationId,
        issuedAt: new Date().toISOString(),
        certificateCode: buildCertificateCode(courseId, studentId),
        studentName: student?.name || '',
        studentEmail: student?.email || '',
        courseTitle: course?.title || '',
      },
    })

    const created = await payload.findByID({
      collection: 'certificates',
      id: String(doc.id),
      depth: 2,
    })

    return Response.json({ doc: created, existing: false }, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}

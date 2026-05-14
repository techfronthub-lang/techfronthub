import { getCachedPayload } from '@/app/api/[...rest]/payload'
import {
  ApiError,
  requirePaidEnrollment,
  requireUserActor,
  resolveRequestActor,
} from '@/app/api/_lib/auth'

function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ message: error.message }, { status: error.status })
  }

  const message = error instanceof Error ? error.message : 'Failed to load lessons.'
  return Response.json({ message }, { status: 400 })
}

export async function GET(req: Request, context: any) {
  try {
    const payload = await getCachedPayload()
    const actor = requireUserActor(await resolveRequestActor(req, payload))
    const params = await context?.params
    const courseId = String(params?.id || '')

    if (!courseId) {
      throw new ApiError(400, 'Course ID is required.')
    }

    await requirePaidEnrollment(payload, String(actor.record.id), courseId)

    const [course, progressResult, certificateResult] = await Promise.all([
      payload.findByID({ collection: 'courses', id: courseId }),
      payload.find({
        collection: 'course-progress',
        where: {
          and: [
            { student: { equals: actor.record.id } },
            { course: { equals: courseId } },
          ],
        },
        limit: 1,
        depth: 0,
      }),
      payload.find({
        collection: 'certificates',
        where: {
          and: [
            { student: { equals: actor.record.id } },
            { course: { equals: courseId } },
          ],
        },
        limit: 1,
        depth: 1,
      }),
    ])

    return Response.json({
      id: course.id,
      title: course.title,
      desc: course.desc,
      duration: course.duration,
      courseContent: course.courseContent || [],
      progress: progressResult?.docs?.[0] || null,
      certificate: certificateResult?.docs?.[0] || null,
    })
  } catch (error) {
    return jsonError(error)
  }
}

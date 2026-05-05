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

export async function GET(req, context) {
  try {
    const token = getToken(req)
    if (!token) return Response.json({ message: 'Unauthorized.' }, { status: 401 })

    const decoded = decodeToken(token)
    const studentId = decoded?.id
    if (!studentId) return Response.json({ message: 'Invalid token.' }, { status: 401 })

    const params = await context?.params
    const courseId = String(params?.id || '')
    if (!courseId) return Response.json({ message: 'Course ID is required.' }, { status: 400 })

    const payload = await getPayload({ config })

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
    })

    if (!enrollment?.docs?.length) {
      return Response.json({ message: 'You are not enrolled in this course.' }, { status: 403 })
    }

    const course = await payload.findByID({ collection: 'courses', id: courseId })

    return Response.json({
      id: course.id,
      title: course.title,
      desc: course.desc,
      duration: course.duration,
      courseContent: course.courseContent || [],
    })
  } catch (err) {
    return Response.json({ message: err?.message || 'Failed to load lessons.' }, { status: 400 })
  }
}

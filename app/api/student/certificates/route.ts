import { getCachedPayload } from '../../[...rest]/payload'
import { ApiError, requireUserActor, resolveRequestActor } from '@/app/api/_lib/auth'

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

    const result = await payload.find({
      collection: 'certificates',
      where: {
        student: {
          equals: actor.record.id,
        },
      },
      limit: 200,
      depth: 2,
      sort: '-issuedAt',
    })

    return Response.json({ docs: result?.docs || [] })
  } catch (error) {
    return jsonError(error)
  }
}

import { getCachedPayload } from '../../[...rest]/payload'
import { ApiError } from '@/app/api/_lib/auth'

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

export async function POST(req: Request) {
  try {
    const payload = await getCachedPayload()
    const { email, password } = await req.json()
    const normalizedEmail = String(email || '').trim().toLowerCase()

    const existing = await payload.find({
      collection: 'instructors',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
      depth: 0,
    })

    const candidate = existing?.docs?.[0]

    if (!candidate) {
      throw new ApiError(404, 'Account not found.', 'AUTH_ACCOUNT_NOT_FOUND')
    }

    if (candidate.status === 'suspended') {
      throw new ApiError(403, 'Your instructor account has been suspended.')
    }

    if (candidate.status !== 'active') {
      throw new ApiError(403, 'Your instructor account is pending approval.')
    }

    try {
      const result = await payload.login({
        collection: 'instructors',
        data: { email: normalizedEmail, password },
      })

      return Response.json({ user: result.user, token: result.token })
    } catch {
      throw new ApiError(401, 'Invalid credentials. Check your email and password.')
    }
  } catch (error) {
    return jsonError(error)
  }
}

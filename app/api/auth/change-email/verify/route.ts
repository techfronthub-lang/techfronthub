import { getCachedPayload } from '@/app/api/[...rest]/payload'
import { ApiError, requireUserActor, resolveRequestActor } from '@/app/api/_lib/auth'
import { findAuthRecordByEmail, matchEmailChangeChallenge } from '@/src/lib/auth-email-change'
import { normalizeEmail } from '@/src/lib/email-challenges'

function jsonError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unable to verify email change.'
  const status = error instanceof ApiError ? error.status : 400
  return Response.json({ message }, { status })
}

async function ensureCurrentPassword(payload: any, email: string, password: string) {
  if (!password) {
    throw new ApiError(400, 'Current password is required.')
  }

  try {
    await payload.login({
      collection: 'users',
      data: { email, password },
    })
  } catch {
    throw new ApiError(400, 'Current password is incorrect.')
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getCachedPayload()
    const actor = requireUserActor(await resolveRequestActor(req, payload))
    const { code, token, currentPassword } = await req.json()
    const currentEmail = normalizeEmail(String(actor.record.email || ''))

    if (!code || !token) {
      throw new ApiError(400, 'Code and token are required.')
    }

    await ensureCurrentPassword(payload, currentEmail, String(currentPassword || ''))

    const challenge = matchEmailChangeChallenge({
      token: String(token),
      code: String(code),
      collection: 'users',
      userId: actor.record.id,
      currentEmail,
    })

    if (!challenge) {
      throw new ApiError(400, 'Invalid or expired OTP.')
    }

    const existing = await findAuthRecordByEmail(payload, challenge.nextEmail)
    if (existing && !(existing.collection === 'users' && String(existing.record.id) === String(actor.record.id))) {
      throw new ApiError(400, 'That email address is already in use.')
    }

    const updated = await payload.update({
      collection: 'users',
      id: String(actor.record.id),
      data: {
        email: challenge.nextEmail,
        emailVerified: true,
      },
      overrideAccess: true,
    })

    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: challenge.nextEmail,
        password: String(currentPassword),
      },
    })

    return Response.json({
      message: 'Email updated successfully.',
      user: updated,
      token: loginResult.token,
    })
  } catch (error) {
    console.error('Email change verification failed:', error)
    return jsonError(error)
  }
}

import { getCachedPayload } from '@/app/api/[...rest]/payload'
import { ApiError, requireUserActor, resolveRequestActor } from '@/app/api/_lib/auth'
import { sendEmailChangeOtp } from '@/src/lib/auth-email'
import { findAuthRecordByEmail, issueEmailChangeChallenge } from '@/src/lib/auth-email-change'
import { normalizeEmail } from '@/src/lib/email-challenges'

function jsonError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unable to request email change.'
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
    const { nextEmail, currentPassword } = await req.json()

    const normalizedNextEmail = normalizeEmail(String(nextEmail || ''))
    const currentEmail = normalizeEmail(String(actor.record.email || ''))

    if (!normalizedNextEmail) {
      throw new ApiError(400, 'New email is required.')
    }

    if (normalizedNextEmail === currentEmail) {
      throw new ApiError(400, 'Enter a different email address.')
    }

    await ensureCurrentPassword(payload, currentEmail, String(currentPassword || ''))

    const existing = await findAuthRecordByEmail(payload, normalizedNextEmail)
    if (existing && !(existing.collection === 'users' && String(existing.record.id) === String(actor.record.id))) {
      throw new ApiError(400, 'That email address is already in use.')
    }

    const challenge = issueEmailChangeChallenge({
      collection: 'users',
      userId: String(actor.record.id),
      currentEmail,
      nextEmail: normalizedNextEmail,
    })

    await sendEmailChangeOtp({
      record: {
        email: currentEmail,
        name: actor.record.name,
      },
      code: challenge.code,
      nextEmail: normalizedNextEmail,
      verifyUrl: `${(process.env.APP_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')}/student/dashboard/settings`,
    })

    return Response.json({
      message: 'An OTP has been sent to your new email address.',
      token: challenge.challengeToken,
      expiresAt: challenge.expiresAt,
    })
  } catch (error) {
    console.error('Email change request failed:', error)
    return jsonError(error)
  }
}

import { createPasswordResetChallenge } from '@/src/lib/auth-reset'
import { sendPasswordResetForRecord } from '@/src/lib/auth-email'

export async function POST(req: Request) {
  try {
    const { email, collection = 'auto' } = await req.json()

    if (!email) {
      return Response.json({ message: 'Email is required.' }, { status: 400 })
    }

    const challenge = await createPasswordResetChallenge({ email, collection })
    if (challenge) {
      await sendPasswordResetForRecord({
        record: challenge.record,
        code: challenge.challenge.code,
        resetUrl: challenge.resetUrl,
      })
    }

    return Response.json({
      message: 'If the account exists, a reset email has been sent.',
    })
  } catch (error: any) {
    console.error('Forgot password request failed:', error)
    return Response.json({ message: error?.message || 'Unable to request password reset.' }, { status: 400 })
  }
}

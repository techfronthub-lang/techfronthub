import { createEmailVerificationChallenge } from '@/src/lib/auth-verification'
import { sendEmailVerificationOtp } from '@/src/lib/auth-email'

export async function POST(req: Request) {
  try {
    const { email, collection = 'auto' } = await req.json()

    if (!email) {
      return Response.json({ message: 'Email is required.' }, { status: 400 })
    }

    const challenge = await createEmailVerificationChallenge({ email, collection })

    await sendEmailVerificationOtp({
      record: challenge.record,
      code: challenge.challenge.code,
      verifyUrl: challenge.verifyUrl,
      audience: challenge.collection === 'instructors' ? 'instructor' : 'student',
    })

    return Response.json({
      message: 'Verification code sent.',
      email: challenge.record.email,
      collection: challenge.collection,
      token: challenge.challenge.challengeToken,
      expiresAt: challenge.challenge.expiresAt,
    })
  } catch (error: any) {
    console.error('Send OTP request failed:', error)
    return Response.json({ message: error?.message || 'Unable to send verification code.' }, { status: 400 })
  }
}

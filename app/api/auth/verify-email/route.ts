import { applyEmailVerification } from '@/src/lib/auth-verification'

export async function POST(req: Request) {
  try {
    const { email, code, token, collection = 'auto' } = await req.json()

    if (!email || !code || !token) {
      return Response.json({ message: 'Email, code, and token are required.' }, { status: 400 })
    }

    const result = await applyEmailVerification({
      email,
      code,
      token,
      collection,
    })

    return Response.json({
      message: result.alreadyVerified ? 'Email already verified.' : 'Email verified successfully.',
      collection: result.collection,
      alreadyVerified: result.alreadyVerified,
    })
  } catch (error: any) {
    console.error('Email verification failed:', error)
    return Response.json({ message: error?.message || 'Email verification failed.' }, { status: 400 })
  }
}

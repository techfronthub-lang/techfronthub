import { applyPasswordReset } from '@/src/lib/auth-reset'

export async function POST(req: Request) {
  try {
    const { email, code, token, password, collection = 'auto' } = await req.json()

    if (!email || !code || !token || !password) {
      return Response.json({ message: 'Email, code, token, and password are required.' }, { status: 400 })
    }

    const result = await applyPasswordReset({
      email,
      code,
      token,
      password,
      collection,
    })

    return Response.json({
      message: 'Password updated successfully.',
      collection: result.collection,
    })
  } catch (error: any) {
    console.error('Password reset failed:', error)
    return Response.json({ message: error?.message || 'Password reset failed.' }, { status: 400 })
  }
}

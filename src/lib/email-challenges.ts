import crypto from 'crypto'

export type EmailChallengePurpose = 'email-otp' | 'password-reset'

export type EmailChallenge = {
  email: string
  code: string
  collection?: 'users' | 'instructors'
  exp: number
  nonce: string
  purpose: EmailChallengePurpose
}

const CHALLENGE_SECRET = process.env.EMAIL_TOKEN_SECRET || process.env.PAYLOAD_SECRET || 'dev-email-secret'

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function createEmailCode(length = 6) {
  let code = ''
  for (let i = 0; i < length; i += 1) {
    code += crypto.randomInt(0, 10).toString()
  }
  return code
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signPayload(payload: string) {
  return crypto.createHmac('sha256', CHALLENGE_SECRET).update(payload).digest('base64url')
}

export function issueEmailChallenge({
  email,
  purpose,
  collection,
  ttlMinutes = 15,
}: {
  email: string
  purpose: EmailChallengePurpose
  collection?: 'users' | 'instructors'
  ttlMinutes?: number
}) {
  const normalizedEmail = normalizeEmail(email)
  const code = createEmailCode()
  const challenge: EmailChallenge = {
    email: normalizedEmail,
    code,
    collection,
    exp: Date.now() + ttlMinutes * 60 * 1000,
    nonce: crypto.randomUUID(),
    purpose,
  }

  const payload = base64UrlEncode(JSON.stringify(challenge))
  const signature = signPayload(payload)

  return {
    challengeToken: `${payload}.${signature}`,
    code,
    expiresAt: challenge.exp,
  }
}

export function verifyEmailChallengeToken(token: string) {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expectedSignature = signPayload(payload)
  if (signature !== expectedSignature) return null

  try {
    const challenge = JSON.parse(base64UrlDecode(payload)) as EmailChallenge
    if (!challenge?.email || !challenge?.code || !challenge?.purpose) return null
    if (challenge.exp < Date.now()) return null
    return challenge
  } catch {
    return null
  }
}

export function matchChallenge(token: string, email: string, code: string, purpose: EmailChallengePurpose) {
  const challenge = verifyEmailChallengeToken(token)
  if (!challenge) return null
  if (challenge.purpose !== purpose) return null
  if (challenge.email !== normalizeEmail(email)) return null
  if (challenge.code !== code.trim()) return null
  return challenge
}

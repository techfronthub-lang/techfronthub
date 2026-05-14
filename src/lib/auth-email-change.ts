import crypto from 'crypto'
import { normalizeEmail, createEmailCode } from './email-challenges'

export type EmailChangeChallenge = {
  collection: 'users' | 'instructors'
  userId: string
  currentEmail: string
  nextEmail: string
  code: string
  exp: number
  nonce: string
}

const EMAIL_CHANGE_SECRET = process.env.EMAIL_TOKEN_SECRET || process.env.PAYLOAD_SECRET || 'dev-email-secret'

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signPayload(payload: string) {
  return crypto.createHmac('sha256', EMAIL_CHANGE_SECRET).update(payload).digest('base64url')
}

export function issueEmailChangeChallenge({
  collection,
  userId,
  currentEmail,
  nextEmail,
  ttlMinutes = 15,
}: {
  collection: 'users' | 'instructors'
  userId: string
  currentEmail: string
  nextEmail: string
  ttlMinutes?: number
}) {
  const challenge: EmailChangeChallenge = {
    collection,
    userId: String(userId),
    currentEmail: normalizeEmail(currentEmail),
    nextEmail: normalizeEmail(nextEmail),
    code: createEmailCode(),
    exp: Date.now() + ttlMinutes * 60 * 1000,
    nonce: crypto.randomUUID(),
  }

  const payload = base64UrlEncode(JSON.stringify(challenge))
  const signature = signPayload(payload)

  return {
    challengeToken: `${payload}.${signature}`,
    code: challenge.code,
    expiresAt: challenge.exp,
  }
}

export function verifyEmailChangeToken(token: string) {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expectedSignature = signPayload(payload)
  if (signature !== expectedSignature) return null

  try {
    const challenge = JSON.parse(base64UrlDecode(payload)) as EmailChangeChallenge
    if (!challenge?.userId || !challenge?.currentEmail || !challenge?.nextEmail || !challenge?.code || !challenge?.collection) {
      return null
    }
    if (challenge.exp < Date.now()) return null
    return challenge
  } catch {
    return null
  }
}

export function matchEmailChangeChallenge({
  token,
  code,
  collection,
  userId,
  currentEmail,
}: {
  token: string
  code: string
  collection: 'users' | 'instructors'
  userId: string | number
  currentEmail: string
}) {
  const challenge = verifyEmailChangeToken(token)
  if (!challenge) return null
  if (challenge.collection !== collection) return null
  if (challenge.userId !== String(userId)) return null
  if (challenge.currentEmail !== normalizeEmail(currentEmail)) return null
  if (challenge.code !== code.trim()) return null
  return challenge
}

export async function findAuthRecordByEmail(payload: any, email: string) {
  const normalizedEmail = normalizeEmail(email)

  for (const collection of ['users', 'instructors'] as const) {
    const result = await payload.find({
      collection,
      where: {
        email: {
          equals: normalizedEmail,
        },
      },
      limit: 1,
      depth: 0,
    })

    const record = result?.docs?.[0]
    if (record) {
      return { collection, record }
    }
  }

  return null
}

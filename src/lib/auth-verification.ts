import { getPayload } from 'payload'
import config from '@/payload.config'
import { issueEmailChallenge, matchChallenge, normalizeEmail } from './email-challenges'

const AUTH_COLLECTIONS = ['users', 'instructors'] as const

type AuthCollection = (typeof AUTH_COLLECTIONS)[number]

type AuthRecord = {
  id: string | number
  email: string
  name?: string | null
  role?: string | null
  status?: string | null
  emailVerified?: boolean | null
}

function getAppUrl() {
  return (process.env.APP_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}

async function getPayloadClient() {
  return getPayload({ config })
}

async function findRecordByEmail(payload: Awaited<ReturnType<typeof getPayloadClient>>, collection: AuthCollection, email: string) {
  const result = await payload.find({
    collection,
    where: {
      email: {
        equals: normalizeEmail(email),
      },
    },
    limit: 1,
    depth: 0,
  })

  return result?.docs?.[0] as AuthRecord | undefined
}

export async function resolveVerificationTarget(email: string, collection?: AuthCollection | 'auto') {
  const payload = await getPayloadClient()
  const normalizedEmail = normalizeEmail(email)
  const searchOrder: AuthCollection[] = collection && collection !== 'auto' ? [collection] : [...AUTH_COLLECTIONS]

  for (const currentCollection of searchOrder) {
    const record = await findRecordByEmail(payload, currentCollection, normalizedEmail)
    if (record) {
      return { payload, collection: currentCollection, record }
    }
  }

  return { payload, collection: null, record: null }
}

export async function createEmailVerificationChallenge({
  email,
  collection,
}: {
  email: string
  collection?: AuthCollection | 'auto'
}) {
  const target = await resolveVerificationTarget(email, collection)
  if (!target.record || !target.collection) {
    throw new Error('No account found for that email address.')
  }

  if (target.record.emailVerified) {
    throw new Error('This email is already verified.')
  }

  const challenge = issueEmailChallenge({
    email: target.record.email,
    purpose: 'email-otp',
    collection: target.collection,
  })

  return {
    ...target,
    challenge,
    verifyUrl: `${getAppUrl()}/verify-email?email=${encodeURIComponent(target.record.email)}&collection=${target.collection}&token=${encodeURIComponent(challenge.challengeToken)}`,
  }
}

export async function applyEmailVerification({
  email,
  code,
  token,
  collection,
}: {
  email: string
  code: string
  token: string
  collection?: AuthCollection | 'auto'
}) {
  const challenge = matchChallenge(token, email, code, 'email-otp')
  if (!challenge) {
    throw new Error('Invalid or expired verification code.')
  }

  const target = await resolveVerificationTarget(email, collection || challenge.collection || 'auto')
  if (!target.record || !target.collection) {
    throw new Error('No account found for that email address.')
  }

  if (normalizeEmail(target.record.email) !== challenge.email) {
    throw new Error('Verification code does not match the account.')
  }

  if (target.record.emailVerified) {
    return {
      collection: target.collection,
      user: target.record,
      alreadyVerified: true,
    }
  }

  const updated = await target.payload.update({
    collection: target.collection,
    id: String(target.record.id),
    data: { emailVerified: true },
    overrideAccess: true,
  })

  return {
    collection: target.collection,
    user: updated,
    alreadyVerified: false,
  }
}

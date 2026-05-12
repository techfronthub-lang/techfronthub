type AuthEmailAudience = 'student' | 'instructor'

type AuthEmailRecord = {
  email: string
  name?: string | null
  role?: string | null
  status?: string | null
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || 'no-reply@example.com'
}

function buildDisplayName(record: AuthEmailRecord) {
  return record.name?.trim() || record.email
}

async function sendResendMessage({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set; skipping auth email send')
    return { skipped: true }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to,
      subject,
      html,
      text,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Resend email failed: ${response.status} ${errorText}`.trim())
  }

  return response.json().catch(() => ({ ok: true }))
}

export async function sendWelcomeForRecord(record: AuthEmailRecord & { audience: AuthEmailAudience }) {
  const displayName = buildDisplayName(record)
  const subject = record.audience === 'instructor' ? 'Instructor account created' : 'Welcome to TECHFRONT HUB'
  const text =
    record.audience === 'instructor'
      ? `Hi ${displayName}, your instructor account has been created.`
      : `Hi ${displayName}, welcome to TECHFRONT HUB.`
  const html = `<p>Hi ${displayName},</p><p>${record.audience === 'instructor' ? 'Your instructor account has been created.' : 'Welcome to TECHFRONT HUB.'}</p>`

  return sendResendMessage({
    to: record.email,
    subject,
    html,
    text,
  })
}

export async function sendAdminSignupAlert(record: AuthEmailRecord) {
  const displayName = buildDisplayName(record)
  const subject = `New ${record.role || 'student'} signup`
  const text = `New account created for ${displayName} (${record.email}). Status: ${record.status || 'active'}.`
  const html = `<p>New account created for <strong>${displayName}</strong> (${record.email}).</p><p>Status: ${record.status || 'active'}.</p>`

  return sendResendMessage({
    to: process.env.ADMIN_ALERT_EMAIL || getFromAddress(),
    subject,
    html,
    text,
  })
}


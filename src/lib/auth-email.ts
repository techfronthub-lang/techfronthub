type AuthEmailAudience = 'student' | 'instructor'

type AuthEmailRecord = {
  email: string
  name?: string | null
  role?: string | null
  status?: string | null
}

type CoursePurchaseEmailRecord = AuthEmailRecord & {
  courseTitle: string
  amountNaira: number
  reference: string
  dashboardUrl?: string
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || 'no-reply@example.com'
}

function getAppUrl() {
  return (process.env.APP_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function buildDisplayName(record: AuthEmailRecord) {
  return record.name?.trim() || record.email
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(amount)
}

function buildEmailShell({
  preheader,
  title,
  body,
  ctaLabel,
  ctaUrl,
  code,
  note,
}: {
  preheader: string
  title: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
  code?: string
  note?: string
}) {
  const button = ctaLabel && ctaUrl
    ? `<p style="margin:28px 0 0"><a href="${ctaUrl}" style="display:inline-block;background:#0b84df;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:14px;font-weight:800"> ${ctaLabel} </a></p>`
    : ''
  const codeBlock = code
    ? `<div style="margin:24px 0 0;padding:16px 18px;border-radius:16px;background:#eaf6ff;border:1px solid rgba(11,132,223,0.18);font-size:26px;letter-spacing:0.28em;font-weight:800;color:#0669bd;text-align:center">${code}</div>`
    : ''
  const noteBlock = note ? `<p style="margin:20px 0 0;color:#6b7f95;font-size:13px;line-height:1.7">${note}</p>` : ''

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f9ff;font-family:Arial,Helvetica,sans-serif;color:#10233f">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
    <div style="padding:32px 16px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid rgba(93,125,160,0.18);border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(16,35,63,0.12)">
        <div style="background:linear-gradient(135deg,#0b84df 0%,#0669bd 100%);padding:26px 28px;color:#ffffff">
          <div style="font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;opacity:.92">TECHFRONT HUB</div>
          <div style="margin-top:8px;font-size:26px;line-height:1.15;font-weight:800">${title}</div>
        </div>
        <div style="padding:30px 28px 34px">
          <p style="margin:0;font-size:16px;line-height:1.75;color:#53657a">${body}</p>
          ${codeBlock}
          ${button}
          ${noteBlock}
        </div>
      </div>
    </div>
  </body>
</html>`
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
  const subject = record.audience === 'instructor' ? 'Teacher email verified' : 'Welcome to TECHFRONT HUB'
  const text =
    record.audience === 'instructor'
      ? `Hi ${displayName}, your email has been verified. Your teacher account is now waiting for admin approval.`
      : `Hi ${displayName}, welcome to TECHFRONT HUB.`
  const html = buildEmailShell({
    preheader: record.audience === 'instructor' ? 'Your teacher email has been verified.' : 'Your TECHFRONT HUB account is ready.',
    title: record.audience === 'instructor' ? 'Teacher email verified' : 'Welcome to TECHFRONT HUB',
    body:
      record.audience === 'instructor'
        ? `Hi ${displayName}, your email has been verified successfully. Your teacher account will remain pending until an admin approves it for portal access.`
        : `Hi ${displayName}, your learner account is ready and you can sign in to continue learning.`,
    ctaLabel: 'Open platform',
    ctaUrl: `${getAppUrl()}/login`,
  })

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
  const html = buildEmailShell({
    preheader: 'A new account was created on TECHFRONT HUB.',
    title: 'New signup alert',
    body: `New account created for ${displayName} (${record.email}). Status: ${record.status || 'active'}.`,
    note: 'This notification is sent to the admin inbox so new registrations can be reviewed quickly.',
  })

  return sendResendMessage({
    to: process.env.ADMIN_ALERT_EMAIL || getFromAddress(),
    subject,
    html,
    text,
  })
}

export async function sendPasswordResetForRecord({
  record,
  code,
  resetUrl,
}: {
  record: AuthEmailRecord
  code: string
  resetUrl: string
}) {
  const displayName = buildDisplayName(record)
  const subject = 'Reset your TECHFRONT HUB password'
  const text = `Hi ${displayName}, use code ${code} to reset your password: ${resetUrl}`
  const html = buildEmailShell({
    preheader: 'Use this code to reset your TECHFRONT HUB password.',
    title: 'Password reset request',
    body: `Hi ${displayName}, we received a request to reset your password. Use the code below on the reset screen, then follow the button if you need to reopen the form.`,
    ctaLabel: 'Reset password',
    ctaUrl: resetUrl,
    code,
    note: 'If you did not request this, ignore the message and your password will remain unchanged.',
  })

  return sendResendMessage({
    to: record.email,
    subject,
    html,
    text,
  })
}

export async function sendEmailVerificationOtp({
  record,
  code,
  verifyUrl,
  audience,
}: {
  record: AuthEmailRecord
  code: string
  verifyUrl: string
  audience: AuthEmailAudience
}) {
  const displayName = buildDisplayName(record)
  const subject = audience === 'instructor' ? 'Verify your teacher account' : 'Verify your TECHFRONT HUB account'
  const text = `Hi ${displayName}, use code ${code} to verify your email address: ${verifyUrl}`
  const html = buildEmailShell({
    preheader: 'Use this code to verify your TECHFRONT HUB email address.',
    title: audience === 'instructor' ? 'Verify your teacher account' : 'Verify your email address',
    body:
      audience === 'instructor'
        ? `Hi ${displayName}, confirm your email address with the code below. Your teacher account will stay pending until an admin approves it after verification.`
        : `Hi ${displayName}, confirm your email address with the code below so you can sign in and continue with your learner account.`,
    ctaLabel: 'Open verification screen',
    ctaUrl: verifyUrl,
    code,
    note: 'This code expires in 15 minutes. If you did not create this account, you can ignore this email.',
  })

  return sendResendMessage({
    to: record.email,
    subject,
    html,
    text,
  })
}

export async function sendCoursePurchaseConfirmation(record: CoursePurchaseEmailRecord) {
  const displayName = buildDisplayName(record)
  const subject = `Purchase confirmed: ${record.courseTitle}`
  const text = `Hi ${displayName}, your purchase for ${record.courseTitle} has been confirmed. Amount paid: ${formatNaira(record.amountNaira)}. Reference: ${record.reference}.`
  const html = buildEmailShell({
    preheader: 'Your course purchase is confirmed.',
    title: 'Purchase confirmed',
    body: `Hi ${displayName}, your payment for ${record.courseTitle} has been confirmed. Amount paid: ${formatNaira(record.amountNaira)}. Your enrollment is now active.`,
    ctaLabel: 'Open my courses',
    ctaUrl: record.dashboardUrl || `${getAppUrl()}/student/dashboard/courses`,
    note: `Payment reference: ${record.reference}`,
  })

  return sendResendMessage({
    to: record.email,
    subject,
    html,
    text,
  })
}

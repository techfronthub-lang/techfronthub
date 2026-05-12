type EmailAddress = string | string[]

type SendEmailOptions = {
  from?: string
  to: EmailAddress
  subject: string
  html?: string
  text?: string
  replyTo?: string
}

function normalizeRecipient(value: EmailAddress) {
  return Array.isArray(value) ? value : [value]
}

async function postResendEmail(message: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY
  const from = message.from || process.env.RESEND_FROM_EMAIL || 'no-reply@example.com'

  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set; skipping email send')
    return { skipped: true }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: normalizeRecipient(message.to),
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: message.replyTo,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Resend email failed: ${response.status} ${errorText}`.trim())
  }

  return response.json().catch(() => ({ ok: true }))
}

export const resendEmailAdapter = () => ({
  defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'no-reply@example.com',
  defaultFromName: 'TECHFRONT HUB',
  name: 'resend',
  sendEmail: postResendEmail,
})


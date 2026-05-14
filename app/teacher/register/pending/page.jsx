'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  pageShellStyle,
  getFormPanelStyle,
  formHeaderStyle,
  brandStyle,
  brandMarkStyle,
  brandTextStyle,
  formTitleStyle,
  formBodyStyle,
  footerStyle,
  footerLinkStyle,
} from '@/src/lib/auth-theme'

export default function TeacherRegisterPendingPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const verified = searchParams.get('verified') === '1'

  return (
    <div style={pageShellStyle}>
      <section style={{ ...getFormPanelStyle(true), maxWidth: 620 }}>
        <div style={formHeaderStyle}>
          <div style={brandStyle}>
            <span style={brandMarkStyle}>TF</span>
            <span style={brandTextStyle}>Teacher Registration</span>
          </div>
          <h1 style={formTitleStyle}>Application received</h1>
          <p style={formBodyStyle}>
            {verified
              ? 'Your email has been verified. An admin has been notified and will review the application before portal access is enabled.'
              : 'Your instructor account was created in a pending state. Verify your email, then wait for admin review before portal access is enabled.'}
          </p>
        </div>

        <div style={{ borderRadius: 18, padding: 18, background: 'rgba(234,246,255,0.78)', border: '1px solid rgba(11,132,223,0.12)', color: '#10233f', lineHeight: 1.75 }}>
          <strong style={{ display: 'block', marginBottom: 8 }}>Next steps</strong>
          <div>{verified ? 'If approved, you will sign in with the same credentials you just created.' : 'Check your email for the OTP verification code before trying to sign in.'}</div>
          {email ? <div style={{ marginTop: 8 }}>Application email: <strong>{email}</strong></div> : null}
          <div style={{ marginTop: 8 }}>Pending and suspended instructor accounts cannot enter the teacher portal.</div>
        </div>

        <div style={{ ...footerStyle, justifyContent: 'space-between', marginTop: 20, gap: 12, flexWrap: 'wrap' }}>
          <Link href="/login" style={footerLinkStyle}>Go to login</Link>
          <Link href="/student/register" style={footerLinkStyle}>Register as learner instead</Link>
        </div>
      </section>
    </div>
  )
}

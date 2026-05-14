'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  pageShellStyle,
  getFormPanelStyle,
  brandStyle,
  brandMarkStyle,
  brandTextStyle,
  formTitleStyle,
  formBodyStyle,
  formStyle,
  fieldStyle,
  labelStyle,
  inputStyle,
  submitStyle,
  errorStyle,
  messageStyle,
  footerStyle,
  footerLinkStyle,
} from '@/src/lib/auth-theme'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const initialCollection = searchParams.get('collection') || 'users'
  const initialToken = searchParams.get('token') || ''
  const accountLabel = useMemo(() => (initialCollection === 'instructors' ? 'teacher' : 'learner'), [initialCollection])

  const [email, setEmail] = useState(initialEmail)
  const [collection, setCollection] = useState(initialCollection)
  const [token, setToken] = useState(initialToken)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(initialToken ? 'Enter the code from your email to finish verification.' : '')

  async function handleVerify(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, token, collection }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Unable to verify email.')

      if (collection === 'instructors') {
        router.push(`/teacher/register/pending?email=${encodeURIComponent(email)}&verified=1`)
        return
      }

      router.push(`/login?verified=1&email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err.message || 'Unable to verify email.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, collection }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Unable to resend verification code.')

      setToken(data.token || '')
      setMessage('A fresh verification code has been sent to your inbox.')
    } catch (err) {
      setError(err.message || 'Unable to resend verification code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={pageShellStyle}>
      <section style={cardStyle}>
        <div style={brandStyle}>
          <span style={brandMarkStyle}>TF</span>
          <span style={brandTextStyle}>Email Verification</span>
        </div>
        <h1 style={formTitleStyle}>Verify your {accountLabel} account</h1>
        <p style={formBodyStyle}>
          Enter the 6-digit code sent to your inbox. {collection === 'instructors' ? 'Teacher accounts remain pending until admin approval after verification.' : 'You must verify your email before signing in.'}
        </p>

        <form onSubmit={handleVerify} style={formStyle}>
          <label style={fieldStyle}>
            <span style={labelStyle}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              required
              disabled={loading || resending}
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>Account type</span>
            <select value={collection} onChange={(event) => setCollection(event.target.value)} style={inputStyle} disabled={loading || resending}>
              <option value="users">Learner</option>
              <option value="instructors">Teacher</option>
            </select>
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              style={inputStyle}
              required
              disabled={loading}
            />
          </label>

          {error ? <div style={errorStyle}>{error}</div> : null}
          {message ? <div style={messageStyle}>{message}</div> : null}

          <button type="submit" className="btn btn-primary" style={submitStyle} disabled={loading || !email || !code || !token}>
            {loading ? 'Verifying email...' : 'Verify email'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
          <button
            type="button"
            className="btn"
            onClick={handleResend}
            disabled={resending || loading || !email}
            style={{ ...submitStyle, background: '#eaf3ff', color: '#0b4f8a', boxShadow: 'none', width: 'auto', paddingInline: 20 }}
          >
            {resending ? 'Sending code...' : 'Resend code'}
          </button>
          <div style={footerStyle}>
            <Link href="/login" style={footerLinkStyle}>Back to login</Link>
            <Link href="/student/register" style={footerLinkStyle}>Create account</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const cardStyle = {
  width: '100%',
  maxWidth: '560px',
  margin: '0 auto',
  background: getFormPanelStyle(true).background,
  borderRadius: '26px',
  padding: '32px',
  border: '1px solid rgba(93, 125, 160, 0.18)',
  boxShadow: '0 30px 84px rgba(16, 35, 63, 0.14)',
  color: '#10233f',
}

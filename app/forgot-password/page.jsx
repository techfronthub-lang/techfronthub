'use client'

import { useState } from 'react'
import Link from 'next/link'
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [collection, setCollection] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, collection }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Unable to request password reset.')
      setMessage('If the account exists, check your inbox for the reset code and link.')
    } catch (err) {
      setError(err.message || 'Unable to request password reset.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={pageShellStyle}>
      <section style={cardStyle}>
        <div style={brandStyle}>
          <span style={brandMarkStyle}>TF</span>
          <span style={brandTextStyle}>Account Recovery</span>
        </div>
        <h1 style={formTitleStyle}>Forgot your password?</h1>
        <p style={formBodyStyle}>Enter your email and we will send a reset link plus code to your inbox.</p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label style={fieldStyle}>
            <span style={labelStyle}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              required
              disabled={loading}
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>Account type</span>
            <select value={collection} onChange={(event) => setCollection(event.target.value)} style={inputStyle} disabled={loading}>
              <option value="auto">Auto-detect</option>
              <option value="users">Learner</option>
              <option value="instructors">Teacher</option>
            </select>
          </label>

          {error ? <div style={errorStyle}>{error}</div> : null}
          {message ? <div style={messageStyle}>{message}</div> : null}

          <button type="submit" className="btn btn-primary" style={submitStyle} disabled={loading || !email}>
            {loading ? 'Sending reset email...' : 'Send reset link'}
          </button>
        </form>

        <div style={footerStyle}>
          <Link href="/login" style={footerLinkStyle}>Back to login</Link>
          <Link href="/student/register" style={footerLinkStyle}>Create account</Link>
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

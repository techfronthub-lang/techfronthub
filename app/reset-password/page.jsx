'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  pageShellStyle as pageStyle,
  getFormPanelStyle,
  brandStyle,
  brandMarkStyle,
  brandTextStyle,
  formStyle,
  fieldStyle,
  labelStyle,
  inputStyle,
  submitStyle as buttonStyle,
  errorStyle,
  messageStyle,
  footerStyle,
  footerLinkStyle,
  formTitleStyle as titleStyle,
  formBodyStyle as bodyStyle,
} from '@/src/lib/auth-theme'

const STORAGE_PREFIX = 'techfront-reset'

function getStorageKey(email, collection) {
  return `${STORAGE_PREFIX}:${collection || 'auto'}:${(email || '').trim().toLowerCase()}`
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [collection, setCollection] = useState(searchParams.get('collection') || 'auto')
  const [code, setCode] = useState('')
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const nextEmail = searchParams.get('email') || ''
    const nextCollection = searchParams.get('collection') || 'auto'
    const nextToken = searchParams.get('token') || ''

    if (nextEmail) setEmail(nextEmail)
    if (nextCollection) setCollection(nextCollection)
    if (nextToken) setToken(nextToken)
  }, [searchParams])

  useEffect(() => {
    if (!email) return
    const savedToken = sessionStorage.getItem(getStorageKey(email, collection))
    if (savedToken) setToken(savedToken)
  }, [email, collection])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          token,
          password,
          collection: collection === 'auto' ? undefined : collection,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Password reset failed.')

      sessionStorage.removeItem(getStorageKey(email, collection))
      setMessage('Password updated. You can sign in now.')
      setTimeout(() => router.push(`/login?email=${encodeURIComponent(email)}`), 900)
    } catch (err) {
      setError(err.message || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={pageStyle}>
      <section style={cardStyle}>
        <div style={brandStyle}>
          <span style={brandMarkStyle}>TF</span>
          <span style={brandTextStyle}>Password Reset</span>
        </div>
        <h1 style={titleStyle}>Create a new password</h1>
        <p style={bodyStyle}>Use the code sent to your inbox to confirm the reset, then choose a new password.</p>

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

          <label style={fieldStyle}>
            <span style={labelStyle}>Reset code</span>
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="000000"
              style={inputStyle}
              inputMode="numeric"
              required
              disabled={loading}
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              style={inputStyle}
              required
              disabled={loading}
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              style={inputStyle}
              required
              disabled={loading}
            />
          </label>

          {error ? <div style={errorStyle}>{error}</div> : null}
          {message ? <div style={messageStyle}>{message}</div> : null}

          <button type="submit" className="btn btn-primary" style={buttonStyle} disabled={loading || !email || !code || !password || !confirmPassword}>
            {loading ? 'Updating password...' : 'Reset password'}
          </button>
        </form>

        <div style={footerStyle}>
          <Link href="/login" style={footerLinkStyle}>Back to login</Link>
          <Link href="/forgot-password" style={footerLinkStyle}>Request another code</Link>
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
  borderRadius: '30px',
  padding: '32px',
  border: '1px solid rgba(148, 163, 184, 0.16)',
  boxShadow: '0 30px 90px rgba(2, 6, 23, .35)',
  color: '#f8fafc',
}

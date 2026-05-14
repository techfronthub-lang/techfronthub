'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthSidePanel } from '@/src/components/AuthSidePanel'
import { loginWithSmartRouting, resolveExistingSession } from '@/src/lib/smart-auth'
import {
  pageShellStyle,
  loadingCardStyle,
  getSplitLayoutStyle,
  getFormPanelStyle,
  formHeaderStyle,
  brandStyle,
  brandMarkStyle,
  brandTextStyle,
  formTitleStyle,
  formBodyStyle,
  formStyle,
  fieldStyle,
  labelStyle,
  inputStyle,
  passwordWrapStyle,
  toggleStyle,
  submitStyle,
  errorStyle,
  messageStyle,
  footerStyle,
  footerLinkStyle,
} from '@/src/lib/auth-theme'

export default function SmartLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const verified = searchParams.get('verified') === '1'
  const verifiedEmail = searchParams.get('email') || ''

  useEffect(() => {
    if (verifiedEmail) {
      setEmail(verifiedEmail)
    }
  }, [verifiedEmail])

  useEffect(() => {
    let cancelled = false

    resolveExistingSession()
      .then((destination) => {
        if (cancelled) return
        if (destination) {
          router.replace(destination)
          return
        }
        setCheckingSession(false)
      })
      .catch(() => {
        if (!cancelled) setCheckingSession(false)
      })

    return () => {
      cancelled = true
    }
  }, [router])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)')
    const sync = () => setIsCompact(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginWithSmartRouting(email, password)
      router.replace(result.destination)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div style={pageShellStyle}>
        <div style={loadingCardStyle}>Checking your session...</div>
      </div>
    )
  }

  return (
    <div style={pageShellStyle}>
      <div style={getSplitLayoutStyle(isCompact, 'minmax(380px, 0.9fr)')}>
        <AuthSidePanel
          image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
          badge="Student access"
        />

        <section style={getFormPanelStyle(isCompact)}>
          <div style={formHeaderStyle}>
            <div style={brandStyle}>
              <span style={brandMarkStyle}>TF</span>
              <span style={brandTextStyle}>Platform Access</span>
            </div>
            <h2 style={formTitleStyle}>Sign in</h2>
            <p style={formBodyStyle}>Enter your email and password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} style={formStyle}>
            {error ? <div style={errorStyle}>{error}</div> : null}
            {verified ? <div style={messageStyle}>Email verified. You can sign in now.</div> : null}

            <label style={fieldStyle}>
              <span style={labelStyle}>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                disabled={loading}
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Password</span>
              <div style={passwordWrapStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: 56 }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  style={toggleStyle}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div style={{ marginTop: '-6px', display: 'flex', justifyContent: 'flex-end' }}>
              <Link href="/forgot-password" style={footerLinkStyle}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !email || !password}
              style={submitStyle}
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          <div style={{ ...footerStyle, justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span>New learner? <Link href="/student/register" style={footerLinkStyle}>Create student account</Link></span>
            <Link href="/teacher/register" style={footerLinkStyle}>Apply as a teacher</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

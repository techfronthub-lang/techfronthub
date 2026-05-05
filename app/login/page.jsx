'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthShowcase } from '@/src/components/AuthShowcase'
import { loginWithSmartRouting, resolveExistingSession } from '@/src/lib/smart-auth'

const loginBullets = [
  'Learn from guided programs, practical lessons, and instructor-led cohorts.',
  'Track your coursework, manage your classes, and access certificates in one place.',
  'The platform routes each account to the correct dashboard automatically after sign-in.',
]

export default function SmartLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isCompact, setIsCompact] = useState(false)

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
      <div style={getLayoutStyle(isCompact)}>
        <AuthShowcase
          mode="login"
          eyebrow="Learning Platform"
          title="Continue learning, teaching, or managing from one secure portal."
          body="Access your TECHFRONT HUB workspace to watch lessons, manage cohorts, monitor progress, and retrieve course completion certificates."
          bullets={loginBullets}
        />

        <section style={getFormPanelStyle(isCompact)}>
          <div style={formHeaderStyle}>
            <div style={brandStyle}>
              <span style={brandMarkStyle}>TF</span>
              <span style={brandTextStyle}>Platform Access</span>
            </div>
            <h2 style={formTitleStyle}>Sign in</h2>
            <p style={formBodyStyle}>
              Enter your details to continue to your dashboard, classes, certificates, and account tools.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={formStyle}>
            {error ? <div style={errorStyle}>{error}</div> : null}

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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !email || !password}
              style={submitStyle}
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          <div style={footerStyle}>
            <span>New to the platform?</span>
            <Link href="/student/register" style={footerLinkStyle}>Create an account</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

const pageShellStyle = {
  padding: '32px 24px 56px',
}

function getLayoutStyle(isCompact) {
  return {
    width: '100%',
    maxWidth: '1240px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: isCompact ? '1fr' : 'minmax(0, 1.1fr) minmax(380px, 0.9fr)',
    borderRadius: isCompact ? '22px' : '28px',
    overflow: 'hidden',
    boxShadow: '0 28px 80px rgba(2, 6, 23, 0.18)',
    background: 'rgba(255,255,255,0.92)',
    minHeight: isCompact ? 'auto' : 'calc(100vh - 220px)',
  }
}

function getFormPanelStyle(isCompact) {
  return {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: isCompact ? '28px 24px 32px' : '48px clamp(24px, 4vw, 52px)',
    color: '#0f172a',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,243,234,0.98))',
  }
}

const formHeaderStyle = { marginBottom: '28px' }
const brandStyle = { display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }
const brandMarkStyle = {
  width: '42px',
  height: '42px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #ea580c, #0f172a)',
  color: '#fff',
  fontWeight: 800,
  letterSpacing: '0.06em',
}
const brandTextStyle = {
  fontSize: '14px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: '#475569',
}
const formTitleStyle = { margin: '0 0 10px', fontSize: '40px', lineHeight: 1, letterSpacing: '-0.04em' }
const formBodyStyle = { margin: 0, color: '#64748b', fontSize: '16px', lineHeight: 1.7 }
const formStyle = { display: 'grid', gap: '18px' }
const fieldStyle = { display: 'grid', gap: '8px' }
const labelStyle = { fontSize: '14px', fontWeight: 700, color: '#334155' }
const inputStyle = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.85)',
  color: '#0f172a',
  padding: '14px 16px',
  fontSize: '15px',
  outline: 'none',
}
const passwordWrapStyle = { position: 'relative' }
const toggleStyle = {
  position: 'absolute',
  top: '50%',
  right: '12px',
  transform: 'translateY(-50%)',
  border: 0,
  background: 'transparent',
  color: '#2563eb',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
}
const submitStyle = { justifyContent: 'center', width: '100%', marginTop: '8px', padding: '14px 18px', borderRadius: '16px' }
const errorStyle = {
  borderRadius: '16px',
  border: '1px solid rgba(220, 38, 38, 0.18)',
  background: 'rgba(254, 226, 226, 0.9)',
  color: '#b91c1c',
  padding: '14px 16px',
  fontSize: '14px',
}
const footerStyle = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '22px', color: '#64748b', fontSize: '14px' }
const footerLinkStyle = { color: '#1d4ed8', textDecoration: 'none', fontWeight: 700 }
const loadingCardStyle = {
  minWidth: '320px',
  maxWidth: '420px',
  margin: '72px auto',
  padding: '24px 28px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.92)',
  color: '#0f172a',
  boxShadow: '0 20px 60px rgba(2, 6, 23, 0.18)',
}

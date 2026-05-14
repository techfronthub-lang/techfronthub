'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { storeUserSession } from '@/src/lib/smart-auth'
import { pageBg, shell, card, primaryButton, successAlert, errorAlert } from '../_components/ui'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('payload-token') : ''
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

function Alert({ message, tone = 'success' }) {
  if (!message) return null
  return <div style={tone === 'success' ? successAlert : errorAlert}>{message}</div>
}

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileForm, setProfileForm] = useState({ name: '' })
  const [emailForm, setEmailForm] = useState({ nextEmail: '', currentPassword: '', code: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [emailToken, setEmailToken] = useState('')
  const [profileNotice, setProfileNotice] = useState({ tone: 'success', message: '' })
  const [emailNotice, setEmailNotice] = useState({ tone: 'success', message: '' })
  const [passwordNotice, setPasswordNotice] = useState({ tone: 'success', message: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [requestingOtp, setRequestingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const token = localStorage.getItem('payload-token')
        if (!token) {
          router.push('/login')
          return
        }

        const res = await fetch('/api/users/me', { headers: { Authorization: `JWT ${token}` } })
        const data = await res.json().catch(() => ({}))
        if (!active) return

        if (!res.ok) {
          router.push('/login')
          return
        }

        const me = data?.user ?? data
        setUser(me)
        setProfileForm({ name: me?.name || '' })
        setEmailForm(prev => ({ ...prev, nextEmail: me?.email || '' }))
        setLoading(false)
      } catch {
        if (!active) return
        setError('Failed to load settings.')
        setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [router])

  function updateProfileField(event) {
    const { name, value } = event.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  function updateEmailField(event) {
    const { name, value } = event.target
    setEmailForm(prev => ({ ...prev, [name]: value }))
  }

  function updatePasswordField(event) {
    const { name, value } = event.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileNotice({ tone: 'success', message: '' })

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ name: profileForm.name }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setProfileNotice({ tone: 'error', message: data?.message || 'Failed to update profile.' })
        return
      }

      setUser(data?.doc || user)
      setProfileNotice({ tone: 'success', message: 'Profile details saved.' })
    } catch {
      setProfileNotice({ tone: 'error', message: 'An error occurred while saving your profile.' })
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleRequestOtp(event) {
    event.preventDefault()
    setRequestingOtp(true)
    setEmailNotice({ tone: 'success', message: '' })

    try {
      const res = await fetch('/api/auth/change-email/request', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          nextEmail: emailForm.nextEmail,
          currentPassword: emailForm.currentPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setEmailNotice({ tone: 'error', message: data?.message || 'Unable to send OTP.' })
        return
      }

      setEmailToken(data?.token || '')
      setEmailForm(prev => ({ ...prev, code: '' }))
      setEmailNotice({ tone: 'success', message: 'OTP sent. Open your new inbox and enter the code below.' })
    } catch {
      setEmailNotice({ tone: 'error', message: 'An error occurred while requesting the OTP.' })
    } finally {
      setRequestingOtp(false)
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault()
    setVerifyingOtp(true)
    setEmailNotice({ tone: 'success', message: '' })

    try {
      const res = await fetch('/api/auth/change-email/verify', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          token: emailToken,
          code: emailForm.code,
          currentPassword: emailForm.currentPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setEmailNotice({ tone: 'error', message: data?.message || 'Unable to verify OTP.' })
        return
      }

      const nextUser = data?.user || user
      storeUserSession(data?.token || '', nextUser.email)
      setUser(nextUser)
      setEmailToken('')
      setEmailForm({ nextEmail: nextUser.email || '', currentPassword: '', code: '' })
      setEmailNotice({ tone: 'success', message: 'Email updated and verified successfully.' })
    } catch {
      setEmailNotice({ tone: 'error', message: 'An error occurred while verifying the OTP.' })
    } finally {
      setVerifyingOtp(false)
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault()
    setPasswordNotice({ tone: 'success', message: '' })

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordNotice({ tone: 'error', message: 'Passwords do not match.' })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordNotice({ tone: 'error', message: 'Password must be at least 8 characters.' })
      return
    }

    if (!passwordForm.currentPassword) {
      setPasswordNotice({ tone: 'error', message: 'Enter your current password first.' })
      return
    }

    setChangingPassword(true)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          password: passwordForm.newPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setPasswordNotice({ tone: 'error', message: data?.message || 'Failed to change password.' })
        return
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordNotice({ tone: 'success', message: 'Password changed successfully.' })
    } catch {
      setPasswordNotice({ tone: 'error', message: 'An error occurred while changing your password.' })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-400)' }}>Loading settings...</div>
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: 24, maxWidth: 560, width: '100%' }}>
          <h2 style={{ margin: 0, color: 'var(--ink-900)' }}>Error loading settings</h2>
          <p style={{ color: 'var(--ink-600)' }}>{error}</p>
          <Link href="/student/dashboard" style={{ color: 'var(--brand-600)', textDecoration: 'none', fontWeight: 600 }}>Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const learnerName = user?.name || user?.email?.split?.('@')?.[0] || 'Student'

  return (
    <div style={{ minHeight: '100vh', background: pageBg.background }}>
      <div className="container" style={{ padding: shell.padding }}>
        <Link href="/student/dashboard" style={{ color: 'var(--brand-600)', textDecoration: 'none', fontSize: 14 }}>Back to Dashboard</Link>

        <section style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>Account settings</div>
            <h1 style={titleStyle}>Manage your profile, email security, and password</h1>
            <p style={ledeStyle}>Keep your learner account current. Email changes only go through after OTP verification on the new address.</p>
          </div>
          <div style={summaryPanelStyle}>
            <div style={summaryLabelStyle}>Signed in as</div>
            <div style={summaryValueStyle}>{learnerName}</div>
            <div style={summaryEmailStyle}>{user?.email}</div>
          </div>
        </section>

        <div style={gridStyle}>
          <section style={{ ...card, ...panelStyle }}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Profile</h2>
                <p style={sectionBodyStyle}>Update the learner name shown around your dashboard.</p>
              </div>
              <span style={chipStyle}>Public</span>
            </div>

            <form onSubmit={handleSaveProfile} style={formStackStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>Full name</span>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={updateProfileField}
                  style={inputStyle}
                  placeholder="Your full name"
                />
              </label>
              <button type="submit" style={primaryButton} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save profile'}
              </button>
              <Alert message={profileNotice.message} tone={profileNotice.tone} />
            </form>
          </section>

          <section style={{ ...card, ...panelStyle }}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>Email address</h2>
                <p style={sectionBodyStyle}>Your login email stays unchanged until you confirm the OTP sent to the new inbox.</p>
              </div>
              <span style={chipStyle}>OTP required</span>
            </div>

            <div style={emailStatusStyle}>
              <div>
                <div style={summaryLabelStyle}>Current email</div>
                <div style={{ color: 'var(--ink-900)', fontWeight: 700 }}>{user?.email}</div>
              </div>
              <div style={miniBadgeStyle}>Verified account</div>
            </div>

            <form onSubmit={handleRequestOtp} style={formStackStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>New email</span>
                <input
                  type="email"
                  name="nextEmail"
                  value={emailForm.nextEmail}
                  onChange={updateEmailField}
                  style={inputStyle}
                  placeholder="newemail@example.com"
                />
              </label>
              <label style={fieldStyle}>
                <span style={labelStyle}>Current password</span>
                <input
                  type="password"
                  name="currentPassword"
                  value={emailForm.currentPassword}
                  onChange={updateEmailField}
                  style={inputStyle}
                  placeholder="Enter current password"
                />
              </label>
              <button type="submit" style={primaryButton} disabled={requestingOtp || !emailForm.nextEmail || !emailForm.currentPassword}>
                {requestingOtp ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            {emailToken ? (
              <form onSubmit={handleVerifyOtp} style={{ ...formStackStyle, marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--ink-200)' }}>
                <label style={fieldStyle}>
                  <span style={labelStyle}>Verification code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="code"
                    value={emailForm.code}
                    onChange={(event) => updateEmailField({
                      target: {
                        name: 'code',
                        value: event.target.value.replace(/\D/g, '').slice(0, 6),
                      },
                    })}
                    style={inputStyle}
                    placeholder="123456"
                  />
                </label>
                <button type="submit" style={primaryButton} disabled={verifyingOtp || emailForm.code.length !== 6}>
                  {verifyingOtp ? 'Verifying OTP...' : 'Verify and update email'}
                </button>
              </form>
            ) : null}

            <Alert message={emailNotice.message} tone={emailNotice.tone} />
          </section>
        </div>

        <section style={{ ...card, ...panelStyle, marginTop: 18 }}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Password</h2>
              <p style={sectionBodyStyle}>Use your current password to set a stronger one.</p>
            </div>
            <span style={chipStyle}>Security</span>
          </div>

          <form onSubmit={handleChangePassword} style={passwordGridStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Current password</span>
              <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={updatePasswordField} style={inputStyle} />
            </label>
            <label style={fieldStyle}>
              <span style={labelStyle}>New password</span>
              <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={updatePasswordField} style={inputStyle} />
            </label>
            <label style={fieldStyle}>
              <span style={labelStyle}>Confirm new password</span>
              <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={updatePasswordField} style={inputStyle} />
            </label>
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button type="submit" style={{ ...primaryButton, width: '100%' }} disabled={changingPassword}>
                {changingPassword ? 'Updating password...' : 'Change password'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 16 }}>
            <Alert message={passwordNotice.message} tone={passwordNotice.tone} />
          </div>
        </section>
      </div>
    </div>
  )
}

const heroStyle = {
  ...card,
  marginTop: 16,
  marginBottom: 18,
  padding: '30px 30px 28px',
  borderRadius: 24,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 18,
  background: 'linear-gradient(135deg, #ffffff 0%, #edf7ff 62%, #fdfaf3 100%)',
  border: '1px solid rgba(11,132,223,0.16)',
  boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
}

const eyebrowStyle = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'var(--brand-600)',
}

const titleStyle = {
  margin: '14px 0 10px',
  color: 'var(--ink-900)',
  fontSize: 'clamp(30px, 4vw, 42px)',
  lineHeight: 1.05,
}

const ledeStyle = {
  margin: 0,
  maxWidth: 620,
  color: 'var(--ink-600)',
  fontSize: 16,
  lineHeight: 1.8,
}

const summaryPanelStyle = {
  alignSelf: 'start',
  borderRadius: 20,
  padding: '18px 18px 16px',
  background: '#ffffff',
  border: '1px solid rgba(15,23,42,0.08)',
}

const summaryLabelStyle = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--ink-500)',
}

const summaryValueStyle = {
  marginTop: 10,
  color: 'var(--ink-900)',
  fontSize: 24,
  fontWeight: 800,
  lineHeight: 1.1,
}

const summaryEmailStyle = {
  marginTop: 8,
  color: 'var(--ink-600)',
  fontSize: 14,
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 18,
  alignItems: 'start',
}

const panelStyle = {
  borderRadius: 22,
  padding: 24,
  boxShadow: '0 14px 34px rgba(15,23,42,0.06)',
}

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 18,
  alignItems: 'start',
}

const sectionTitleStyle = {
  margin: 0,
  color: 'var(--ink-900)',
  fontSize: 22,
}

const sectionBodyStyle = {
  margin: '8px 0 0',
  color: 'var(--ink-600)',
  lineHeight: 1.7,
}

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 11px',
  borderRadius: 999,
  background: 'rgba(11,132,223,0.08)',
  color: 'var(--brand-600)',
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '.08em',
  whiteSpace: 'nowrap',
}

const formStackStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
}

const labelStyle = {
  color: 'var(--ink-700)',
  fontWeight: 700,
  fontSize: 14,
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid var(--ink-300)',
  fontSize: 14,
  outline: 'none',
  background: '#fff',
}

const emailStatusStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'center',
  marginBottom: 18,
  padding: '14px 16px',
  borderRadius: 16,
  background: '#f8fbff',
  border: '1px solid rgba(11,132,223,0.12)',
}

const miniBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 10px',
  borderRadius: 999,
  background: '#ecfdf3',
  color: '#166534',
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '.08em',
  whiteSpace: 'nowrap',
}

const passwordGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14,
}

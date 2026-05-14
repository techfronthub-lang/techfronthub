'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthSidePanel } from '@/src/components/AuthSidePanel'
import { resolveExistingSession } from '@/src/lib/smart-auth'
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
  checkboxGroupStyle,
  checkboxLabelStyle,
  checkboxStyle,
  inlineLinkStyle,
  submitStyle,
  errorStyle,
  footerStyle,
  footerLinkStyle,
} from '@/src/lib/auth-theme'

export default function StudentRegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreePrivacy: false,
    agreeTerms: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')

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

  function updateField(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function updateCheckbox(event) {
    const { name, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: checked }))
  }

  function validate() {
    if (!form.name.trim()) return 'Full name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (!form.agreePrivacy) return 'You must accept the Privacy Policy.'
    if (!form.agreeTerms) return 'You must accept the Terms and Conditions.'
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const validationMessage = validate()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setLoading(true)

    try {
      const registerRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })
      const registerData = await registerRes.json()
      if (!registerRes.ok) {
        throw new Error(registerData?.message || 'Registration failed.')
      }

      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          collection: 'users',
        }),
      })
      const otpData = await otpRes.json()
      if (!otpRes.ok || !otpData?.token) {
        throw new Error(otpData?.message || 'Verification code could not be sent.')
      }

      if (courseId) {
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}&collection=users&token=${encodeURIComponent(otpData.token)}&courseId=${encodeURIComponent(courseId)}`)
        return
      }

      router.push(`/verify-email?email=${encodeURIComponent(form.email)}&collection=users&token=${encodeURIComponent(otpData.token)}`)
    } catch (err) {
      setError(err.message || 'Registration failed.')
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
          image="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80"
          badge="Learner signup"
        />

        <section style={getFormPanelStyle(isCompact)}>
          <div style={formHeaderStyle}>
            <div style={brandStyle}>
              <span style={brandMarkStyle}>TF</span>
              <span style={brandTextStyle}>Learner Registration</span>
            </div>
            <h2 style={formTitleStyle}>Create learner account</h2>
            <p style={formBodyStyle}>This page is only for students.</p>
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}

          <form onSubmit={handleSubmit} style={formStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Full name</span>
              <input type="text" name="name" value={form.name} onChange={updateField} required style={inputStyle} placeholder="John Doe" disabled={loading} />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Email</span>
              <input type="email" name="email" value={form.email} onChange={updateField} required style={inputStyle} placeholder="you@example.com" disabled={loading} />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Password</span>
              <div style={passwordWrapStyle}>
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={updateField} required style={{ ...inputStyle, paddingRight: 56 }} placeholder="Minimum of 8 characters" disabled={loading} />
                <button type="button" onClick={() => setShowPassword((current) => !current)} style={toggleStyle} disabled={loading}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Confirm password</span>
              <div style={passwordWrapStyle}>
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={updateField} required style={{ ...inputStyle, paddingRight: 56 }} placeholder="Re-enter your password" disabled={loading} />
                <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} style={toggleStyle} disabled={loading}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div style={checkboxGroupStyle}>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" name="agreePrivacy" checked={form.agreePrivacy} onChange={updateCheckbox} style={checkboxStyle} disabled={loading} />
                <span>I agree to the <Link href="/privacy" target="_blank" style={inlineLinkStyle}>Privacy Policy</Link></span>
              </label>

              <label style={checkboxLabelStyle}>
                <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={updateCheckbox} style={checkboxStyle} disabled={loading} />
                <span>I agree to the <Link href="/terms" target="_blank" style={inlineLinkStyle}>Terms and Conditions</Link></span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={submitStyle}>
              {loading ? 'Creating account...' : 'Create learner account'}
            </button>
          </form>

          <div style={{ ...footerStyle, justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span>Already have an account? <Link href="/login" style={footerLinkStyle}>Sign in</Link></span>
            <Link href="/teacher/register" style={footerLinkStyle}>Apply as a teacher</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

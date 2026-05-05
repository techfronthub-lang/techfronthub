'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthShowcase } from '@/src/components/AuthShowcase'
import {
  resolveExistingSession,
  storeInstructorSession,
  storeUserSession,
} from '@/src/lib/smart-auth'

const learnerBullets = [
  'Join practical courses, submit work, and follow your learning progress.',
  'Access lessons, payments, and course completion records from one dashboard.',
  'Receive verified certificates when you complete eligible programs.',
]

const instructorBullets = [
  'Create an instructor account to manage teaching materials and learner communication.',
  'Provide your professional profile, expertise, and public links during registration.',
  'Access the instructor workspace after sign-up and continue onboarding there.',
]

export default function StudentRegisterPage() {
  const [role, setRole] = useState('student')
  const [learnerForm, setLearnerForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreePrivacy: false,
    agreeTerms: false,
  })
  const [instructorForm, setInstructorForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    expertise: '',
    photo: '',
    linkedin: '',
    twitter: '',
    github: '',
    website: '',
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

  const activeForm = role === 'student' ? learnerForm : instructorForm

  function updateField(setter) {
    return (event) => {
      const { name, value } = event.target
      setter((prev) => ({ ...prev, [name]: value }))
    }
  }

  function updateCheckbox(setter) {
    return (event) => {
      const { name, checked } = event.target
      setter((prev) => ({ ...prev, [name]: checked }))
    }
  }

  function validateBase(form) {
    if (!form.name.trim()) return 'Full name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (!form.agreePrivacy) return 'You must accept the Privacy Policy.'
    if (!form.agreeTerms) return 'You must accept the Terms and Conditions.'
    return ''
  }

  async function registerLearner() {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: learnerForm.name,
        email: learnerForm.email,
        password: learnerForm.password,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Registration failed.')

    const loginRes = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: learnerForm.email,
        password: learnerForm.password,
      }),
    })
    const loginData = await loginRes.json()
    if (loginData.token) storeUserSession(loginData.token, learnerForm.email)
    router.push('/student/dashboard')
  }

  async function registerInstructor() {
    const res = await fetch('/api/instructors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: instructorForm.name,
        email: instructorForm.email,
        password: instructorForm.password,
        bio: instructorForm.bio,
        expertise: instructorForm.expertise,
        photo: instructorForm.photo,
        linkedin: instructorForm.linkedin,
        twitter: instructorForm.twitter,
        github: instructorForm.github,
        website: instructorForm.website,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Instructor registration failed.')

    const loginRes = await fetch('/api/instructors/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: instructorForm.email,
        password: instructorForm.password,
      }),
    })
    const loginData = await loginRes.json()
    if (loginData.token) storeInstructorSession(loginData.token, instructorForm.email)
    router.push('/instructor/dashboard')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const validationMessage = validateBase(activeForm)
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setLoading(true)
    try {
      if (role === 'student') {
        await registerLearner()
      } else {
        await registerInstructor()
      }
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
      <div style={getLayoutStyle(isCompact)}>
        <AuthShowcase
          mode="register"
          eyebrow="Learning Platform"
          title={role === 'student' ? 'Start learning with guided courses and certificates.' : 'Apply for instructor access and manage your teaching workspace.'}
          body={
            role === 'student'
              ? 'Create a learner account to enroll in programs, continue lessons, monitor progress, and receive certificates for completed tracks.'
              : 'Create an instructor account to manage courses, share your expertise, engage learners, and operate from the instructor dashboard.'
          }
          bullets={role === 'student' ? learnerBullets : instructorBullets}
        />

        <section style={getFormPanelStyle(isCompact)}>
          <div style={formHeaderStyle}>
            <div style={brandStyle}>
              <span style={brandMarkStyle}>TF</span>
              <span style={brandTextStyle}>Platform Registration</span>
            </div>
            <h2 style={formTitleStyle}>Create account</h2>
            <p style={formBodyStyle}>
              Select the account type you need, then complete the required details.
            </p>
          </div>

          <div style={tabRowStyle}>
            <button type="button" onClick={() => setRole('student')} style={getTabStyle(role === 'student')}>
              Learner
            </button>
            <button type="button" onClick={() => setRole('instructor')} style={getTabStyle(role === 'instructor')}>
              Teacher
            </button>
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}

          <form onSubmit={handleSubmit} style={formStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Full name</span>
              <input type="text" name="name" value={activeForm.name} onChange={role === 'student' ? updateField(setLearnerForm) : updateField(setInstructorForm)} required style={inputStyle} placeholder="John Doe" disabled={loading} />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Email</span>
              <input type="email" name="email" value={activeForm.email} onChange={role === 'student' ? updateField(setLearnerForm) : updateField(setInstructorForm)} required style={inputStyle} placeholder="you@example.com" disabled={loading} />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Password</span>
              <div style={passwordWrapStyle}>
                <input type={showPassword ? 'text' : 'password'} name="password" value={activeForm.password} onChange={role === 'student' ? updateField(setLearnerForm) : updateField(setInstructorForm)} required style={{ ...inputStyle, paddingRight: 56 }} placeholder="Minimum of 8 characters" disabled={loading} />
                <button type="button" onClick={() => setShowPassword((current) => !current)} style={toggleStyle} disabled={loading}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Confirm password</span>
              <div style={passwordWrapStyle}>
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={activeForm.confirmPassword} onChange={role === 'student' ? updateField(setLearnerForm) : updateField(setInstructorForm)} required style={{ ...inputStyle, paddingRight: 56 }} placeholder="Re-enter your password" disabled={loading} />
                <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} style={toggleStyle} disabled={loading}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
              </div>
            </label>

            {role === 'instructor' ? (
              <>
                <label style={fieldStyle}>
                  <span style={labelStyle}>Professional bio</span>
                  <textarea name="bio" value={instructorForm.bio} onChange={updateField(setInstructorForm)} rows={4} style={textareaStyle} placeholder="Tell learners about your teaching background and focus areas." disabled={loading} />
                </label>

                <label style={fieldStyle}>
                  <span style={labelStyle}>Areas of expertise</span>
                  <input type="text" name="expertise" value={instructorForm.expertise} onChange={updateField(setInstructorForm)} style={inputStyle} placeholder="Data Analytics, Python, SQL" disabled={loading} />
                </label>

                <div style={dualGridStyle}>
                  <label style={fieldStyle}>
                    <span style={labelStyle}>Photo URL</span>
                    <input type="url" name="photo" value={instructorForm.photo} onChange={updateField(setInstructorForm)} style={inputStyle} placeholder="https://..." disabled={loading} />
                  </label>
                  <label style={fieldStyle}>
                    <span style={labelStyle}>Website</span>
                    <input type="url" name="website" value={instructorForm.website} onChange={updateField(setInstructorForm)} style={inputStyle} placeholder="https://..." disabled={loading} />
                  </label>
                </div>

                <div style={dualGridStyle}>
                  <label style={fieldStyle}>
                    <span style={labelStyle}>LinkedIn</span>
                    <input type="url" name="linkedin" value={instructorForm.linkedin} onChange={updateField(setInstructorForm)} style={inputStyle} placeholder="https://linkedin.com/in/..." disabled={loading} />
                  </label>
                  <label style={fieldStyle}>
                    <span style={labelStyle}>GitHub</span>
                    <input type="url" name="github" value={instructorForm.github} onChange={updateField(setInstructorForm)} style={inputStyle} placeholder="https://github.com/..." disabled={loading} />
                  </label>
                </div>

                <label style={fieldStyle}>
                  <span style={labelStyle}>X / Twitter</span>
                  <input type="url" name="twitter" value={instructorForm.twitter} onChange={updateField(setInstructorForm)} style={inputStyle} placeholder="https://x.com/..." disabled={loading} />
                </label>
              </>
            ) : null}

            <div style={checkboxGroupStyle}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  name="agreePrivacy"
                  checked={activeForm.agreePrivacy}
                  onChange={role === 'student' ? updateCheckbox(setLearnerForm) : updateCheckbox(setInstructorForm)}
                  style={checkboxStyle}
                  disabled={loading}
                />
                <span>I agree to the <Link href="/privacy" target="_blank" style={inlineLinkStyle}>Privacy Policy</Link></span>
              </label>

              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={activeForm.agreeTerms}
                  onChange={role === 'student' ? updateCheckbox(setLearnerForm) : updateCheckbox(setInstructorForm)}
                  style={checkboxStyle}
                  disabled={loading}
                />
                <span>I agree to the <Link href="/terms" target="_blank" style={inlineLinkStyle}>Terms and Conditions</Link></span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={submitStyle}>
              {loading ? 'Creating account...' : role === 'student' ? 'Create learner account' : 'Create teacher account'}
            </button>
          </form>

          <div style={footerStyle}>
            <span>Already have an account?</span>
            <Link href="/login" style={footerLinkStyle}>Sign in</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

const pageShellStyle = { padding: '32px 24px 56px' }
function getLayoutStyle(isCompact) {
  return {
    width: '100%',
    maxWidth: '1240px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: isCompact ? '1fr' : 'minmax(0, 1.1fr) minmax(400px, 0.9fr)',
    borderRadius: isCompact ? '22px' : '28px',
    overflow: 'hidden',
    boxShadow: '0 28px 80px rgba(2, 6, 23, 0.18)',
    background: 'rgba(255,255,255,0.92)',
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
const formHeaderStyle = { marginBottom: '24px' }
const brandStyle = { display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }
const brandMarkStyle = { width: '42px', height: '42px', display: 'grid', placeItems: 'center', borderRadius: '14px', background: 'linear-gradient(135deg, #ea580c, #0f172a)', color: '#fff', fontWeight: 800, letterSpacing: '0.06em' }
const brandTextStyle = { fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569' }
const formTitleStyle = { margin: '0 0 10px', fontSize: '40px', lineHeight: 1, letterSpacing: '-0.04em' }
const formBodyStyle = { margin: 0, color: '#64748b', fontSize: '16px', lineHeight: 1.7 }
const tabRowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }
function getTabStyle(active) {
  return {
    borderRadius: '14px',
    border: `1px solid ${active ? '#1d4ed8' : '#cbd5e1'}`,
    background: active ? 'rgba(37, 99, 235, 0.1)' : '#fff',
    color: active ? '#1d4ed8' : '#334155',
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer',
  }
}
const formStyle = { display: 'grid', gap: '18px' }
const fieldStyle = { display: 'grid', gap: '8px' }
const labelStyle = { fontSize: '14px', fontWeight: 700, color: '#334155' }
const inputStyle = { width: '100%', border: '1px solid #cbd5e1', borderRadius: '16px', background: 'rgba(255,255,255,0.85)', color: '#0f172a', padding: '14px 16px', fontSize: '15px', outline: 'none' }
const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '112px' }
const dualGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }
const passwordWrapStyle = { position: 'relative' }
const toggleStyle = { position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: '#2563eb', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const checkboxGroupStyle = { display: 'grid', gap: '12px', marginTop: '2px' }
const checkboxLabelStyle = { display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#334155', fontSize: '14px', lineHeight: 1.6 }
const checkboxStyle = { width: '18px', height: '18px', marginTop: '2px', flexShrink: 0 }
const inlineLinkStyle = { color: '#1d4ed8', textDecoration: 'none', fontWeight: 700 }
const submitStyle = { justifyContent: 'center', width: '100%', marginTop: '8px', padding: '14px 18px', borderRadius: '16px' }
const errorStyle = { borderRadius: '16px', border: '1px solid rgba(220, 38, 38, 0.18)', background: 'rgba(254, 226, 226, 0.9)', color: '#b91c1c', padding: '14px 16px', fontSize: '14px', marginBottom: '18px' }
const footerStyle = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '22px', color: '#64748b', fontSize: '14px' }
const footerLinkStyle = { color: '#1d4ed8', textDecoration: 'none', fontWeight: 700 }
const loadingCardStyle = { minWidth: '320px', maxWidth: '420px', margin: '72px auto', padding: '24px 28px', borderRadius: '18px', background: 'rgba(255,255,255,0.92)', color: '#0f172a', boxShadow: '0 20px 60px rgba(2, 6, 23, 0.18)' }

'use client'

import { useState, useEffect } from 'react'
import { useInstructor } from '../context'
import { createDoc } from '@/src/lib/payload-api'

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function authHeaders(extra = {}) {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('instructor-token')
    : ''
  return { Authorization: `JWT ${token}`, ...extra }
}

function getInitials(name, email) {
  if (name) {
    return name
      .split(' ')
      .map(w => w[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return (email?.[0] ?? 'I').toUpperCase()
}

/* ── Inline icons ─────────────────────────────────────────────────────────── */
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconAlertCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
function IconSave() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/* ── Alert sub-component ──────────────────────────────────────────────────── */
function Alert({ type, message }) {
  if (!message) return null
  const isSuccess = type === 'success'
  return (
    <div className={`i-alert ${isSuccess ? 'i-alert-success' : 'i-alert-error'}`} role="alert">
      {isSuccess ? <IconCheck /> : <IconAlertCircle />}
      {message}
    </div>
  )
}

/* ── Page component ───────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const ctx        = useInstructor()
  const instructor = ctx?.instructor
  const setInstructor = ctx?.setInstructor

  /* ── Section 1: Public Profile ── */
  const [name,      setName]      = useState('')
  const [bio,       setBio]       = useState('')
  const [expertise, setExpertise] = useState('')
  const [linkedin,  setLinkedin]  = useState('')
  const [twitter,   setTwitter]   = useState('')
  const [github,    setGithub]    = useState('')
  const [website,   setWebsite]   = useState('')
  const [headline,   setHeadline]  = useState('')
  const [location,   setLocation]  = useState('')
  const [websiteLabel, setWebsiteLabel] = useState('')
  const [photo,     setPhoto]     = useState('')

  const [profileSaving,  setProfileSaving]  = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [profileAlert,   setProfileAlert]   = useState({ type: '', message: '' })

  /* ── Section 2: Account / Password ── */
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving,  setPasswordSaving]  = useState(false)
  const [passwordAlert,   setPasswordAlert]   = useState({ type: '', message: '' })

  /* Populate fields from context */
  useEffect(() => {
    if (!instructor) return
    setName(instructor.name      ?? '')
    setBio(instructor.bio        ?? '')
    setExpertise(instructor.expertise ?? '')
    setLinkedin(instructor.linkedin  ?? '')
    setTwitter(instructor.twitter   ?? '')
    setGithub(instructor.github    ?? '')
    setWebsite(instructor.website   ?? '')
    setHeadline(instructor.headline ?? '')
    setLocation(instructor.location ?? '')
    setWebsiteLabel(instructor.websiteLabel ?? '')
    setPhoto(instructor.photo      ?? '')
  }, [instructor])

  async function uploadPhoto(file) {
    setPhotoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'instructors')
      const res = await fetch('/api/storage/upload', { method: 'POST', body: formData })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Photo upload failed')
      const url = data.url || ''
      setPhoto(url)
      if (setInstructor) setInstructor(prev => ({ ...prev, photo: url }))
      await createDoc('media-assets', {
        name: file.name,
        url,
        key: data.key || '',
        bucket: data.bucket || '',
        folder: 'instructor-photo',
        mimeType: file.type,
        size: file.size,
      }).catch(() => {})
      await fetch(`/api/instructors/${instructor.id}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ photo: url }),
      }).catch(() => {})
      setProfileAlert({ type: 'success', message: 'Profile photo updated.' })
    } catch (error) {
      setProfileAlert({ type: 'error', message: error.message || 'Failed to upload photo.' })
    } finally {
      setPhotoUploading(false)
    }
  }

  /* ── Save public profile ── */
  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileAlert({ type: '', message: '' })

    try {
      const res = await fetch(`/api/instructors/${instructor.id}`, {
        method:  'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body:    JSON.stringify({ name, bio, expertise, linkedin, twitter, github, website, photo, headline, location, websiteLabel }),
      })
      const data = await res.json()

      if (!res.ok) {
        setProfileAlert({
          type:    'error',
          message: data?.errors?.[0]?.message || data?.message || 'Failed to save profile.',
        })
        return
      }

      /* Update context so sidebar/avatar refresh immediately */
      if (setInstructor) {
        setInstructor(prev => ({ ...prev, name, bio, expertise, linkedin, twitter, github, website, photo, headline, location, websiteLabel }))
      }
      setProfileAlert({ type: 'success', message: 'Profile saved successfully.' })
    } catch {
      setProfileAlert({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setProfileSaving(false)
      // Auto-clear success after 4 s
      setTimeout(() => setProfileAlert(a => a.type === 'success' ? { type: '', message: '' } : a), 4000)
    }
  }

  /* ── Save password ── */
  async function handlePasswordSave(e) {
    e.preventDefault()
    setPasswordAlert({ type: '', message: '' })

    if (!newPassword) {
      setPasswordAlert({ type: 'error', message: 'Please enter a new password.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordAlert({ type: 'error', message: 'Password must be at least 8 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setPasswordSaving(true)

    try {
      const res = await fetch(`/api/instructors/${instructor.id}`, {
        method:  'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body:    JSON.stringify({ password: newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setPasswordAlert({
          type:    'error',
          message: data?.errors?.[0]?.message || data?.message || 'Failed to update password.',
        })
        return
      }

      setNewPassword('')
      setConfirmPassword('')
      setPasswordAlert({ type: 'success', message: 'Password updated successfully.' })
    } catch {
      setPasswordAlert({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setPasswordSaving(false)
      setTimeout(() => setPasswordAlert(a => a.type === 'success' ? { type: '', message: '' } : a), 4000)
    }
  }

  if (!instructor) {
    return (
      <div className="i-loading">
        <div className="i-spinner" />
        Loading profile…
      </div>
    )
  }

  const initials = getInitials(instructor.name, instructor.email)

  return (
    <div className="i-page">

      {/* Page header */}
      <div className="i-page-header">
        <div>
          <h1 className="i-page-title">Profile</h1>
          <p className="i-page-subtitle">Manage your public profile and account settings.</p>
        </div>
      </div>

      {/* ── Section 1: Public Profile ── */}
      <section className="i-form-section">
        <div className="i-form-section-header">
          <h2 className="i-form-section-title">Public Profile</h2>
          <p className="i-form-section-desc">
            This information is visible to students enrolled in your courses.
          </p>
        </div>
        <div className="i-form-section-body">
        <form onSubmit={handleProfileSave} noValidate>

          {/* Avatar */}
          <div className="i-avatar-row">
            <div className="i-avatar-circle" aria-hidden="true">
              {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            <div className="i-avatar-info">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="i-btn i-btn-secondary i-btn-sm" style={{ cursor: 'pointer' }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) uploadPhoto(file)
                      e.target.value = ''
                    }}
                    disabled={photoUploading}
                  />
                  {photoUploading ? 'Uploading...' : 'Upload Photo'}
                </label>
                <input
                  type="text"
                  className="i-form-input"
                  style={{ minWidth: 260 }}
                  placeholder="Or paste a photo URL..."
                  value={photo}
                  onChange={e => setPhoto(e.target.value)}
                  disabled={profileSaving}
                />
              </div>
              <p className="i-avatar-hint">Photo uploads are stored in Supabase and also saved on your instructor profile.</p>
            </div>
          </div>

          <Alert type={profileAlert.type} message={profileAlert.message} />

          {/* Name */}
          <div className="i-form-field">
            <label htmlFor="profile-name" className="i-form-label">Full name</label>
            <input
              id="profile-name"
              type="text"
              className="i-form-input"
              placeholder="Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={profileSaving}
            />
          </div>

          {/* Bio */}
          <div className="i-form-field">
            <label htmlFor="profile-bio" className="i-form-label">Bio</label>
            <textarea
              id="profile-bio"
              className="i-form-textarea"
              rows={4}
              placeholder="Tell students a little about yourself…"
              value={bio}
              onChange={e => setBio(e.target.value)}
              disabled={profileSaving}
            />
          </div>

          {/* Expertise */}
          <div className="i-form-field">
            <label htmlFor="profile-expertise" className="i-form-label">Expertise</label>
            <input
              id="profile-expertise"
              type="text"
              className="i-form-input"
              placeholder="Python, SQL, Machine Learning"
              value={expertise}
              onChange={e => setExpertise(e.target.value)}
              disabled={profileSaving}
            />
            <p className="i-form-hint">Comma-separated e.g. Python, SQL, Data Analysis</p>
          </div>

          <div className="i-form-field">
            <label htmlFor="profile-headline" className="i-form-label">Public headline</label>
            <input
              id="profile-headline"
              type="text"
              className="i-form-input"
              placeholder="Senior Data Analyst and Instructor"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              disabled={profileSaving}
            />
          </div>

          <div className="i-form-grid">
            <div className="i-form-field">
              <label htmlFor="profile-location" className="i-form-label">Location</label>
              <input
                id="profile-location"
                type="text"
                className="i-form-input"
                placeholder="Lagos, Nigeria"
                value={location}
                onChange={e => setLocation(e.target.value)}
                disabled={profileSaving}
              />
            </div>
            <div className="i-form-field">
              <label htmlFor="profile-website-label" className="i-form-label">Website label</label>
              <input
                id="profile-website-label"
                type="text"
                className="i-form-input"
                placeholder="Portfolio"
                value={websiteLabel}
                onChange={e => setWebsiteLabel(e.target.value)}
                disabled={profileSaving}
              />
            </div>
          </div>

          {/* Social links — 2-col grid */}
          <div className="i-form-field">
            <span className="i-form-label" id="social-group-label">Social links</span>
            <div className="i-social-grid" role="group" aria-labelledby="social-group-label">

              <div className="i-social-field">
                <label htmlFor="profile-linkedin" className="i-social-label">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  LinkedIn
                </label>
                <input
                  id="profile-linkedin"
                  type="url"
                  className="i-form-input"
                  placeholder="https://linkedin.com/in/you"
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  disabled={profileSaving}
                />
              </div>

              <div className="i-social-field">
                <label htmlFor="profile-twitter" className="i-social-label">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  Twitter / X
                </label>
                <input
                  id="profile-twitter"
                  type="url"
                  className="i-form-input"
                  placeholder="https://twitter.com/you"
                  value={twitter}
                  onChange={e => setTwitter(e.target.value)}
                  disabled={profileSaving}
                />
              </div>

              <div className="i-social-field">
                <label htmlFor="profile-github" className="i-social-label">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  GitHub
                </label>
                <input
                  id="profile-github"
                  type="url"
                  className="i-form-input"
                  placeholder="https://github.com/you"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  disabled={profileSaving}
                />
              </div>

              <div className="i-social-field">
                <label htmlFor="profile-website" className="i-social-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Website
                </label>
                <input
                  id="profile-website"
                  type="url"
                  className="i-form-input"
                  placeholder="https://yoursite.com"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  disabled={profileSaving}
                />
              </div>

            </div>
          </div>

          <div className="i-form-actions">
            <button type="submit" className="i-btn i-btn-primary" disabled={profileSaving}>
              {profileSaving ? (
                <>
                  <span className="i-btn-spinner" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <IconSave /> Save Profile
                </>
              )}
            </button>
          </div>

        </form>
        </div>
      </section>

      {/* ── Section 2: Account ── */}
      <section className="i-form-section">
        <div className="i-form-section-header">
          <h2 className="i-form-section-title">Account</h2>
          <p className="i-form-section-desc">
            Manage your login credentials.
          </p>
        </div>
        <div className="i-form-section-body">

        {/* Email — read-only */}
        <div className="i-form-field">
          <span className="i-form-label">Email address</span>
          <div className="i-readonly-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>{instructor.email}</span>
          </div>
          <p className="i-form-hint">
            To change your email address, contact portal support.
          </p>
        </div>

        {/* Password change */}
        <form onSubmit={handlePasswordSave} noValidate>
          <div className="i-form-divider">
            <span>Change password</span>
          </div>

          <Alert type={passwordAlert.type} message={passwordAlert.message} />

          <div className="i-form-field">
            <label htmlFor="new-password" className="i-form-label">New password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              className="i-form-input"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={passwordSaving}
            />
          </div>

          <div className="i-form-field">
            <label htmlFor="confirm-password" className="i-form-label">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="i-form-input"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value)
                // Live match validation
                if (passwordAlert.type === 'error' && e.target.value === newPassword) {
                  setPasswordAlert({ type: '', message: '' })
                }
              }}
              disabled={passwordSaving}
            />
            {/* Inline mismatch hint */}
            {confirmPassword && newPassword && confirmPassword !== newPassword && (
              <p className="i-form-hint i-form-hint-error">Passwords do not match.</p>
            )}
          </div>

          <div className="i-form-actions">
            <button
              type="submit"
              className="i-btn i-btn-primary"
              disabled={passwordSaving || !newPassword || !confirmPassword}
            >
              {passwordSaving ? (
                <>
                  <span className="i-btn-spinner" aria-hidden="true" />
                  Updating…
                </>
              ) : (
                <>
                  <IconLock /> Update Password
                </>
              )}
            </button>
          </div>

        </form>
        </div>
      </section>

    </div>
  )
}

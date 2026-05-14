'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { pageBg, shell, card, primaryButton, successAlert, errorAlert } from '../_components/ui'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('payload-token') : ''
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saveMessage, setSaveMessage] = useState('')
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
        const data = await res.json()

        if (!active) return
        if (!res.ok) {
          router.push('/login')
          return
        }

        const me = data?.user ?? data
        setUser(me)
        setFormData(prev => ({ ...prev, email: me?.email || '' }))
        setLoading(false)
      } catch {
        if (!active) return
        setError('Failed to load settings')
        setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [router])

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaveMessage('')

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ email: formData.email }),
      })

      if (res.ok) {
        setSaveMessage('Profile updated successfully.')
      } else {
        setSaveMessage('Failed to update profile.')
      }
    } catch {
      setSaveMessage('An error occurred.')
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setSaveMessage('')

    if (formData.newPassword !== formData.confirmPassword) {
      setSaveMessage('Passwords do not match.')
      return
    }
    if (formData.newPassword.length < 8) {
      setSaveMessage('Password must be at least 8 characters.')
      return
    }
    if (!formData.currentPassword) {
      setSaveMessage('Enter your current password before setting a new one.')
      return
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          password: formData.newPassword,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setSaveMessage('Password changed successfully.')
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
      } else {
        setSaveMessage(data?.message || 'Failed to change password.')
      }
    } catch {
      setSaveMessage('An error occurred.')
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

  return (
    <div style={{ minHeight: '100vh', background: pageBg.background }}>
      <div className="container" style={{ padding: shell.padding }}>
        <Link href="/student/dashboard" style={{ color: 'var(--brand-600)', textDecoration: 'none', fontSize: 14 }}>Back to Dashboard</Link>

        <div style={{ marginTop: 14, marginBottom: 20 }}>
          <h1 style={{ margin: '0 0 8px', color: 'var(--ink-900)', fontSize: 'clamp(28px,4vw,38px)' }}>Settings</h1>
          <p style={{ margin: 0, color: 'var(--ink-600)' }}>Manage your account details and security.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
          <aside style={{ ...card, borderRadius: 14, padding: 10, alignSelf: 'start' }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-200)', marginBottom: 8, background: activeTab === 'profile' ? 'rgba(37,99,235,0.10)' : '#fff', cursor: 'pointer', fontWeight: 700, color: 'var(--ink-800)' }}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-200)', background: activeTab === 'password' ? 'rgba(37,99,235,0.10)' : '#fff', cursor: 'pointer', fontWeight: 700, color: 'var(--ink-800)' }}
            >
              Password
            </button>
          </aside>

          <section style={{ ...card, borderRadius: 14, padding: 18, minWidth: 0 }}>
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ margin: '0 0 2px', color: 'var(--ink-900)' }}>Profile Information</h2>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: 'var(--ink-700)', fontWeight: 600, fontSize: 14 }}>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 14 }}
                  />
                </label>
                <button type="submit" style={primaryButton}>Save Changes</button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ margin: '0 0 2px', color: 'var(--ink-900)' }}>Change Password</h2>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: 'var(--ink-700)', fontWeight: 600, fontSize: 14 }}>Current Password</span>
                  <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 14 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: 'var(--ink-700)', fontWeight: 600, fontSize: 14 }}>New Password</span>
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 14 }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: 'var(--ink-700)', fontWeight: 600, fontSize: 14 }}>Confirm Password</span>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-300)', fontSize: 14 }} />
                </label>
                <button type="submit" style={primaryButton}>Change Password</button>
              </form>
            )}

            {saveMessage && (
              <div style={{ marginTop: 14, ...( /successfully/i.test(saveMessage) ? successAlert : errorAlert ) }}>
                {saveMessage}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

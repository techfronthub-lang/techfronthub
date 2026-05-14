'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { pageBg, shell, card } from './_components/ui'

export default function StudentDashboardPage() {
  const [user, setUser] = useState(null)
  const [certificateCount, setCertificateCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

        const [meRes, certificatesRes] = await Promise.all([
          fetch('/api/users/me', { headers: { Authorization: `JWT ${token}` } }),
          fetch('/api/student/certificates', { headers: { Authorization: `JWT ${token}` } }),
        ])

        const data = await meRes.json()
        const certificatesData = await certificatesRes.json().catch(() => ({}))
        if (!active) return

        if (!meRes.ok) {
          setError('Session expired. Please login again.')
          router.push('/login')
          return
        }

        setUser(data?.user ?? data)
        setCertificateCount(Array.isArray(certificatesData?.docs) ? certificatesData.docs.length : 0)
        setLoading(false)
      } catch {
        if (!active) return
        setError('Unable to load dashboard.')
        setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [router])

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-400)' }}>Loading dashboard...</div>
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: 24, maxWidth: 540, width: '100%' }}>
          <h2 style={{ margin: 0, color: 'var(--ink-900)' }}>Could not load dashboard</h2>
          <p style={{ color: 'var(--ink-600)' }}>{error}</p>
          <Link href="/login" style={{ color: 'var(--brand-600)', textDecoration: 'none', fontWeight: 600 }}>Go to login</Link>
        </div>
      </div>
    )
  }

  const cards = [
    { title: 'My Courses', desc: 'Continue your enrolled courses and lessons.', href: '/student/dashboard/courses' },
    { title: 'Certificates', desc: `${certificateCount} issued certificate${certificateCount === 1 ? '' : 's'} saved to your account.`, href: '/student/dashboard/courses' },
    { title: 'Explore Courses', desc: 'Browse available courses and enroll.', href: '/courses' },
    { title: 'Settings', desc: 'Update your account and preferences.', href: '/student/dashboard/settings' },
  ]

  const learnerName = user?.name || user?.email?.split?.('@')?.[0] || 'Student'

  return (
    <div style={{ minHeight: '100vh', background: pageBg.background }}>
      <div className="container" style={{ padding: shell.padding }}>
        <div style={{ ...heroWrapStyle, marginBottom: 24 }}>
          <div style={heroMainStyle}>
            <div style={eyebrowStyle}>Student dashboard</div>
            <h1 style={heroTitleStyle}>Welcome back, {learnerName}</h1>
            <p style={heroTextStyle}>Pick up your courses, check your certificates, or continue exploring new programs.</p>
          </div>

          <div style={heroStatsStyle}>
            <div style={heroStatCardStyle}>
              <div style={heroStatValueStyle}>{certificateCount}</div>
              <div style={heroStatLabelStyle}>Certificates</div>
            </div>
            <div style={heroStatCardStyle}>
              <div style={heroStatValueStyle}>{cards.length}</div>
              <div style={heroStatLabelStyle}>Quick actions</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {cards.map(card => (
            <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
              <div style={dashboardCardStyle}>
                <div style={dashboardCardTopStyle}>
                  <h3 style={{ margin: 0, color: 'var(--ink-900)', fontSize: 20 }}>{card.title}</h3>
                  <span style={dashboardChipStyle}>Open</span>
                </div>
                <p style={{ margin: '10px 0 0', color: 'var(--ink-600)', lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const heroWrapStyle = {
  ...card,
  borderRadius: 24,
  padding: '32px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 18,
  background: 'linear-gradient(135deg, #ffffff 0%, #edf7ff 100%)',
  border: '1px solid rgba(11, 132, 223, 0.16)',
  boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
}

const heroMainStyle = {
  minWidth: 0,
}

const eyebrowStyle = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '.12em',
  color: 'var(--brand-600)',
}

const heroTitleStyle = {
  margin: '14px 0 10px',
  color: 'var(--ink-900)',
  fontSize: 'clamp(30px, 4vw, 44px)',
  lineHeight: 1.05,
}

const heroTextStyle = {
  margin: 0,
  color: 'var(--ink-600)',
  fontSize: 16,
  lineHeight: 1.75,
  maxWidth: 520,
}

const heroStatsStyle = {
  display: 'grid',
  gap: 12,
  alignContent: 'start',
}

const heroStatCardStyle = {
  borderRadius: 18,
  padding: '18px 18px 16px',
  background: '#ffffff',
  border: '1px solid rgba(15,23,42,0.08)',
}

const heroStatValueStyle = {
  fontSize: 28,
  fontWeight: 800,
  color: 'var(--ink-900)',
  lineHeight: 1,
}

const heroStatLabelStyle = {
  marginTop: 8,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--ink-500)',
}

const dashboardCardStyle = {
  background: '#fff',
  border: '1px solid rgba(15,23,42,0.08)',
  borderRadius: 18,
  padding: 22,
  minHeight: 158,
  boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
}

const dashboardCardTopStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
}

const dashboardChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '7px 10px',
  borderRadius: 999,
  background: 'rgba(11,132,223,0.08)',
  color: 'var(--brand-600)',
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '.08em',
}

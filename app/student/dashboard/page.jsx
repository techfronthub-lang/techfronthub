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

  return (
    <div style={{ minHeight: '100vh', background: pageBg.background }}>
      <div className="container" style={{ padding: shell.padding }}>
        <div style={{ ...card, borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--brand-600)', marginBottom: 8 }}>Student Portal</div>
          <h1 style={{ margin: '0 0 8px', color: 'var(--ink-900)', fontSize: 'clamp(28px, 4vw, 38px)', lineHeight: 1.1 }}>Welcome back</h1>
          <p style={{ margin: 0, color: 'var(--ink-600)', fontSize: 16 }}>{user?.email || 'Student'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {cards.map(card => (
            <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 16, padding: 20, minHeight: 150, boxShadow: '0 4px 14px rgba(15,23,42,0.04)' }}>
                <h3 style={{ margin: '0 0 10px', color: 'var(--ink-900)', fontSize: 20 }}>{card.title}</h3>
                <p style={{ margin: 0, color: 'var(--ink-600)', lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

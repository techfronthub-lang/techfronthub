'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import './instructor.css'
import { InstructorContext } from './context'

const NAV = [
  { section: 'Overview', links: [
    { href: '/instructor/dashboard', label: 'Dashboard', icon: <Grid /> },
  ]},
  { section: 'Teaching', links: [
    { href: '/instructor/courses',       label: 'My Courses',    icon: <Book /> },
    { href: '/instructor/announcements', label: 'Announcements', icon: <Bell /> },
  ]},
  { section: 'Insights', links: [
    { href: '/instructor/analytics',    label: 'Analytics',     icon: <Chart /> },
    { href: '/instructor/enrollments',  label: 'Enrollments',   icon: <Wallet /> },
    { href: '/instructor/certificates', label: 'Certificates',  icon: <Award /> },
  ]},
  { section: 'Account', links: [
    { href: '/instructor/profile', label: 'Profile', icon: <User /> },
  ]},
]

export default function InstructorLayout({ children }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [instructor, setInstructor] = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (pathname === '/instructor/login') { setLoading(false); return }
    const token = localStorage.getItem('instructor-token')
    if (!token) { router.replace('/instructor/login'); return }
    fetch('/api/instructors/me', { headers: { Authorization: `JWT ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setInstructor(data.user ?? data); setLoading(false) })
      .catch(() => { localStorage.removeItem('instructor-token'); router.replace('/instructor/login') })
  }, [pathname, router])

  if (pathname === '/instructor/login') return <>{children}</>

  if (loading) return (
    <div className="i-loading">
      <div className="i-spinner" />
      Loading instructor portal…
    </div>
  )

  const initials = instructor?.name
    ? instructor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : (instructor?.email?.[0] ?? 'I').toUpperCase()

  const logout = () => {
    localStorage.removeItem('instructor-token')
    router.push('/instructor/login')
  }

  return (
    <InstructorContext.Provider value={{ instructor, setInstructor }}>
      <div className="instructor-root">
        {/* Sidebar */}
        <aside className="i-sidebar">
          <Link href="/instructor/dashboard" className="i-sidebar-logo">
            <span className="mark">TF</span>
            <span className="name">TECHFRONT<span style={{color:'#3b82f6'}}>.</span>HUB <small>Instructor Portal</small></span>
          </Link>

          <div className="i-instructor-card">
            <div className="avatar">{initials}</div>
            <div className="info">
              <div className="name">{instructor?.name || instructor?.email}</div>
              <div className="role">Instructor</div>
            </div>
          </div>

          <nav style={{ flex: 1 }}>
            {NAV.map(({ section, links }) => (
              <div className="i-nav-section" key={section}>
                <div className="i-nav-label">{section}</div>
                {links.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`i-nav-link${pathname === l.href || pathname.startsWith(l.href + '/') ? ' active' : ''}`}
                  >
                    {l.icon}{l.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="i-sidebar-footer">
            <button onClick={logout} className="i-btn i-btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <LogOut /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="i-main">
          <header className="i-topbar">
            <div className="i-topbar-left">
              <div className="i-topbar-title">Instructor Portal</div>
              <div className="i-topbar-sub">TECHFRONT HUB</div>
            </div>
            <div className="i-topbar-right">
              <div className="i-topbar-user">
                <span className="i-topbar-user-name">{instructor?.name || instructor?.email}</span>
                <div className="i-topbar-avatar">{initials}</div>
              </div>
            </div>
          </header>
          <div className="i-content">{children}</div>
        </main>
      </div>
    </InstructorContext.Provider>
  )
}

/* ── Inline SVG icons ── */
function Grid()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function Book()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> }
function Bell()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> }
function Chart()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/></svg> }
function Wallet()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/><path d="M16 12h6"/><path d="M18 9v6"/></svg> }
function Award()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> }
function User()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function LogOut()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }

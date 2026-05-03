'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getMe, logout } from '@/src/lib/payload-api'
import './admin.css'

import { AdminAuthProvider } from '@/src/components/AdminAuth'

const COLLECTIONS = [
  { slug: 'courses',      label: 'Courses' },
  { slug: 'categories',   label: 'Categories' },
  { slug: 'packages',     label: 'Packages' },
  { slug: 'testimonials', label: 'Testimonials' },
  { slug: 'udemy-courses', label: 'Udemy Courses' },
]

const GLOBALS = [
  { slug: 'site-config', label: 'Site Config' },
]

function NavLink({ href, children }) {
  const path = usePathname()
  const active = path === href || (href !== '/admin' && path.startsWith(href))
  return (
    <Link href={href} className={`sidebar-link${active ? ' active' : ''}`}>
      {children}
    </Link>
  )
}

function Sidebar({ user, onLogout }) {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <span>T</span>ECHFRONT <span style={{ color: 'var(--a-muted)', fontWeight: 400, fontSize: 12 }}>Admin</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Overview</div>
        <NavLink href="/admin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </NavLink>
        <NavLink href="/admin/users">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"/><path d="M4 20a8 8 0 1 1 16 0"/></svg>
          Users
        </NavLink>
        <NavLink href="/admin/media">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5-5 5-2-2-6 6"/></svg>
          Media
        </NavLink>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Collections</div>
        {COLLECTIONS.map(c => (
          <NavLink key={c.slug} href={`/admin/collections/${c.slug}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            {c.label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Globals</div>
        {GLOBALS.map(g => (
          <NavLink key={g.slug} href={`/admin/globals/${g.slug}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18M3 12h18"/></svg>
            {g.label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--a-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </div>
        )}
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    if (path === '/admin/login') { setLoading(false); return }
    getMe()
      .then(d => {
        if (d?.user) setUser(d.user)
        else router.replace('/admin/login')
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setLoading(false))
  }, [path, router])

  const handleLogout = async () => {
    await logout().catch(() => {})
    setUser(null)
    router.replace('/admin/login')
  }

  if (path === '/admin/login') {
    return (
      <AdminAuthProvider value={{ user, setUser }}>
        <div style={{ background: 'var(--a-bg)', minHeight: '100vh' }}>{children}</div>
      </AdminAuthProvider>
    )
  }

  if (loading) {
    return (
      <div style={{ background: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="a-spinner" />
      </div>
    )
  }

  return (
    <AdminAuthProvider value={{ user, setUser }}>
      <div className="admin-root">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="admin-main">
          {children}
        </div>
      </div>
    </AdminAuthProvider>
  )
}

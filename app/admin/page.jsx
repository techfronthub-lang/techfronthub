'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCollection } from '@/src/lib/payload-api'

const TILES = [
  { slug: 'courses',       label: 'Courses',       href: '/admin/collections/courses' },
  { slug: 'categories',    label: 'Categories',    href: '/admin/collections/categories' },
  { slug: 'packages',      label: 'Packages',      href: '/admin/collections/packages' },
  { slug: 'testimonials',  label: 'Testimonials',  href: '/admin/collections/testimonials' },
  { slug: 'udemy-courses', label: 'Udemy Courses', href: '/admin/collections/udemy-courses' },
  { slug: 'users',         label: 'Users',          href: '/admin/collections/users' },
  { slug: 'media-assets',  label: 'Media',         href: '/admin/media' },
]

function StatCard({ label, value, href }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="stat-card" style={{ cursor: 'pointer', transition: 'border-color 0.12s' }}
           onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--a-brand)'}
           onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--a-border)'}>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '—'}</div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    TILES.forEach(({ slug }) => {
      getCollection(slug, { limit: 1 })
        .then(d => setCounts(prev => ({ ...prev, [slug]: d.totalDocs ?? d.docs?.length ?? '?' })))
        .catch(() => setCounts(prev => ({ ...prev, [slug]: '?' })))
    })
  }, [])

  return (
    <>
      <div className="admin-topbar">
        <div className="topbar-title">Dashboard</div>
        <div className="topbar-actions">
          <Link href="/admin/collections/courses/create" className="btn btn-primary btn-sm">
            + New Course
          </Link>
        </div>
      </div>

      <div className="admin-content">
        <div className="stats-grid">
          {TILES.map(t => (
            <StatCard key={t.slug} label={t.label} value={counts[t.slug]} href={t.href} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="a-card">
            <div className="a-card-header">
              <div className="a-card-title">Quick Actions</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/admin/users" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                Manage Users
              </Link>
              <Link href="/admin/users" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                Instructor Approvals
              </Link>
              <Link href="/admin/media" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                Media Library
              </Link>
              {[
                { label: '+ New Course',      href: '/admin/collections/courses/create' },
                { label: '+ New Testimonial', href: '/admin/collections/testimonials/create' },
                { label: '+ New Category',    href: '/admin/collections/categories/create' },
                { label: '+ New Package',     href: '/admin/collections/packages/create' },
              ].map(a => (
                <Link key={a.href} href={a.href} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="a-card">
            <div className="a-card-header">
              <div className="a-card-title">Globals</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/admin/globals/site-config" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                ⚙ Site Config (hero, stats, CTA)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

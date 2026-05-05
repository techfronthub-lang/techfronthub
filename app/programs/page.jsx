'use client'

import React, { useEffect, useState } from 'react'
import { I } from '@/src/components/Icons'

function featureText(f) {
  return typeof f === 'string' ? f : f?.feature ?? ''
}

function ProgramCard({ p, index }) {
  const isFeatured = !!p.featured
  const Ic = p.icon && I[p.icon] ? I[p.icon] : I.Briefcase

  return (
    <div className={'pkg anim-fade-up d' + Math.min(index + 1, 8)} style={{ animationFillMode: 'both' }}
      {...(isFeatured ? { 'data-featured': true } : {})}
    >
      {p.badge && <span className="pkg-badge">{p.badge}</span>}

      <div className="pkg-ic">
        <Ic size={20} />
      </div>

      <h3>{p.name}</h3>
      <p>{p.desc}</p>

      <div className="pkg-price">
        <strong>{p.price}</strong>
        {p.per && <span className="per">{p.per}</span>}
      </div>

      {p.features?.length > 0 && (
        <ul>
          {p.features.map((f, i) => (
            <li key={i}>{featureText(f)}</li>
          ))}
        </ul>
      )}

      <a
        href="/courses"
        className={'btn ' + (isFeatured ? 'btn-primary' : 'btn-ghost')}
        style={{ marginTop: 'auto', justifyContent: 'center' }}
      >
        {isFeatured ? 'Get started' : 'Learn more'} <I.Arrow size={14} />
      </a>
    </div>
  )
}

export default function ProgramsPage() {
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState([])

  useEffect(() => {
    fetch('/api/packages?limit=100')
      .then(r => r.json())
      .then(data => {
        const sorted = (data.docs || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        setPackages(sorted)
      })
      .catch(() => setPackages([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ padding: '110px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(800px 500px at 60% -10%, rgba(37,99,235,0.18), transparent 65%), radial-gradient(600px 400px at 10% 80%, rgba(37,99,235,0.10), transparent 60%)',
        }} />
        <div className="container" style={{ maxWidth: 860, position: 'relative', textAlign: 'center' }}>
          <div className="eyebrow anim-fade-up" style={{ marginBottom: 16 }}>Learning Programs</div>
          <h1 className="anim-fade-up d1" style={{
            fontSize: 'clamp(36px, 5vw, 58px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            margin: '0 0 20px',
            color: '#fff',
          }}>
            Find Your Perfect<br />Learning Format
          </h1>
          <p className="anim-fade-up d2" style={{
            fontSize: 17,
            color: 'var(--ink-400)',
            maxWidth: 580,
            margin: '0 auto 36px',
            lineHeight: 1.65,
          }}>
            Structured bootcamps, 1-on-1 coaching, or corporate training — a program designed for your goals.
          </p>
          <div className="anim-fade-up d3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/courses" className="btn btn-primary btn-lg">Browse Courses <I.Arrow size={16} /></a>
            <a href="#programs" className="btn btn-ghost btn-lg">See Programs</a>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section id="programs" className="packages" style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div className="container">
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skel-card" style={{ minHeight: 340 }} />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-500)' }}>
              <p style={{ fontSize: 16 }}>No programs available yet — check back soon.</p>
            </div>
          ) : (
            <div className="pkg-grid">
              {packages.map((p, i) => (
                <ProgramCard key={p.id} p={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#020617', padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(700px 400px at 20% 100%, rgba(37,99,235,0.35), transparent 60%), radial-gradient(600px 400px at 90% -10%, rgba(37,99,235,0.2), transparent 60%)',
        }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--brand-200)', marginBottom: 12 }}>Ready to transform your career?</div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 auto 16px', maxWidth: 700, color: '#fff' }}>
            Choose Your Path
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>
            All programs include hands-on projects, industry expertise, and career support.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/courses" className="btn btn-primary btn-lg">Explore Courses <I.Arrow size={16} /></a>
            <a href="/" className="btn btn-lg" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>Contact Sales</a>
          </div>
        </div>
      </section>

    </div>
  )
}

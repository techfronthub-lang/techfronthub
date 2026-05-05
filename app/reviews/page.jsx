'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { I } from '@/src/components/Icons'

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true)
  const [testimonials, setTestimonials] = useState([])

  useEffect(() => {
    fetch('/api/testimonials?limit=100')
      .then(r => r.json())
      .then(data => setTestimonials(data.docs || []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ padding: '110px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(800px 500px at 60% -10%, rgba(37,99,235,0.18), transparent 65%), radial-gradient(600px 400px at 5% 80%, rgba(37,99,235,0.10), transparent 60%)',
        }} />
        <div className="container" style={{ maxWidth: 860, position: 'relative', textAlign: 'center' }}>
          <div className="eyebrow anim-fade-up" style={{ marginBottom: 16 }}>Student stories</div>
          <h1 className="anim-fade-up d1" style={{
            fontSize: 'clamp(36px, 5vw, 58px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            margin: '0 0 20px',
            color: '#fff',
          }}>
            Careers Built in Months,<br />Not Years
          </h1>
          <p className="anim-fade-up d2" style={{
            fontSize: 17,
            color: 'var(--ink-400)',
            maxWidth: 560,
            margin: '0 auto 36px',
            lineHeight: 1.65,
          }}>
            Real stories from real learners who've transformed their careers through TECHFRONT HUB.
          </p>
          <div className="anim-fade-up d3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/courses" className="btn btn-primary btn-lg">Start Learning <I.Arrow size={16} /></a>
            <a href="/programs" className="btn btn-ghost btn-lg">View Programs</a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'center' }}>
            {[
              { value: `${testimonials.length || '—'}+`, label: 'Success Stories' },
              { value: '4.8★', label: 'Average Rating' },
              { value: '87%', label: 'Job Placement Rate' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-400)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials grid */}
      <section className="testimonials" style={{ paddingTop: 80, paddingBottom: 100, borderTop: 'none' }}>
        <div className="container">
          {loading ? (
            <div className="t-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skel-card" style={{ minHeight: 220 }} />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-500)' }}>
              <p style={{ fontSize: 16 }}>No reviews yet — check back soon.</p>
            </div>
          ) : (
            <motion.div className="t-grid" variants={stagger} initial="hidden" animate="visible">
              {testimonials.map((t, i) => (
                <motion.div key={t.id ?? i} className="t-card" variants={fadeUp}>
                  <div className="t-stars">★★★★★</div>
                  <div className="quote">"{t.quote}"</div>
                  <div className="person">
                    <div className="avatar">{t.initials}</div>
                    <div>
                      <b>{t.name}</b>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
          <div className="eyebrow" style={{ color: 'var(--brand-200)', marginBottom: 12 }}>Ready for your transformation?</div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 auto 16px', maxWidth: 700, color: '#fff' }}>
            Start Your Journey Today
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Join thousands of learners who've achieved their career goals through hands-on learning and expert mentorship.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/courses" className="btn btn-primary btn-lg">Explore Courses <I.Arrow size={16} /></a>
            <a href="/programs" className="btn btn-lg" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>View Programs</a>
          </div>
        </div>
      </section>

    </div>
  )
}

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

function flyerBg(hue) {
  return {
    background: `linear-gradient(135deg, oklch(0.96 0.03 ${hue}), oklch(0.88 0.08 ${hue}))`,
  }
}

export default function UdemyPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetch('/api/udemy-courses?limit=100')
      .then(r => r.json())
      .then(data => {
        const sorted = (data.docs || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        setCourses(sorted)
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ padding: '110px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(800px 500px at 70% -10%, rgba(37,99,235,0.18), transparent 65%), radial-gradient(600px 400px at 5% 80%, rgba(37,99,235,0.10), transparent 60%)',
        }} />
        <div className="container" style={{ maxWidth: 860, position: 'relative', textAlign: 'center' }}>
          <div className="eyebrow anim-fade-up" style={{ marginBottom: 16 }}>Also on Udemy</div>
          <h1 className="anim-fade-up d1" style={{
            fontSize: 'clamp(36px, 5vw, 58px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            margin: '0 0 20px',
            color: '#fff',
          }}>
            Self-Paced Courses,<br />Globally
          </h1>
          <p className="anim-fade-up d2" style={{
            fontSize: 17,
            color: 'var(--ink-400)',
            maxWidth: 560,
            margin: '0 auto 36px',
            lineHeight: 1.65,
          }}>
            Prefer learning on your own time? Our instructors also publish on Udemy — grab a course and keep lifetime access.
          </p>
          <div className="anim-fade-up d3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#courses" className="btn btn-primary btn-lg">Browse Courses <I.Arrow size={16} /></a>
            <a href="/programs" className="btn btn-ghost btn-lg">View Programs</a>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section id="courses" style={{ paddingBottom: 100 }}>
        <div className="container">
          {loading ? (
            <div className="udemy-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skel-card" style={{ minHeight: 260 }} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-500)' }}>
              <p style={{ fontSize: 16 }}>No Udemy courses published yet — check back soon.</p>
            </div>
          ) : (
            <motion.div
              className="udemy-grid"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {courses.map((u, i) => (
                <motion.a
                  key={u.id ?? i}
                  className="u-card"
                  variants={fadeUp}
                  href={u.udemyUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                >
                  <div
                    className="u-thumb"
                    style={
                      u.thumbnail
                        ? {
                            backgroundImage: `linear-gradient(rgba(7,10,20,0.18), rgba(7,10,20,0.18)), url(${u.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : flyerBg(u.hue ?? 214)
                    }
                  >
                    <div className="play" />
                    <span className="lbl">{u.hours}</span>
                  </div>
                  <div className="u-body">
                    <h4 style={{ color: '#111827' }}>{u.title}</h4>
                    <div className="u-author">{u.author}</div>
                    <div className="u-rating">
                      <b>{u.rating}</b>
                      <span className="u-stars">★★★★★</span>
                      <span className="count">({u.count})</span>
                    </div>
                    <div className="u-foot">
                      <span className="u-price">{u.price}</span>
                    </div>
                  </div>
                </motion.a>
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
          <div className="eyebrow" style={{ color: 'var(--brand-200)', marginBottom: 12 }}>Start learning today</div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.05, margin: '0 auto 16px', maxWidth: 700, color: '#fff' }}>
            Flexible Learning Options
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Choose between structured bootcamps or self-paced Udemy courses — both paths lead to the same quality education.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/programs" className="btn btn-primary btn-lg">Explore Programs <I.Arrow size={16} /></a>
            <a href="/courses" className="btn btn-lg" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>View Courses</a>
          </div>
        </div>
      </section>

    </div>
  )
}

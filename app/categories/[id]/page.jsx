'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { I } from '@/src/components/Icons'

function CourseCard({ c }) {
  return (
    <a href={`/courses/${c.id}`} className="course-card" style={{textDecoration: "none", color: "inherit"}}>
      <div className="course-flyer" style={{
        background: c.thumbnail
          ? `linear-gradient(rgba(7, 10, 20, 0.18), rgba(7, 10, 20, 0.18)), url(${c.thumbnail})`
          : `linear-gradient(135deg, oklch(0.96 0.03 ${c.hue || 210}), oklch(0.88 0.08 ${c.hue || 210}))`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {c.tag && <span className="flyer-tag" style={{opacity: c.tagHot ? 1 : 0.7}}>{c.tag}</span>}
      </div>
      <div className="course-body">
        <h3>{c.title}</h3>
        <p>{c.desc}</p>
        <div className="course-meta">
          <span>{c.duration || '8 weeks'}</span><span className="sep"/>
          <span>{c.level || 'All levels'}</span>
        </div>
      </div>
      <div className="course-foot">
        <div className="course-price">
          ₦{c.price?.replace(/[₦,]/g, '') || '0'}
        </div>
        <button className="btn btn-dark btn-sm">Enroll Now <I.Arrow size={12}/></button>
      </div>
    </a>
  )
}

export default function CategoryPage({ params }) {
  const [category, setCategory] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const BASE = '/api'
    const get = (path) => fetch(`${BASE}${path}`).then(r => r.json()).catch(() => null)

    Promise.all([
      get('/categories?limit=50'),
      get('/courses?limit=100'),
    ]).then(([cats, allCourses]) => {
      const cat = cats?.docs?.find(c => c.id === parseInt(params.id))
      setCategory(cat)

      if (cat) {
        // Get all courses for this category by matching the category relationship
        const catCourses = allCourses?.docs?.filter(c => {
          const catId = c.category?.id || c.category
          return catId === parseInt(params.id)
        }) || []
        setCourses(catCourses)
      }
    }).finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="category-page anim-fade">
        <section style={{ padding: '96px 0 80px' }}>
          <div className="container" style={{ maxWidth: 900 }}>
            <div className="skel" style={{ width: 140, height: 14, marginBottom: 36, borderRadius: 20 }} />
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 48 }}>
              <div className="skel skel-circle" style={{ width: 72, height: 72, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skel" style={{ width: 80, height: 12, marginBottom: 12 }} />
                <div className="skel" style={{ width: '55%', height: 44, marginBottom: 14 }} />
                <div className="skel" style={{ width: '80%', height: 14, marginBottom: 8 }} />
                <div className="skel" style={{ width: '65%', height: 14 }} />
              </div>
            </div>
            <div className="skel" style={{ height: 120, borderRadius: 16 }} />
          </div>
        </section>
        <section style={{ padding: '0 0 88px' }}>
          <div className="container">
            <div className="skel" style={{ width: 100, height: 12, marginBottom: 14, borderRadius: 20 }} />
            <div className="skel" style={{ width: 200, height: 36, marginBottom: 8 }} />
            <div className="skel" style={{ width: 180, height: 13, marginBottom: 36 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skel" style={{ height: 240, borderRadius: 14 }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!category) {
    return (
      <div style={{padding: '40px 20px', textAlign: 'center'}}>
        <h2>Category not found</h2>
        <Link href="/courses">Back to all tracks</Link>
      </div>
    )
  }

  return (
    <div className="category-page anim-fade">
      <section className="category-hero" style={{padding: '96px 0 80px'}}>
        <div className="container" style={{maxWidth: '900px'}}>
          <Link href="/courses" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--brand-600)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 32
          }}>
            <I.Chev dir="left" size={16} /> Back to all tracks
          </Link>

          <div style={{display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 48}}>
            <div>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: category.thumbnail
                  ? `linear-gradient(rgba(7, 10, 20, 0.18), rgba(7, 10, 20, 0.18)), url(${category.thumbnail})`
                  : 'var(--brand-50)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: category.thumbnail ? '#fff' : 'var(--brand-600)',
                display: 'grid',
                placeItems: 'center',
                border: '1px solid var(--brand-100)',
                fontSize: 24,
                fontWeight: 700,
                overflow: 'hidden'
              }}>
                {!category.thumbnail ? React.createElement(I[category.icon || 'Code'], { size: 28 }) : null}
              </div>
            </div>
            <div style={{flex: 1}}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--brand-600)',
                marginBottom: 8
              }}>
                {category.n}
              </div>
              <h1 style={{
                fontSize: 48,
                margin: '0 0 12px',
                color: 'var(--ink-900)',
                fontWeight: 700
              }}>
                {category.title}
              </h1>
              <p style={{
                fontSize: 16,
                color: 'var(--ink-600)',
                margin: 0,
                lineHeight: 1.6,
                maxWidth: 600
              }}>
                {category.desc}
              </p>
            </div>
          </div>

          <div style={{
            background: 'var(--canvas)',
            border: '1px solid var(--ink-100)',
            borderRadius: 16,
            padding: 28
          }}>
            <h3 style={{margin: '0 0 12px', fontSize: 20, color: 'var(--ink-900)'}}>What you'll learn</h3>
            <p style={{
              fontSize: 15,
              color: 'var(--ink-600)',
              margin: '0 0 20px',
              lineHeight: 1.6
            }}>
              Portfolio-ready projects, industry certifications, and direct access to hiring partners. You'll ship real work and graduate with concrete proof of your skills.
            </p>
            <a href="#" className="btn btn-primary">Start this track <I.Arrow size={14}/></a>
          </div>
        </div>
      </section>

      {courses.length > 0 && (
        <section style={{padding: '88px 0'}}>
          <div className="container">
            <div style={{marginBottom: 32}}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--brand-600)',
                marginBottom: 8
              }}>
                Curriculum
              </div>
              <h2 style={{
                fontSize: 36,
                margin: '0 0 8px',
                color: 'var(--ink-900)',
                fontWeight: 700
              }}>
                {courses.length} {courses.length === 1 ? 'course' : 'courses'}
              </h2>
              <p style={{color: 'var(--ink-500)', fontSize: 14, margin: 0}}>
                Currently available in our catalog
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
              marginTop: 32
            }}>
              {courses.map((c, i) => (
                <div key={c.id} style={{position: 'relative'}}>
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: 16,
                    fontFamily: 'ui-monospace, Menlo, monospace',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--ink-400)',
                    letterSpacing: '-0.01em'
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <CourseCard c={c} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{background: 'var(--canvas)', padding: '88px 0'}}>
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: 36}}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--brand-600)',
              marginBottom: 8
            }}>
              Questions?
            </div>
            <h2 style={{fontSize: 36, margin: '0', color: 'var(--ink-900)'}}>How tracks work</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            <div style={{
              background: 'var(--ink-100)',
              border: '1px solid var(--ink-200)',
              borderRadius: 14,
              padding: 28
            }}>
              <h3 style={{margin: '0 0 12px', fontSize: 18, fontWeight: 700}}>Can I switch tracks?</h3>
              <p style={{margin: 0, fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6}}>
                Yes. Many learners pivot once they discover their focus. We support transitions within the first 2 weeks.
              </p>
            </div>
            <div style={{
              background: 'var(--ink-100)',
              border: '1px solid var(--ink-200)',
              borderRadius: 14,
              padding: 28
            }}>
              <h3 style={{margin: '0 0 12px', fontSize: 18, fontWeight: 700}}>Prerequisites?</h3>
              <p style={{margin: 0, fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6}}>
                Most tracks are beginner-friendly. We assess and provide resources to bridge any gaps.
              </p>
            </div>
            <div style={{
              background: 'var(--ink-100)',
              border: '1px solid var(--ink-200)',
              borderRadius: 14,
              padding: 28
            }}>
              <h3 style={{margin: '0 0 12px', fontSize: 18, fontWeight: 700}}>Multiple tracks?</h3>
              <p style={{margin: 0, fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6}}>
                Combine self-paced courses with bootcamps. Take them back-to-back for deeper focus.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{background: '#020617', color: '#fff', padding: '96px 0', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(700px 400px at 20% 100%, rgba(37,99,235,0.35), transparent 60%), radial-gradient(600px 400px at 90% -10%, rgba(37,99,235,0.2), transparent 60%)', pointerEvents: 'none'}} />
        <div className="container" style={{position: 'relative', textAlign: 'center'}}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--brand-200)',
            marginBottom: 12
          }}>
            Ready to start?
          </div>
          <h2 style={{fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '12px auto 14px', maxWidth: 800}}>
            Begin your journey in {category.title}
          </h2>
          <p style={{color: 'rgba(255,255,255,0.72)', fontSize: 17, maxWidth: 560, margin: '0 auto 28px'}}>
            Join thousands of learners who've transformed their careers through focused, outcome-driven learning.
          </p>
          <div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
            <a href="#" className="btn btn-primary btn-lg">Enroll Now <I.Arrow size={16}/></a>
            <a href="#" className="btn btn-lg" style={{background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff"}}>Contact Us</a>
          </div>
        </div>
      </section>
    </div>
  )
}

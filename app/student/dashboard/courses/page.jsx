'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { pageBg, shell, card, errorAlert } from '../_components/ui'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('payload-token') : ''
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [certificateMap, setCertificateMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payingCourseId, setPayingCourseId] = useState(null)
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

        const [coursesRes, meRes, enrollmentRes, progressRes, certificatesRes] = await Promise.all([
          fetch('/api/courses?limit=100'),
          fetch('/api/users/me', { headers: authHeaders() }),
          fetch('/api/enrollments?limit=200', { headers: authHeaders() }),
          fetch('/api/student/progress', { headers: authHeaders() }),
          fetch('/api/student/certificates', { headers: authHeaders() }),
        ])

        const coursesData = await coursesRes.json()
        const meData = await meRes.json()
        const enrollmentData = await enrollmentRes.json()
        const progressData = await progressRes.json().catch(() => ({}))
        const certificatesData = await certificatesRes.json().catch(() => ({}))
        const student = meData?.user ?? meData

        const enrolled = (enrollmentData?.docs || [])
          .filter(e => String(e?.student?.id ?? e?.student) === String(student?.id) && e?.status === 'paid')
          .map(e => String(e?.course?.id ?? e?.course))

        if (!active) return
        setCourses(coursesData?.docs || [])
        setEnrolledIds(enrolled)
        setProgressMap(buildProgressMap(progressData?.docs || []))
        setCertificateMap(buildCertificateMap(certificatesData?.docs || []))
        setLoading(false)
      } catch {
        if (!active) return
        setError('Failed to load courses')
        setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [router])

  async function handlePayAndEnroll(courseId) {
    setPayingCourseId(courseId)
    setError('')
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Payment initialization failed.')

      if (data?.enrolled) {
        setEnrolledIds(prev => prev.includes(String(courseId)) ? prev : [...prev, String(courseId)])
      } else if (data?.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        throw new Error('No checkout URL returned.')
      }
    } catch (e) {
      setError(e.message || 'Payment initialization failed.')
    } finally {
      setPayingCourseId(null)
    }
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-400)' }}>Loading courses...</div>
  }

  const ownedCourses = courses.filter(course => enrolledIds.includes(String(course.id)))
  const browseCourses = courses.filter(course => !enrolledIds.includes(String(course.id)))

  return (
    <div style={{ minHeight: '100vh', background: pageBg.background }}>
      <div className="container" style={{ padding: shell.padding }}>
        <Link href="/student/dashboard" style={{ color: 'var(--brand-600)', textDecoration: 'none', fontSize: 14 }}>Back to Dashboard</Link>

        <div style={heroStyle}>
          <div>
            <div style={eyebrowStyle}>Student Courses</div>
            <h1 style={{ margin: '10px 0 10px', color: 'var(--ink-900)', fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.02 }}>
              Your purchased courses, ready when you are.
            </h1>
            <p style={{ margin: 0, color: 'var(--ink-600)', lineHeight: 1.8, maxWidth: 720 }}>
              This page is now your learning workspace first. Continue enrolled programs, reopen lessons, and browse additional courses below whenever you want to expand your track.
            </p>
          </div>
          <div style={heroStatsStyle}>
            <div style={heroStatCardStyle}>
              <div style={heroStatValueStyle}>{ownedCourses.length}</div>
              <div style={heroStatLabelStyle}>My courses</div>
            </div>
            <div style={heroStatCardStyle}>
              <div style={heroStatValueStyle}>{browseCourses.length}</div>
              <div style={heroStatLabelStyle}>More to explore</div>
            </div>
          </div>
        </div>

        {error && <div style={{ ...errorAlert, padding: 12, marginBottom: 14 }}>{error}</div>}

        <section style={{ marginBottom: 28 }}>
          <div style={sectionHeadStyle}>
            <div>
              <div style={sectionLabelStyle}>My Courses</div>
              <h2 style={sectionTitleStyle}>Continue where you left off</h2>
            </div>
            <Link href="/courses" style={sectionLinkStyle}>Browse full catalog</Link>
          </div>

          {ownedCourses.length ? (
            <div style={coursesGridStyle}>
              {ownedCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled
                  progress={progressMap[String(course.id)]}
                  certificate={certificateMap[String(course.id)]}
                />
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <h3 style={{ margin: 0, color: 'var(--ink-900)' }}>No purchased courses yet</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--ink-600)', lineHeight: 1.7 }}>
                Once you enroll in a course, it will appear here with direct access to lessons, resources, and your certificate path.
              </p>
            </div>
          )}
        </section>

        <section>
          <div style={sectionHeadStyle}>
            <div>
              <div style={sectionLabelStyle}>Browse More Courses</div>
              <h2 style={sectionTitleStyle}>Expand your skills with another track</h2>
            </div>
          </div>

          <div style={browseIntroStyle}>
            <p style={{ margin: 0, color: 'var(--ink-600)', lineHeight: 1.75, maxWidth: 760 }}>
              Explore additional programs, compare pricing, and enroll securely through Paystack. The full catalog is also available on the public courses page with direct search and category filters.
            </p>
            <Link href="/courses" style={browseCatalogButtonStyle}>Open Public Catalog</Link>
          </div>

          <div style={coursesGridStyle}>
            {browseCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={false}
                payingCourseId={payingCourseId}
                onPay={handlePayAndEnroll}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function CourseCard({ course, enrolled, payingCourseId, onPay, progress, certificate }) {
  const price = formatPrice(course.price)
  const oldPrice = formatPrice(course.old)
  const courseThumbnail = course.thumbnail || course.category?.thumbnail || fallbackThumbnail(course)
  const totalLessons = Number(course.lessons || course.courseContent?.length || 0)
  const completedLessons = enrolled ? Math.max(0, Math.min(Number(progress?.completedLessons || 0), totalLessons || Number(progress?.completedLessons || 0))) : 0
  const nextLesson = enrolled ? Math.max(1, Number(progress?.lastLessonIndex || 0) + 1) : null
  const progressValue = enrolled && totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 0

  return (
    <article style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 24, boxShadow: '0 18px 38px rgba(15,23,42,0.08)' }}>
      <div style={thumbnailWrapStyle}>
        <img
          src={courseThumbnail}
          alt={course.title || 'Course thumbnail'}
          style={thumbnailStyle}
        />
        <div style={thumbnailOverlayStyle} />
        <div style={badgeRowStyle}>
          <span style={categoryPillStyle}>{course.category?.title || 'General'}</span>
          {course.tag ? <span style={tagPillStyle(course.tagHot)}>{course.tag}</span> : null}
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            {course.code || 'Course'}
          </div>
          <h3 style={{ margin: 0, color: 'var(--ink-900)', fontSize: 22, lineHeight: 1.2 }}>{course.title || 'Untitled Course'}</h3>
        </div>

        <p style={{ margin: 0, color: 'var(--ink-600)', lineHeight: 1.75, minHeight: 78 }}>
          {course.desc || 'No description yet.'}
        </p>

        <div style={metaGridStyle}>
          <div style={metaCardStyle}>
            <span style={metaLabelStyle}>Duration</span>
            <strong style={metaValueStyle}>{course.duration || 'Flexible'}</strong>
          </div>
          <div style={metaCardStyle}>
            <span style={metaLabelStyle}>Level</span>
            <strong style={metaValueStyle}>{course.level || 'All levels'}</strong>
          </div>
          <div style={metaCardStyle}>
            <span style={metaLabelStyle}>Lessons</span>
            <strong style={metaValueStyle}>{course.lessons || 0}</strong>
          </div>
        </div>

        {enrolled ? (
          <div style={progressCardStyle}>
            <div style={progressHeaderStyle}>
              <strong style={progressTitleStyle}>{progressValue}% complete</strong>
              <span style={progressMetaStyle}>
                {totalLessons > 0 ? `${completedLessons}/${totalLessons} lessons` : 'Progress available after lessons load'}
              </span>
            </div>
            <div style={progressTrackStyle}>
              <div style={{ ...progressFillStyle, width: `${progressValue}%` }} />
            </div>
            <div style={continueHintStyle}>
              {nextLesson ? `Continue from lesson ${Math.min(nextLesson, Math.max(totalLessons, nextLesson))}` : 'Open course to begin'}
            </div>
          </div>
        ) : null}

        {enrolled && certificate ? (
          <div style={certificateCardStyle}>
            <strong style={{ color: '#14532d', fontSize: 14 }}>Certificate issued</strong>
            <div style={{ marginTop: 6, color: '#166534', fontSize: 13, lineHeight: 1.6 }}>
              Code: {certificate.certificateCode}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 'auto' }}>
          <div style={priceRowStyle}>
            <div>
              <div style={currentPriceStyle}>{price}</div>
              {oldPrice ? <div style={oldPriceStyle}>{oldPrice}</div> : null}
            </div>
            {enrolled ? <span style={statusPillStyle}>Enrolled</span> : <span style={certificateHintStyle}>Certificate eligible</span>}
          </div>
        </div>

        {enrolled ? (
          <Link href={`/student/dashboard/courses/${course.id}`} style={openCourseButtonStyle}>
            {nextLesson ? `Continue Lesson ${Math.min(nextLesson, Math.max(totalLessons, nextLesson))}` : 'Start Course'}
          </Link>
        ) : (
          <button
            onClick={() => onPay(course.id)}
            disabled={payingCourseId === course.id}
            style={payButtonStyle}
          >
            {payingCourseId === course.id ? 'Redirecting to Paystack...' : 'Pay & Enroll'}
          </button>
        )}
      </div>
    </article>
  )
}

function buildProgressMap(docs) {
  return docs.reduce((acc, doc) => {
    const courseId = String(doc?.course?.id ?? doc?.course ?? '')
    if (!courseId) return acc
    acc[courseId] = {
      lastLessonIndex: Number(doc?.lastOpenedLessonIndex || 0),
      completedLessons: Array.isArray(doc?.completedLessonIndexes) ? doc.completedLessonIndexes.length : 0,
      completedLessonIndexes: Array.isArray(doc?.completedLessonIndexes) ? doc.completedLessonIndexes : [],
    }
    return acc
  }, {})
}

function buildCertificateMap(docs) {
  return docs.reduce((acc, doc) => {
    const courseId = String(doc?.course?.id ?? doc?.course ?? '')
    if (!courseId) return acc
    acc[courseId] = doc
    return acc
  }, {})
}

function formatPrice(value) {
  if (!value) return 'Price unavailable'
  return String(value).replace(/â¦/g, 'N').replace(/₦/g, 'N')
}

function fallbackThumbnail(course) {
  const title = escapeSvg(course?.title || 'Course')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#163b72"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#g)"/>
      <circle cx="640" cy="120" r="90" fill="rgba(255,255,255,0.10)"/>
      <circle cx="130" cy="410" r="120" fill="rgba(255,255,255,0.08)"/>
      <text x="56" y="220" fill="#eff6ff" font-family="Arial, sans-serif" font-size="28" font-weight="700">TECHFRONT HUB</text>
      <text x="56" y="272" fill="white" font-family="Arial, sans-serif" font-size="42" font-weight="700">${title}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function escapeSvg(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const heroStyle = {
  ...card,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 18,
  alignItems: 'start',
  padding: 24,
  marginTop: 18,
  marginBottom: 22,
  borderRadius: 28,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(239,246,255,0.98))',
}

const eyebrowStyle = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(37,99,235,0.1)',
  color: 'var(--brand-700)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
}

const heroStatsStyle = {
  display: 'grid',
  gap: 12,
}

const heroStatCardStyle = {
  borderRadius: 20,
  padding: 18,
  background: '#0f172a',
  color: '#fff',
}

const heroStatValueStyle = {
  fontSize: 28,
  fontWeight: 800,
  lineHeight: 1,
}

const heroStatLabelStyle = {
  marginTop: 8,
  fontSize: 13,
  color: 'rgba(226,232,240,0.72)',
}

const sectionHeadStyle = {
  display: 'flex',
  alignItems: 'end',
  justifyContent: 'space-between',
  gap: 18,
  marginBottom: 16,
  flexWrap: 'wrap',
}

const sectionLabelStyle = {
  color: 'var(--brand-700)',
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '.12em',
}

const sectionTitleStyle = {
  margin: '8px 0 0',
  fontSize: 'clamp(24px, 3vw, 34px)',
  lineHeight: 1.1,
  color: 'var(--ink-900)',
}

const sectionLinkStyle = {
  color: 'var(--brand-700)',
  textDecoration: 'none',
  fontWeight: 700,
}

const coursesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 20,
}

const emptyStateStyle = {
  ...card,
  borderRadius: 24,
  padding: 28,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))',
}

const browseIntroStyle = {
  ...card,
  borderRadius: 22,
  marginBottom: 18,
  padding: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
}

const browseCatalogButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 16px',
  borderRadius: 14,
  background: '#0f172a',
  color: '#fff',
  fontWeight: 800,
  textDecoration: 'none',
}

const progressCardStyle = {
  borderRadius: 18,
  padding: 14,
  background: 'linear-gradient(135deg, rgba(239,246,255,0.92), rgba(248,250,252,0.98))',
  border: '1px solid rgba(37,99,235,0.12)',
}

const certificateCardStyle = {
  borderRadius: 18,
  padding: 14,
  background: '#ecfdf5',
  border: '1px solid rgba(34,197,94,0.18)',
}

const progressHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 10,
}

const progressTitleStyle = {
  color: 'var(--ink-900)',
  fontSize: 14,
}

const progressMetaStyle = {
  color: 'var(--ink-600)',
  fontSize: 12,
  fontWeight: 700,
}

const progressTrackStyle = {
  width: '100%',
  height: 10,
  borderRadius: 999,
  background: 'rgba(148,163,184,0.24)',
  overflow: 'hidden',
}

const progressFillStyle = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #2563eb, #0ea5e9)',
}

const continueHintStyle = {
  marginTop: 10,
  color: 'var(--brand-700)',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
}

const thumbnailWrapStyle = {
  position: 'relative',
  aspectRatio: '16 / 10',
  overflow: 'hidden',
  background: '#dbeafe',
}

const thumbnailStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}

const thumbnailOverlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.48))',
}

const badgeRowStyle = {
  position: 'absolute',
  left: 14,
  right: 14,
  top: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
}

const categoryPillStyle = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.92)',
  color: '#0f172a',
  fontSize: 12,
  fontWeight: 700,
}

const tagPillStyle = (hot) => ({
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: 999,
  background: hot ? '#f97316' : 'rgba(15,23,42,0.82)',
  color: '#fff',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '.08em',
})

const metaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
  gap: 10,
}

const metaCardStyle = {
  borderRadius: 16,
  padding: 12,
  background: '#f8fafc',
  border: '1px solid var(--ink-200)',
}

const metaLabelStyle = {
  display: 'block',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '.08em',
  color: 'var(--ink-500)',
  marginBottom: 6,
}

const metaValueStyle = {
  color: 'var(--ink-900)',
  fontSize: 14,
}

const priceRowStyle = {
  display: 'flex',
  alignItems: 'end',
  justifyContent: 'space-between',
  gap: 14,
  marginBottom: 14,
}

const currentPriceStyle = {
  color: 'var(--brand-700)',
  fontWeight: 800,
  fontSize: 24,
  lineHeight: 1,
}

const oldPriceStyle = {
  marginTop: 6,
  color: 'var(--ink-500)',
  textDecoration: 'line-through',
  fontSize: 13,
}

const statusPillStyle = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: 999,
  background: '#dcfce7',
  color: '#166534',
  fontSize: 12,
  fontWeight: 800,
}

const certificateHintStyle = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: 999,
  background: '#eff6ff',
  color: '#1d4ed8',
  fontSize: 12,
  fontWeight: 800,
}

const openCourseButtonStyle = {
  display: 'block',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '13px 16px',
  borderRadius: 14,
  background: 'var(--brand-600)',
  color: '#fff',
  fontWeight: 800,
}

const payButtonStyle = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 14,
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
}

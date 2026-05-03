'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useInstructor } from '../context'

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function authHeaders() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('instructor-token')
    : ''
  return { Authorization: `JWT ${token}` }
}

async function fetchCount(url) {
  try {
    const res = await fetch(url, { headers: authHeaders() })
    if (!res.ok) return 0
    const data = await res.json()
    return data?.totalDocs ?? 0
  } catch {
    return 0
  }
}

/* ── Course tag badge ─────────────────────────────────────────────────────── */
function TagBadge({ tag }) {
  if (!tag || typeof tag !== 'string') return null
  return <span className="i-badge i-badge-purple">{tag}</span>
}

function getCourseTag(course) {
  const category = course?.category
  if (typeof category === 'string') return category
  if (category && typeof category === 'object') {
    return category.title || category.name || category.n || null
  }
  return course?.tag || course?.level || null
}

/* ── Inline SVG icons ─────────────────────────────────────────────────────── */
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconEmpty() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 15s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* ── Page component ───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const ctx = useInstructor()
  const instructor = ctx?.instructor

  const [stats, setStats]               = useState({ courses: 0, announcements: 0 })
  const [courses, setCourses]           = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingCards, setLoadingCards] = useState(true)

  /* Fetch stats */
  useEffect(() => {
    if (!instructor?.id) return

    Promise.all([
      fetchCount(`/api/courses?where[instructor][equals]=${instructor.id}&limit=0`),
      fetchCount('/api/announcements?limit=0'),
    ]).then(([courses, announcements]) => {
      setStats({ courses, announcements })
      setLoadingStats(false)
    })
  }, [instructor?.id])

  /* Fetch cards */
  useEffect(() => {
    if (!instructor?.id) return

    const headers = authHeaders()

    Promise.all([
      fetch(`/api/courses?where[instructor][equals]=${instructor.id}&limit=3&sort=-createdAt`, { headers })
        .then(r => r.ok ? r.json() : { docs: [] })
        .then(d => d.docs ?? []),
    ]).then(([c]) => {
      setCourses(c)
      setLoadingCards(false)
    }).catch(() => setLoadingCards(false))
  }, [instructor?.id])

  if (!instructor) {
    return (
      <div className="i-loading">
        <div className="i-spinner" />
        Loading dashboard…
      </div>
    )
  }

  const firstName = instructor.name?.split(' ')[0] || 'Instructor'

  const statCards = [
    {
      label:   'Total Courses',
      value:   stats.courses,
      color:   'blue',
      icon:    <IconBook />,
      loading: loadingStats,
    },
    {
      label:   'Announcements Sent',
      value:   stats.announcements,
      color:   'orange',
      icon:    <IconBell />,
      loading: loadingStats,
    },
  ]

  return (
    <div className="i-page">

      {/* Page header */}
      <div className="i-page-header">
        <div>
          <h1 className="i-page-title">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="i-page-subtitle">{formatDate()}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="i-stats-grid">
        {statCards.map(({ label, value, color, icon, loading }) => (
          <div key={label} className={`i-stat i-stat-${color}`}>
            <div className="i-stat-icon">{icon}</div>
            <div className="i-stat-body">
              <div className="i-stat-value">
                {loading ? <span className="i-skeleton i-skeleton-num" /> : value}
              </div>
              <div className="i-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="i-two-col">

        {/* My Courses */}
        <div className="i-card">
          <div className="i-card-header">
            <h2 className="i-card-title">My Courses</h2>
            <Link href="/instructor/courses" className="i-link-sm">
              View all <IconArrowRight />
            </Link>
          </div>
          <div className="i-card-body">
            {loadingCards ? (
              <div className="i-loading-inline">
                <div className="i-spinner i-spinner-sm" />
              </div>
            ) : courses.length === 0 ? (
              <div className="i-empty-state">
                <IconEmpty />
                <p>No courses yet. Create your first course.</p>
                <Link href="/instructor/courses/create" className="i-btn i-btn-primary i-btn-sm">
                  <IconPlus /> New Course
                </Link>
              </div>
            ) : (
              <ul className="i-course-list">
                {courses.map(course => (
                  <li key={course.id} className="i-course-item">
                    <div className="i-course-info">
                      <Link href={`/instructor/courses/${course.id}`} className="i-course-title">
                        {course.title ?? 'Untitled Course'}
                      </Link>
                      <TagBadge tag={getCourseTag(course)} />
                    </div>
                    <div className="i-course-meta">
                      <span className="i-course-enrollments">— enrolled</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* Quick actions */}
      <div className="i-card">
        <div className="i-card-header">
          <h2 className="i-card-title">Quick Actions</h2>
        </div>
        <div className="i-card-body">
          <div className="i-quick-actions">
            <Link href="/instructor/courses/create" className="i-btn i-btn-primary">
              <IconPlus /> New Course
            </Link>
            <Link href="/instructor/announcements" className="i-btn i-btn-secondary">
              <span aria-hidden="true">📢</span> Announce
            </Link>
            <Link href="/instructor/courses" className="i-btn i-btn-secondary">
              <IconUsers /> View Students
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}

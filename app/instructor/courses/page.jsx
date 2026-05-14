'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useInstructor } from '../context'

/* ── Auth helper ──────────────────────────────────────────────────────────── */
function authHeaders() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('instructor-token')
    : ''
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

/* ── Tag badge colours ────────────────────────────────────────────────────── */
const TAG_CLASS = {
  BOOTCAMP: 'i-badge-blue',
  NEW:      'i-badge-green',
  POPULAR:  'i-badge-orange',
  ADVANCED: 'i-badge-purple',
  LIVE:     'i-badge-red',
}

/* ── Inline SVG icons ─────────────────────────────────────────────────────── */
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function IconFire() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11" aria-hidden="true">
      <path d="M12 2c0 0-4 4-4 9a4 4 0 0 0 8 0c0-3-1.5-5-1.5-5S13 8 11 9c0-2 1-7 1-7z" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" />
    </svg>
  )
}

/* ── Course card ──────────────────────────────────────────────────────────── */
function CourseCard({ course, onDelete }) {
  const bannerStyle = course.thumbnail
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(7, 10, 20, 0.18), rgba(7, 10, 20, 0.18)), url(${course.thumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(135deg, #163b72, #0f1f3d)',
      }

  const metaParts = [
    course.level,
    course.duration,
    course.lessons != null ? `${course.lessons} lessons` : null,
  ].filter(Boolean)

  const status = course.tag || course.level || 'DRAFT'

  return (
    <div className="i-course-card">
      {/* Banner */}
      <div className="i-course-card-banner" style={bannerStyle}>
        <div className="i-course-card-banner-top">
          {course.tag && (
            <span className={`i-badge ${TAG_CLASS[course.tag] ?? 'i-badge-gray'}`}>
              {course.tagHot && <IconFire />} {course.tag}
            </span>
          )}
        </div>
        {course.code && (
          <div className="i-course-card-code">{course.code}</div>
        )}
      </div>

      {/* Body */}
      <div className="i-course-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <h3 className="i-course-card-title" style={{ marginBottom: 0 }}>{course.title ?? 'Untitled Course'}</h3>
          <span className="i-badge i-badge-purple">{status}</span>
        </div>
        {course.desc && (
          <p className="i-course-card-desc">{course.desc}</p>
        )}
        {metaParts.length > 0 && (
          <div className="i-course-card-meta">
            {metaParts.join(' · ')}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="i-course-card-footer">
        <div className="i-course-card-price">
          {course.price != null
            ? `₦${Number(course.price).toLocaleString()}`
            : <span className="i-muted">No price set</span>
          }
          {course.old && (
            <span className="i-course-card-old-price">{course.old}</span>
          )}
        </div>
        <div className="i-course-card-actions">
          <Link
            href={`/instructor/courses/${course.id}`}
            className="i-btn i-btn-secondary i-btn-sm"
            title="Edit course"
          >
            <IconEdit /> Edit
          </Link>
          <button
            onClick={() => onDelete(course)}
            className="i-btn i-btn-danger i-btn-sm"
            title="Delete course"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function CoursesPage() {
  const ctx        = useInstructor()
  const instructor = ctx?.instructor

  const [courses, setCourses]   = useState([])
  const [query, setQuery]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [deleting, setDeleting] = useState(null) // course id being deleted

  /* Fetch courses */
  useEffect(() => {
    if (!instructor?.id) return
    setLoading(true)
    setError(null)
    fetch(
      `/api/courses?where[instructor][equals]=${instructor.id}&limit=100&sort=-createdAt`,
      { headers: authHeaders() }
    )
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => { setCourses(data.docs ?? []); setLoading(false) })
      .catch(err  => { setError(err.message); setLoading(false) })
  }, [instructor?.id])

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter(course => {
      const matchesQuery =
        !q ||
        [course.title, course.code, course.desc, course.level, course.tag]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q))
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'tagged' && !!course.tag) ||
        (statusFilter === 'draft' && !course.tag)
      return matchesQuery && matchesStatus
    })
  }, [courses, query, statusFilter])

  /* Delete a course */
  async function handleDelete(course) {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return
    setDeleting(course.id)
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setCourses(prev => prev.filter(c => c.id !== course.id))
    } catch (err) {
      alert(`Failed to delete course: ${err.message}`)
    } finally {
      setDeleting(null)
    }
  }

  /* ── Render ── */
  return (
    <div className="i-page">

      {/* Header */}
      <div className="i-page-header">
        <div>
          <h1 className="i-page-title">My Courses</h1>
          <p className="i-page-subtitle">
            {loading ? 'Loading…' : `${filteredCourses.length} of ${courses.length} course${courses.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/instructor/courses/create" className="i-btn i-btn-primary">
          <IconPlus /> New Course
        </Link>
      </div>

      <div className="i-card i-card-pad" style={{ marginBottom: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12 }}>
          <label className="i-field" style={{ marginBottom: 0 }}>
            <span className="i-label">Search</span>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--i-muted)' }}><IconSearch /></span>
              <input
                className="i-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, code, tag, or level"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </label>
          <label className="i-field" style={{ marginBottom: 0 }}>
            <span className="i-label">Filter</span>
            <select className="i-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All courses</option>
              <option value="tagged">Tagged courses</option>
              <option value="draft">Draft / no tag</option>
            </select>
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="i-alert i-alert-error">
          Failed to load courses: {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="i-course-grid">
          {[1, 2, 3].map(n => (
            <div key={n} className="i-course-card i-course-card-skeleton">
              <div className="i-course-card-banner i-skeleton" style={{ height: 110 }} />
              <div className="i-course-card-body">
                <div className="i-skeleton i-skeleton-line" style={{ width: '70%', height: 18, marginBottom: 8 }} />
                <div className="i-skeleton i-skeleton-line" style={{ width: '90%', height: 13, marginBottom: 4 }} />
                <div className="i-skeleton i-skeleton-line" style={{ width: '60%', height: 13 }} />
              </div>
              <div className="i-course-card-footer">
                <div className="i-skeleton i-skeleton-line" style={{ width: 60, height: 16 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses grid */}
      {!loading && !error && filteredCourses.length > 0 && (
        <div className="i-course-grid">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              style={{ opacity: deleting === course.id ? 0.4 : 1, pointerEvents: deleting === course.id ? 'none' : 'auto', transition: 'opacity 0.2s' }}
            >
              <CourseCard course={course} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredCourses.length === 0 && (
        <div className="i-empty">
          <div className="i-empty-icon">
            <IconBook />
          </div>
          <h2 className="i-empty-title">{courses.length === 0 ? 'No courses yet' : 'No matching courses'}</h2>
          <p className="i-empty-text">
            {courses.length === 0 ? 'Create your first course to start teaching on TechFront.' : 'Try a different search or filter.'}
          </p>
          <Link href="/instructor/courses/create" className="i-btn i-btn-primary">
            <IconPlus /> {courses.length === 0 ? 'Create Your First Course' : 'New Course'}
          </Link>
        </div>
      )}

    </div>
  )
}

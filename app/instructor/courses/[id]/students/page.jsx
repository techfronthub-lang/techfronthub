'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useInstructor } from '../../../context'

/* ── Auth helper ──────────────────────────────────────────────────────────── */
function authHeaders() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('instructor-token')
    : ''
  return { Authorization: `JWT ${token}` }
}

/* ── Inline SVG icons ─────────────────────────────────────────────────────── */
function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconExternalLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/**
 * Derive student rows from a flat array of submissions.
 * Returns one row per unique student email with aggregated stats.
 */
function deriveStudents(submissions) {
  const map = {}

  for (const sub of submissions) {
    const email = sub.studentEmail ?? sub.student?.email
    if (!email) continue

    if (!map[email]) {
      map[email] = {
        email,
        submitted:   0,
        graded:      0,
        grades:      [],
        lastActivity: null,
      }
    }

    const row = map[email]
    row.submitted++

    if (sub.status === 'graded') {
      row.graded++
      if (sub.grade != null) row.grades.push(sub.grade)
    }

    const ts = sub.createdAt ? new Date(sub.createdAt).getTime() : 0
    if (!row.lastActivity || ts > new Date(row.lastActivity).getTime()) {
      row.lastActivity = sub.createdAt
    }
  }

  return Object.values(map).sort((a, b) => {
    // Sort by most recent activity
    const ta = a.lastActivity ? new Date(a.lastActivity).getTime() : 0
    const tb = b.lastActivity ? new Date(b.lastActivity).getTime() : 0
    return tb - ta
  })
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function CourseStudentsPage() {
  const { id }     = useParams()
  useInstructor()

  const [course,      setCourse]      = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    const h = authHeaders()
    Promise.all([
      fetch(`/api/courses/${id}`, { headers: h })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
        .then(data => data),
      fetch(
        `/api/submissions?where[assignment.course][equals]=${id}&limit=500&depth=1`,
        { headers: h }
      )
        .then(r => r.ok ? r.json() : { docs: [] })
        .then(d => d.docs ?? []),
    ])
      .then(([courseData, subs]) => {
        setCourse(courseData)
        setSubmissions(subs)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const courseTitle = course?.title ?? 'Course'
  const students    = deriveStudents(submissions)

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="i-page">
        <div className="i-loading">
          <div className="i-spinner" />
          Loading students…
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="i-page">

        {/* Breadcrumb */}
        <nav className="i-breadcrumb" aria-label="Breadcrumb">
          <Link href="/instructor/courses" className="i-breadcrumb-link">
            My Courses
          </Link>
          <span className="i-breadcrumb-sep" aria-hidden="true">
            <IconChevronRight />
          </span>
          <span className="i-breadcrumb-current">Students</span>
        </nav>

        <div className="i-alert i-alert-error">
          Failed to load data: {error}
        </div>
      </div>
    )
  }

  /* ── Render ── */
  return (
    <div className="i-page">

      {/* Breadcrumb */}
      <nav className="i-breadcrumb" aria-label="Breadcrumb">
        <Link href="/instructor/courses" className="i-breadcrumb-link">
          My Courses
        </Link>
        <span className="i-breadcrumb-sep" aria-hidden="true">
          <IconChevronRight />
        </span>
        <Link href={`/instructor/courses/${id}`} className="i-breadcrumb-link">
          {courseTitle}
        </Link>
        <span className="i-breadcrumb-sep" aria-hidden="true">
          <IconChevronRight />
        </span>
        <span className="i-breadcrumb-current">Students</span>
      </nav>

      {/* Page header */}
      <div className="i-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 className="i-page-title" style={{ margin: 0 }}>
            {courseTitle} — Students
          </h1>
          <span
            className="i-badge i-badge-blue"
            style={{ fontSize: '0.85rem', padding: '0.25rem 0.65rem' }}
          >
            {students.length} student{students.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="i-page-subtitle" style={{ marginTop: '0.25rem' }}>
          Derived from submission activity for this course
        </p>
      </div>

      {/* Empty state */}
      {students.length === 0 && (
        <div className="i-empty">
          <div className="i-empty-icon">
            <IconUsers />
          </div>
          <h2 className="i-empty-title">No students yet</h2>
          <p className="i-empty-text">
            No students have submitted work yet for this course.
          </p>
        </div>
      )}

      {/* Students table */}
      {students.length > 0 && (
        <div className="i-card">
          <div className="i-card-body" style={{ padding: 0 }}>
            <div className="i-table-wrap">
              <table className="i-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th style={{ textAlign: 'center' }}>Submitted</th>
                    <th style={{ textAlign: 'center' }}>Graded</th>
                    <th style={{ textAlign: 'center' }}>Avg Grade</th>
                    <th>Last Activity</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => {
                    const avgGrade = student.grades.length > 0
                      ? Math.round(student.grades.reduce((a, b) => a + b, 0) / student.grades.length)
                      : null

                    const gradeColor = avgGrade == null
                      ? 'inherit'
                      : avgGrade >= 70 ? '#16a34a'
                      : avgGrade >= 50 ? '#d97706'
                      : '#dc2626'

                    return (
                      <tr key={student.email}>
                        <td>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize:   '0.82rem',
                              fontWeight: 500,
                            }}
                          >
                            {student.email}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="i-badge i-badge-blue">
                            {student.submitted}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {student.graded > 0 ? (
                            <span className="i-badge i-badge-green">{student.graded}</span>
                          ) : (
                            <span className="i-muted">0</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: gradeColor }}>
                          {avgGrade != null ? `${avgGrade}%` : <span className="i-muted">—</span>}
                        </td>
                        <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                          {fmtDate(student.lastActivity)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            href={`/instructor/assignments?course=${id}&student=${encodeURIComponent(student.email)}`}
                            className="i-btn i-btn-secondary i-btn-sm"
                            title="View this student's submissions"
                          >
                            View Submissions <IconExternalLink />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

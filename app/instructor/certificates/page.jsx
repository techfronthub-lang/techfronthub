'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstructor } from '../context'

/* ── Auth helper ──────────────────────────────────────────────────────────── */
function authHeaders() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('instructor-token')
    : ''
  return { Authorization: `JWT ${token}` }
}

/* ── Inline SVG icons ─────────────────────────────────────────────────────── */
function IconAward() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
}
function IconAwardSm() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6"  y1="6" x2="18" y2="18" />
    </svg>
  )
}

/* ── Toast ────────────────────────────────────────────────────────────────── */
function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [message, onDismiss])

  if (!message) return null
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position:     'fixed',
        bottom:       '1.5rem',
        right:        '1.5rem',
        zIndex:       9999,
        background:   '#16a34a',
        color:        '#fff',
        padding:      '0.75rem 1.25rem',
        borderRadius: '0.5rem',
        display:      'flex',
        alignItems:   'center',
        gap:          '0.5rem',
        boxShadow:    '0 4px 16px rgba(0,0,0,0.25)',
        fontSize:     '0.9rem',
        maxWidth:     '360px',
      }}
    >
      <IconCheck /> {message}
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 2px' }}
      >
        <IconX />
      </button>
    </div>
  )
}

/* ── Eligibility computation ─────────────────────────────────────────────── */
/**
 * Returns an array of eligible student objects for a given course.
 * A student is eligible if they have a graded submission (grade >= 60)
 * for EVERY assignment belonging to the course.
 */
function computeEligibleStudents(course, assignments, submissions) {
  const courseId = course.id

  // Assignments that belong to this course
  const courseAssignments = assignments.filter(a => {
    const c = a.course
    if (!c) return false
    return (typeof c === 'string' ? c : c.id) === courseId
  })

  if (courseAssignments.length === 0) return []

  const courseAssignmentIds = new Set(courseAssignments.map(a => a.id))

  // Submissions that relate to any of this course's assignments
  const courseSubs = submissions.filter(s => {
    const aRef = s.assignment
    if (!aRef) return false
    const aId = typeof aRef === 'string' ? aRef : aRef.id
    return courseAssignmentIds.has(aId)
  })

  // Get unique student emails
  const emails = [...new Set(courseSubs.map(s => s.studentEmail ?? s.student?.email).filter(Boolean))]

  return emails.reduce((eligible, email) => {
    const studentSubs = courseSubs.filter(s =>
      (s.studentEmail ?? s.student?.email) === email
    )

    // For each assignment, check if there's a graded submission with grade >= 60
    const passedAssignments = courseAssignments.filter(a => {
      return studentSubs.some(s => {
        const aRef = s.assignment
        const aId  = typeof aRef === 'string' ? aRef : aRef?.id
        return aId === a.id && s.status === 'graded' && (s.grade ?? 0) >= 60
      })
    })

    if (passedAssignments.length < courseAssignments.length) return eligible

    // Compute average grade
    const gradedSubs = studentSubs.filter(s => s.status === 'graded' && s.grade != null)
    const avgGrade = gradedSubs.length > 0
      ? Math.round(gradedSubs.reduce((sum, s) => sum + s.grade, 0) / gradedSubs.length)
      : null

    eligible.push({
      email,
      course:             course.title ?? 'Untitled Course',
      courseId,
      assignmentsPassed:  passedAssignments.length,
      totalAssignments:   courseAssignments.length,
      avgGrade,
    })
    return eligible
  }, [])
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function CertificatesPage() {
  const ctx        = useInstructor()
  const instructor = ctx?.instructor

  const [courses,     setCourses]     = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  const [filterCourse, setFilterCourse] = useState('all')
  const [issued,       setIssued]       = useState({})   // key: `${email}::${courseId}` → true
  const [toast,        setToast]        = useState(null)

  useEffect(() => {
    if (!instructor?.id) return
    setLoading(true)
    setError(null)

    const h = authHeaders()
    fetch(`/api/courses?where[instructor][equals]=${instructor.id}&limit=100`, { headers: h })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`Courses: HTTP ${r.status}`)))
      .then(async courseData => {
        const ownCourses = courseData.docs ?? []
        const courseIds = ownCourses.map(course => course.id)

        setCourses(ownCourses)

        if (courseIds.length === 0) {
          setAssignments([])
          setSubmissions([])
          setLoading(false)
          return
        }

        const assignmentRes = await fetch(
          `/api/assignments?where[course][in]=${encodeURIComponent(JSON.stringify(courseIds))}&limit=200&depth=1`,
          { headers: h }
        )
        if (!assignmentRes.ok) throw new Error(`Assignments: HTTP ${assignmentRes.status}`)
        const assignmentData = await assignmentRes.json()
        const ownAssignments = assignmentData.docs ?? []
        const assignmentIds = ownAssignments.map(assignment => assignment.id)

        setAssignments(ownAssignments)

        if (assignmentIds.length === 0) {
          setSubmissions([])
          setLoading(false)
          return
        }

        const submissionRes = await fetch(
          `/api/submissions?where[assignment][in]=${encodeURIComponent(JSON.stringify(assignmentIds))}&limit=500&depth=1`,
          { headers: h }
        )
        if (!submissionRes.ok) throw new Error(`Submissions: HTTP ${submissionRes.status}`)
        const submissionData = await submissionRes.json()
        setSubmissions(submissionData.docs ?? [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [instructor?.id])

  /* Derive all eligible students */
  const filteredCourses = filterCourse === 'all'
    ? courses
    : courses.filter(c => c.id === filterCourse)

  const allEligible = filteredCourses.flatMap(course =>
    computeEligibleStudents(course, assignments, submissions)
  )

  /* Issue handler */
  const handleIssue = useCallback((email, courseId, courseName) => {
    setIssued(prev => ({ ...prev, [`${email}::${courseId}`]: true }))
    setToast(`Certificate issued to ${email}`)
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="i-page">
        <div className="i-loading">
          <div className="i-spinner" />
          Loading certificates…
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="i-page">
        <div className="i-alert i-alert-error">
          Failed to load data: {error}
        </div>
      </div>
    )
  }

  /* ── Render ── */
  return (
    <div className="i-page">

      {/* Toast */}
      <Toast message={toast} onDismiss={dismissToast} />

      {/* Page header */}
      <div className="i-page-header">
        <div>
          <h1 className="i-page-title">Certificates</h1>
          <p className="i-page-subtitle">
            Students who have completed and passed all graded assignments
          </p>
        </div>
      </div>

      {/* Filter row */}
      <div className="i-card" style={{ marginBottom: '1.25rem' }}>
        <div className="i-card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label htmlFor="cert-filter" style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
            Filter by course
          </label>
          <select
            id="cert-filter"
            className="i-select"
            style={{ minWidth: 220, maxWidth: 360 }}
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title ?? c.id}</option>
            ))}
          </select>
          {allEligible.length > 0 && (
            <span className="i-badge i-badge-green" style={{ marginLeft: 'auto' }}>
              {allEligible.length} eligible student{allEligible.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {allEligible.length === 0 && (
        <div className="i-empty">
          <div className="i-empty-icon">
            <IconAward />
          </div>
          <h2 className="i-empty-title">No eligible students yet</h2>
          <p className="i-empty-text">
            Students need to complete and pass all assignments (grade &ge; 60) to become
            certificate-eligible.
          </p>
        </div>
      )}

      {/* Eligible students table */}
      {allEligible.length > 0 && (
        <div className="i-card">
          <div className="i-card-header">
            <h2 className="i-card-title">Eligible Students</h2>
          </div>
          <div className="i-card-body" style={{ padding: 0 }}>
            <div className="i-table-wrap">
              <table className="i-table">
                <thead>
                  <tr>
                    <th>Student Email</th>
                    <th>Course</th>
                    <th style={{ textAlign: 'center' }}>Assignments Passed</th>
                    <th style={{ textAlign: 'center' }}>Avg Grade</th>
                    <th style={{ textAlign: 'center' }}>Certificate Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allEligible.map(student => {
                    const key        = `${student.email}::${student.courseId}`
                    const wasIssued  = issued[key] ?? false
                    return (
                      <tr key={key} style={{ opacity: wasIssued ? 0.75 : 1 }}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          {student.email}
                        </td>
                        <td style={{ fontWeight: 500 }}>{student.course}</td>
                        <td style={{ textAlign: 'center' }}>
                          {student.assignmentsPassed}/{student.totalAssignments}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          {student.avgGrade != null ? `${student.avgGrade}%` : '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {wasIssued ? (
                            <span
                              className="i-badge"
                              style={{ background: '#1d4ed8', color: '#fff' }}
                            >
                              <IconAwardSm /> Issued
                            </span>
                          ) : (
                            <span className="i-badge i-badge-green">
                              <IconCheck /> Eligible
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="i-btn i-btn-primary i-btn-sm"
                            disabled={wasIssued}
                            onClick={() => handleIssue(student.email, student.courseId, student.course)}
                            style={{ opacity: wasIssued ? 0.5 : 1 }}
                          >
                            {wasIssued ? 'Issued' : 'Issue Certificate'}
                          </button>
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

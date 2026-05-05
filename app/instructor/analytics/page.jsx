'use client'

import { useState, useEffect } from 'react'
import { useInstructor } from '../context'

/* â”€â”€ Auth helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function authHeaders() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('instructor-token')
    : ''
  return { Authorization: `JWT ${token}` }
}

/* â”€â”€ Inline SVG icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  )
}
function IconInbox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}
function IconCheckCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
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

/* â”€â”€ Stat card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StatCard({ label, value, color, icon, loading }) {
  return (
    <div className={`i-stat i-stat-${color}`}>
      <div className="i-stat-icon">{icon}</div>
      <div className="i-stat-body">
        <div className="i-stat-value">
          {loading ? <span className="i-skeleton i-skeleton-num" /> : value}
        </div>
        <div className="i-stat-label">{label}</div>
      </div>
    </div>
  )
}

/* â”€â”€ Bar chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const BAR_MAX_H = 140

function BarChart({ bars }) {
  const maxVal = Math.max(...bars.map(b => b.value), 1)
  return (
    <div className="i-bar-chart">
      {bars.map(({ label, value, color }) => {
        const h = Math.round((value / maxVal) * BAR_MAX_H)
        return (
          <div key={label} className="i-bar-col">
            <div
              className="i-bar"
              style={{
                height:          `${h}px`,
                backgroundColor: color,
                minHeight:       value > 0 ? 4 : 0,
              }}
              title={`${label}: ${value}`}
              aria-label={`${label}: ${value}`}
            />
            <div className="i-bar-label">{label}</div>
            <div className="i-bar-value">{value}</div>
          </div>
        )
      })}
    </div>
  )
}

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function fmtDate(iso) {
  if (!iso) return 'â€”'
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return 'â€”'
  }
}

function truncate(str, n) {
  if (!str) return 'â€”'
  return str.length > n ? str.slice(0, n) + 'â€¦' : str
}

/* â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function AnalyticsPage() {
  const ctx        = useInstructor()
  const instructor = ctx?.instructor

  const [courses,       setCourses]       = useState([])
  const [assignments,   setAssignments]   = useState([])
  const [submissions,   setSubmissions]   = useState([])
  const [_announcements, setAnnouncements] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

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
          setAnnouncements([])
          setLoading(false)
          return
        }

        const [assignRes, announcementRes] = await Promise.all([
          fetch(
            `/api/assignments?where[course][in]=${encodeURIComponent(JSON.stringify(courseIds))}&limit=100&depth=1`,
            { headers: h }
          ),
          fetch(
            `/api/announcements?where[course][in]=${encodeURIComponent(JSON.stringify(courseIds))}&limit=100&depth=1`,
            { headers: h }
          ),
        ])

        if (!assignRes.ok) throw new Error(`Assignments: HTTP ${assignRes.status}`)
        if (!announcementRes.ok) throw new Error(`Announcements: HTTP ${announcementRes.status}`)

        const [assignData, announcementData] = await Promise.all([assignRes.json(), announcementRes.json()])
        const ownAssignments = assignData.docs ?? []
        const assignmentIds = ownAssignments.map(assignment => assignment.id)
        const ownAnnouncements = announcementData.docs ?? []

        setAssignments(ownAssignments)
        setAnnouncements(ownAnnouncements)

        if (assignmentIds.length === 0) {
          setSubmissions([])
          setLoading(false)
          return
        }

        const submissionRes = await fetch(
          `/api/submissions?where[assignment][in]=${encodeURIComponent(JSON.stringify(assignmentIds))}&limit=100&depth=1&sort=-createdAt`,
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

  /* â”€â”€ Derived counts â”€â”€ */
  const gradedCount = submissions.filter(s => s.status === 'graded').length

  const statusCounts = {
    submitted: submissions.filter(s => s.status === 'submitted').length,
    graded:    submissions.filter(s => s.status === 'graded').length,
    returned:  submissions.filter(s => s.status === 'returned').length,
  }

  const submissionBars = [
    { label: 'Submitted', value: statusCounts.submitted, color: '#3b82f6' },
    { label: 'Graded',    value: statusCounts.graded,    color: '#22c55e' },
    { label: 'Returned',  value: statusCounts.returned,  color: '#f97316' },
  ]

  /* Assignments per course (proxy for "submission count" since no direct courseId on submission) */
  function assignmentsForCourse(courseId) {
    return assignments.filter(a => {
      const c = a.course
      if (!c) return false
      return (typeof c === 'string' ? c : c.id) === courseId
    })
  }

  /* Recent graded submissions */
  const recentGraded = submissions
    .filter(s => s.status === 'graded')
    .slice(0, 10)

  /* Assignment completion bars (up to 6) */
  const assignmentBars = assignments.slice(0, 6).map(a => {
    const subs = submissions.filter(s => {
      const aRef = s.assignment
      if (!aRef) return false
      return (typeof aRef === 'string' ? aRef : aRef.id) === a.id
    })
    return {
      label: truncate(a.title ?? 'Assignment', 12),
      value: subs.length,
      color: '#8b5cf6',
    }
  })

  /* â”€â”€ Loading state â”€â”€ */
  if (loading) {
    return (
      <div className="i-page">
        <div className="i-loading">
          <div className="i-spinner" />
          Loading analyticsâ€¦
        </div>
      </div>
    )
  }

  /* â”€â”€ Error state â”€â”€ */
  if (error) {
    return (
      <div className="i-page">
        <div className="i-alert i-alert-error">
          Failed to load analytics data: {error}
        </div>
      </div>
    )
  }

  /* â”€â”€ Render â”€â”€ */
  return (
    <div className="i-page">

      {/* Page header */}
      <div className="i-page-header">
        <div>
          <h1 className="i-page-title">Analytics</h1>
          <p className="i-page-subtitle">Overview of your teaching activity and student progress</p>
        </div>
      </div>

      {/* â”€â”€ Stats row â”€â”€ */}
      <div className="i-stats-grid">
        <StatCard label="Total Courses"       value={courses.length}       color="blue"   icon={<IconBook />}       loading={false} />
        <StatCard label="Total Assignments"   value={assignments.length}   color="purple" icon={<IconClipboard />}  loading={false} />
        <StatCard label="Total Submissions"   value={submissions.length}   color="green"  icon={<IconInbox />}      loading={false} />
        <StatCard label="Graded Submissions"  value={gradedCount}          color="orange" icon={<IconCheckCircle />} loading={false} />
      </div>

      {/* â”€â”€ Two columns: status chart + courses table â”€â”€ */}
      <div className="i-two-col">

        {/* LEFT: Submissions by Status */}
        <div className="i-card">
          <div className="i-card-header">
            <h2 className="i-card-title">Submissions by Status</h2>
          </div>
          <div className="i-card-body">
            {submissions.length === 0 ? (
              <div className="i-empty-state">
                <IconEmpty />
                <p>No submissions yet.</p>
              </div>
            ) : (
              <BarChart bars={submissionBars} />
            )}
          </div>
        </div>

        {/* RIGHT: Courses Overview */}
        <div className="i-card">
          <div className="i-card-header">
            <h2 className="i-card-title">Courses Overview</h2>
          </div>
          <div className="i-card-body" style={{ padding: 0 }}>
            {courses.length === 0 ? (
              <div className="i-empty-state" style={{ padding: '2rem' }}>
                <IconEmpty />
                <p>No courses found.</p>
              </div>
            ) : (
              <div className="i-table-wrap">
                <table className="i-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Tag</th>
                      <th>Level</th>
                      <th>Price</th>
                      <th style={{ textAlign: 'right' }}>Assignments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => {
                      const aCount = assignmentsForCourse(course.id).length
                      return (
                        <tr key={course.id}>
                          <td style={{ fontWeight: 500 }}>{course.title ?? 'â€”'}</td>
                          <td>
                            {course.tag
                              ? <span className="i-badge i-badge-purple">{course.tag}</span>
                              : <span className="i-muted">â€”</span>
                            }
                          </td>
                          <td>{course.level ?? <span className="i-muted">â€”</span>}</td>
                          <td>
                            {course.price != null
                              ? `â‚¦${Number(course.price).toLocaleString()}`
                              : <span className="i-muted">â€”</span>
                            }
                          </td>
                          <td style={{ textAlign: 'right' }}>{aCount}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* â”€â”€ Recent Graded Submissions â”€â”€ */}
      <div className="i-card">
        <div className="i-card-header">
          <h2 className="i-card-title">Recent Graded Submissions</h2>
          <span className="i-badge i-badge-green">{recentGraded.length}</span>
        </div>
        <div className="i-card-body" style={{ padding: 0 }}>
          {recentGraded.length === 0 ? (
            <div className="i-empty-state" style={{ padding: '2rem' }}>
              <IconEmpty />
              <p>No graded submissions yet.</p>
            </div>
          ) : (
            <div className="i-table-wrap">
              <table className="i-table">
                <thead>
                  <tr>
                    <th>Student Email</th>
                    <th>Assignment</th>
                    <th style={{ textAlign: 'right' }}>Grade /100</th>
                    <th>Feedback</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGraded.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        {sub.studentEmail ?? sub.student?.email ?? 'â€”'}
                      </td>
                      <td>{sub.assignment?.title ?? 'â€”'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {sub.grade != null ? sub.grade : 'â€”'}
                      </td>
                      <td style={{ color: 'var(--i-muted)', fontSize: '0.82rem' }}>
                        {truncate(sub.feedback, 60)}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        {fmtDate(sub.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Assignment Completion bar chart â”€â”€ */}
      <div className="i-card">
        <div className="i-card-header">
          <h2 className="i-card-title">Assignment Completion</h2>
          <span className="i-page-subtitle" style={{ margin: 0 }}>Submission counts per assignment</span>
        </div>
        <div className="i-card-body">
          {assignments.length === 0 ? (
            <div className="i-empty-state">
              <IconEmpty />
              <p>No assignments found.</p>
            </div>
          ) : (
            <BarChart bars={assignmentBars} />
          )}
        </div>
      </div>

    </div>
  )
}

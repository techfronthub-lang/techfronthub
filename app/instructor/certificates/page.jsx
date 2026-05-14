'use client'

import { useEffect, useMemo, useState } from 'react'
import { useInstructor } from '../context'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('instructor-token') : ''
  return {
    Authorization: `JWT ${token}`,
    'Content-Type': 'application/json',
  }
}

function IconAward() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
}

function buildIssuedMap(docs) {
  return docs.reduce((acc, doc) => {
    const studentId = String(doc?.student?.id ?? doc?.student ?? '')
    const courseId = String(doc?.course?.id ?? doc?.course ?? '')
    if (!studentId || !courseId) return acc
    acc[`${studentId}::${courseId}`] = doc
    return acc
  }, {})
}

function formatIssuedDate(value) {
  if (!value) return 'Issued'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Issued'
  return `Issued ${date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export default function CertificatesPage() {
  const ctx = useInstructor()
  const instructor = ctx?.instructor
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [issuedMap, setIssuedMap] = useState({})
  const [filterCourse, setFilterCourse] = useState('all')
  const [issuingKey, setIssuingKey] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    if (!instructor?.id) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      try {
        const coursesRes = await fetch(`/api/courses?where[instructor][equals]=${instructor.id}&limit=200&depth=1`, {
          headers: authHeaders(),
        })
        const coursesData = await coursesRes.json()
        if (!coursesRes.ok) throw new Error(coursesData?.message || 'Failed to load courses.')

        const ownCourses = coursesData?.docs || []
        const courseIds = ownCourses.map((course) => course.id)

        const [enrollmentsRes, certificatesRes] = await Promise.all([
          courseIds.length
            ? fetch(`/api/enrollments?where[course][in]=${encodeURIComponent(JSON.stringify(courseIds))}&limit=500&depth=2`, {
                headers: authHeaders(),
              })
            : Promise.resolve(new Response(JSON.stringify({ docs: [] }), { status: 200 })),
          fetch('/api/instructor/certificates', { headers: authHeaders() }),
        ])

        const enrollmentsData = await enrollmentsRes.json().catch(() => ({ docs: [] }))
        const certificatesData = await certificatesRes.json().catch(() => ({ docs: [] }))

        if (!enrollmentsRes.ok) throw new Error(enrollmentsData?.message || 'Failed to load enrollments.')
        if (!certificatesRes.ok) throw new Error(certificatesData?.message || 'Failed to load certificates.')
        if (cancelled) return

        setCourses(ownCourses)
        setEnrollments((enrollmentsData?.docs || []).filter((doc) => doc?.status === 'paid'))
        setIssuedMap(buildIssuedMap(certificatesData?.docs || []))
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load certificates.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [instructor?.id])

  const filteredRows = useMemo(() => {
    return enrollments
      .filter((enrollment) => filterCourse === 'all' || String(enrollment?.course?.id ?? enrollment?.course) === filterCourse)
      .map((enrollment) => {
        const student = enrollment?.student || {}
        const course = enrollment?.course || {}
        const key = `${student?.id ?? student}::${course?.id ?? course}`
        return {
          key,
          studentId: String(student?.id ?? student ?? ''),
          studentName: student?.name || student?.email || 'Student',
          studentEmail: student?.email || 'No email',
          courseId: String(course?.id ?? course ?? ''),
          courseTitle: course?.title || 'Course',
          amount: enrollment?.amount,
          certificate: issuedMap[key] || null,
        }
      })
  }, [enrollments, filterCourse, issuedMap])

  async function handleIssue(row) {
    setIssuingKey(row.key)
    setError('')

    try {
      const res = await fetch('/api/instructor/certificates/issue', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          courseId: row.courseId,
          studentId: row.studentId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Certificate issuance failed.')
      }

      setIssuedMap((prev) => ({
        ...prev,
        [row.key]: data?.doc,
      }))
      setToast(data?.existing ? `Certificate already exists for ${row.studentEmail}.` : `Certificate issued to ${row.studentEmail}.`)
    } catch (err) {
      setError(err.message || 'Certificate issuance failed.')
    } finally {
      setIssuingKey('')
    }
  }

  if (loading) {
    return (
      <div className="i-page">
        <div className="i-loading">
          <div className="i-spinner" />
          Loading certificates...
        </div>
      </div>
    )
  }

  return (
    <div className="i-page">
      {toast ? (
        <div className="i-alert" style={{ background: '#16a34a', color: '#fff', marginBottom: '1rem' }}>
          {toast}
        </div>
      ) : null}

      <div className="i-page-header">
        <div>
          <h1 className="i-page-title">Certificates</h1>
          <p className="i-page-subtitle">Issue persisted completion certificates for learners enrolled in your paid courses.</p>
        </div>
      </div>

      {error ? (
        <div className="i-alert i-alert-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      ) : null}

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
            onChange={(event) => setFilterCourse(event.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title ?? course.id}</option>
            ))}
          </select>
          <span className="i-badge i-badge-green" style={{ marginLeft: 'auto' }}>
            {filteredRows.length} enrolled learner{filteredRows.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="i-empty">
          <div className="i-empty-icon">
            <IconAward />
          </div>
          <h2 className="i-empty-title">No enrolled learners yet</h2>
          <p className="i-empty-text">
            Paid enrollments for your courses will appear here. Certificate issuance is stored permanently once triggered.
          </p>
        </div>
      ) : (
        <div className="i-card">
          <div className="i-card-header">
            <h2 className="i-card-title">Learner Certificates</h2>
          </div>
          <div className="i-card-body" style={{ padding: 0 }}>
            <div className="i-table-wrap">
              <table className="i-table">
                <thead>
                  <tr>
                    <th>Learner</th>
                    <th>Course</th>
                    <th style={{ textAlign: 'center' }}>Enrollment</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const wasIssued = Boolean(row.certificate)
                    return (
                      <tr key={row.key}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{row.studentName}</div>
                          <div style={{ color: 'var(--i-muted)', fontSize: '0.82rem' }}>{row.studentEmail}</div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{row.courseTitle}</td>
                        <td style={{ textAlign: 'center' }}>
                          {row.amount ? `N${Number(row.amount).toLocaleString()}` : 'Paid'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {wasIssued ? (
                            <span className="i-badge" style={{ background: '#1d4ed8', color: '#fff' }}>
                              {formatIssuedDate(row.certificate?.issuedAt)}
                            </span>
                          ) : (
                            <span className="i-badge i-badge-green">Ready to issue</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="i-btn i-btn-primary i-btn-sm"
                            disabled={issuingKey === row.key}
                            onClick={() => handleIssue(row)}
                            style={{ opacity: issuingKey === row.key ? 0.65 : 1 }}
                          >
                            {wasIssued ? 'Recheck Certificate' : issuingKey === row.key ? 'Issuing...' : 'Issue Certificate'}
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

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useInstructor } from '../context'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('instructor-token') : ''
  return { Authorization: `JWT ${token}` }
}

function formatAmount(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  return `N${n.toLocaleString()}`
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('en-NG')
}

function toCsvValue(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export default function InstructorEnrollmentsPage() {
  const ctx = useInstructor()
  const instructor = ctx?.instructor
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      if (!instructor?.id) return
      try {
        setLoading(true)
        setError('')

        const coursesRes = await fetch(`/api/courses?where[instructor][equals]=${instructor.id}&limit=200`, { headers: authHeaders() })
        const coursesData = await coursesRes.json()
        const ownCourses = coursesData?.docs || []
        const courseIds = ownCourses.map(course => course.id)

        if (!mounted) return
        setCourses(ownCourses)

        if (courseIds.length === 0) {
          setEnrollments([])
          setLoading(false)
          return
        }

        const enrollRes = await fetch(
          `/api/enrollments?where[course][in]=${encodeURIComponent(JSON.stringify(courseIds))}&limit=500`,
          { headers: authHeaders() }
        )
        const enrollData = await enrollRes.json()

        if (!mounted) return
        setEnrollments(enrollData?.docs || [])
        setLoading(false)
      } catch {
        if (!mounted) return
        setError('Failed to load enrollments.')
        setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [instructor?.id])

  const rows = useMemo(() => {
    const courseMap = new Map(courses.map(c => [String(c.id), c]))
    return (enrollments || [])
      .filter(e => {
        const cid = String(e?.course?.id ?? e?.course ?? '')
        return courseMap.has(cid)
      })
      .map(e => {
        const cid = String(e?.course?.id ?? e?.course ?? '')
        const sid = e?.student
        const studentEmail = typeof sid === 'object' ? sid?.email : 'Student'
        const course = courseMap.get(cid)
        return {
          id: e.id,
          studentEmail: studentEmail || 'Student',
          courseTitle: course?.title || 'Untitled Course',
          amount: formatAmount(e?.amount),
          status: e?.status || '-',
          reference: e?.reference || '-',
          createdAtRaw: e?.createdAt || '',
          createdAt: formatDate(e?.createdAt),
        }
      })
      .sort((a, b) => (a.createdAtRaw < b.createdAtRaw ? 1 : -1))
  }, [courses, enrollments])

  function downloadCsv() {
    if (!rows.length) return

    const headers = ['Student', 'Course', 'Amount', 'Status', 'Reference', 'Date']
    const lines = [
      headers.join(','),
      ...rows.map(r => [
        toCsvValue(r.studentEmail),
        toCsvValue(r.courseTitle),
        toCsvValue(r.amount),
        toCsvValue(r.status),
        toCsvValue(r.reference),
        toCsvValue(r.createdAt),
      ].join(',')),
    ]

    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `enrollments-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="i-page">
      <div className="i-page-header">
        <div className="i-page-header-left">
          <h1>Enrollments</h1>
          <p>Audit paid student enrollments for your courses.</p>
        </div>
      </div>

      {error && <div className="i-alert i-alert-error">{error}</div>}

      <div className="i-card">
        <div className="i-card-header">
          <h2 className="i-card-title">Payment Records</h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="button" className="i-btn i-btn-secondary i-btn-sm" onClick={downloadCsv} disabled={!rows.length}>
              Download CSV
            </button>
            <Link href="/instructor/courses" className="i-link-sm">View Courses</Link>
          </div>
        </div>
        <div className="i-card-body">
          {loading ? (
            <div className="i-loading-inline"><div className="i-spinner i-spinner-sm" /></div>
          ) : rows.length === 0 ? (
            <div className="i-empty-state">
              <p>No enrollments yet.</p>
            </div>
          ) : (
            <div className="i-table-wrap">
              <table className="i-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <td>{r.studentEmail}</td>
                      <td>{r.courseTitle}</td>
                      <td>{r.amount}</td>
                      <td>
                        <span className={`i-badge ${r.status === 'paid' ? 'i-badge-green' : 'i-badge-gray'}`}>{r.status}</span>
                      </td>
                      <td>{r.reference}</td>
                      <td>{r.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

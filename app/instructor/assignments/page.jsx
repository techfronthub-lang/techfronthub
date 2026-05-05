'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useInstructor } from '../context'

/* â”€â”€ Auth helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function authHeaders() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('instructor-token')
    : ''
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

/* â”€â”€ Date helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function formatDate(str) {
  if (!str) return 'No due date'
  try {
    return new Date(str).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch {
    return 'No due date'
  }
}

/* â”€â”€ Inline SVG icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  )
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

/* â”€â”€ Submission count cell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* â”€â”€ Inline create form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CreateForm({ courses, onCreated, onCancel }) {
  const [form, setForm] = useState({
    course: '',
    title: '',
    description: '',
    dueDate: '',
    maxPoints: '100',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState(null)

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErr(null)

    if (!form.course) { setErr('Please select a course.'); return }
    if (!form.title.trim()) { setErr('Title is required.'); return }

    setSaving(true)
    try {
      const body = {
        course: form.course,
        title: form.title.trim(),
        ...(form.description.trim() && { description: form.description.trim() }),
        ...(form.dueDate && { dueDate: form.dueDate }),
        maxPoints: Number(form.maxPoints) || 100,
      }
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.errors?.[0]?.message ?? `HTTP ${res.status}`)
      }
      const created = await res.json()
      onCreated(created?.doc ?? created)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="i-card i-card-pad"
      style={{
        marginBottom: 24,
        background: '#f8fafc',
        border: '1.5px solid #dbeafe',
        animation: 'i-slide-in 0.18s ease',
      }}
    >
      <style>{`
        @keyframes i-slide-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes i-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--i-text)' }}>New Assignment</h3>
        <button onClick={onCancel} className="i-btn i-btn-ghost i-btn-sm i-btn-icon" type="button" title="Cancel">
          <IconX />
        </button>
      </div>

      {err && (
        <div className="i-alert i-alert-error" style={{ marginBottom: 16 }}>
          <IconAlert /> {err}
        </div>
      )}

      <form onSubmit={handleSubmit} className="i-form">
        <div className="i-form-grid">
          {/* Course */}
          <div className="i-field">
            <label className="i-label">Course <span className="req">*</span></label>
            <select
              className="i-select"
              value={form.course}
              onChange={e => set('course', e.target.value)}
              required
            >
              <option value="">Select a courseâ€¦</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="i-field">
            <label className="i-label">Title <span className="req">*</span></label>
            <input
              className="i-input"
              type="text"
              placeholder="e.g. Week 3 Project"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          {/* Due Date */}
          <div className="i-field">
            <label className="i-label">Due Date</label>
            <input
              className="i-input"
              type="date"
              value={form.dueDate}
              onChange={e => set('dueDate', e.target.value)}
            />
          </div>

          {/* Max Points */}
          <div className="i-field">
            <label className="i-label">Max Points</label>
            <input
              className="i-input"
              type="number"
              min="0"
              step="1"
              value={form.maxPoints}
              onChange={e => set('maxPoints', e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="i-field i-field-full">
            <label className="i-label">Description</label>
            <textarea
              className="i-textarea"
              rows={3}
              placeholder="Describe the assignment requirementsâ€¦"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} className="i-btn i-btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="i-btn i-btn-primary" disabled={saving}>
            {saving
              ? <><span className="i-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Savingâ€¦</>
              : <><IconPlus /> Create Assignment</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}

/* â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function AssignmentsPage() {
  const ctx        = useInstructor()
  const instructor = ctx?.instructor

  const [assignments,     setAssignments]     = useState([])
  const [courses,         setCourses]         = useState([])
  const [submissions,     setSubmissions]     = useState([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)
  const [showForm,        setShowForm]        = useState(false)
  const [selectedCourse,  setSelectedCourse]  = useState('')
  const [deleting,        setDeleting]        = useState(null)

  /* â”€â”€ Load data â”€â”€ */
  const load = useCallback(() => {
    if (!instructor?.id) return
    setLoading(true)
    setError(null)

    Promise.all([
      fetch(
        `/api/courses?where[instructor][equals]=${instructor.id}&limit=100`,
        { headers: authHeaders() }
      ).then(r => r.ok ? r.json() : Promise.reject(new Error(`Courses: HTTP ${r.status}`))),

      fetch(
        `/api/assignments?limit=100&sort=-createdAt&populate=course`,
        { headers: authHeaders() }
      ).then(r => r.ok ? r.json() : Promise.reject(new Error(`Assignments: HTTP ${r.status}`))),
    ])
      .then(([courseData, assignData]) => {
        const ownCourses = courseData.docs ?? []
        const ownAssignments = assignData.docs ?? []
        const assignmentIds = ownAssignments.map(assignment => assignment.id)

        setCourses(ownCourses)
        setAssignments(ownAssignments)

        if (assignmentIds.length === 0) {
          setSubmissions([])
          setLoading(false)
          return
        }

        fetch(
          `/api/submissions?where[assignment][in]=${encodeURIComponent(JSON.stringify(assignmentIds))}&limit=1000&sort=-createdAt`,
          { headers: authHeaders() }
        )
          .then(r => r.ok ? r.json() : Promise.reject(new Error(`Submissions: HTTP ${r.status}`)))
          .then(subData => {
            setSubmissions(subData.docs ?? [])
            setLoading(false)
          })
          .catch(err => { throw err })
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [instructor?.id])

  useEffect(() => { load() }, [load])

  /* â”€â”€ Delete â”€â”€ */
  async function handleDelete(assignment) {
    if (!window.confirm(`Delete "${assignment.title}"? This cannot be undone.`)) return
    setDeleting(assignment.id)
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setAssignments(prev => prev.filter(a => a.id !== assignment.id))
    } catch (e) {
      alert(`Failed to delete: ${e.message}`)
    } finally {
      setDeleting(null)
    }
  }

  /* â”€â”€ Filter â”€â”€ */
  const visible = selectedCourse
    ? assignments.filter(a => {
        const cid = a.course?.id ?? a.course
        return cid === selectedCourse
      })
    : assignments

  /* â”€â”€ Helpers â”€â”€ */
  function courseTitle(assignment) {
    if (assignment.course && typeof assignment.course === 'object') return assignment.course.title ?? '—'
    const found = courses.find(c => c.id === assignment.course)
    return found?.title ?? '—'
  }

  const submissionCounts = submissions.reduce((acc, submission) => {
    const assignmentId = typeof submission.assignment === 'string'
      ? submission.assignment
      : submission.assignment?.id
    if (!assignmentId) return acc
    acc[assignmentId] = (acc[assignmentId] || 0) + 1
    return acc
  }, {})

  /* â”€â”€ Render â”€â”€ */
  return (
    <div className="i-content">

      {/* Page header */}
      <div className="i-page-header">
        <div className="i-page-header-left">
          <h1>Assignments</h1>
          <p>
            {loading
              ? 'Loadingâ€¦'
              : `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} across all courses`}
          </p>
        </div>
        <div className="i-page-header-right">
          <button
            className={`i-btn ${showForm ? 'i-btn-secondary' : 'i-btn-primary'}`}
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? <><IconX /> Cancel</> : <><IconPlus /> New Assignment</>}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="i-alert i-alert-error" style={{ marginBottom: 20 }}>
          <IconAlert /> {error}
        </div>
      )}

      {/* Inline create form */}
      {showForm && (
        <CreateForm
          courses={courses}
          onCreated={doc => {
            setAssignments(prev => [doc, ...prev])
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filter row */}
      {!loading && assignments.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              className="i-select"
              style={{ paddingRight: 36, minWidth: 200, fontWeight: 500 }}
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: 11, pointerEvents: 'none', color: 'var(--i-muted)' }}>
              <IconChevronDown />
            </span>
          </div>
          {selectedCourse && (
            <span className="i-badge i-badge-blue">
              {visible.length} shown
            </span>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="i-card" style={{ overflow: 'hidden' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{ padding: '16px 24px', borderBottom: '1px solid var(--i-border)', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 2 }}>
                <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, width: '55%', marginBottom: 7, animation: 'i-pulse 1.4s ease-in-out infinite' }} />
                <div style={{ height: 11, background: '#e2e8f0', borderRadius: 4, width: '35%', animation: 'i-pulse 1.4s ease-in-out infinite' }} />
              </div>
              <div style={{ flex: 1, height: 13, background: '#e2e8f0', borderRadius: 4, animation: 'i-pulse 1.4s ease-in-out infinite' }} />
              <div style={{ flex: 1, height: 13, background: '#e2e8f0', borderRadius: 4, animation: 'i-pulse 1.4s ease-in-out infinite' }} />
              <div style={{ width: 60, height: 13, background: '#e2e8f0', borderRadius: 4, animation: 'i-pulse 1.4s ease-in-out infinite' }} />
              <div style={{ width: 150, height: 13, background: '#e2e8f0', borderRadius: 4, animation: 'i-pulse 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && !error && visible.length > 0 && (
        <div className="i-card" style={{ overflow: 'hidden' }}>
          <div className="i-table-wrap">
            <table className="i-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Course</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>Max Points</th>
                  <th style={{ textAlign: 'right' }}>Submissions</th>
                  <th className="td-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(a => (
                  <tr
                    key={a.id}
                    style={{
                      opacity: deleting === a.id ? 0.4 : 1,
                      pointerEvents: deleting === a.id ? 'none' : 'auto',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {/* Assignment title + course sub-label */}
                    <td style={{ minWidth: 220 }}>
                      <div style={{ fontWeight: 600, color: 'var(--i-text)', marginBottom: 3 }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--i-muted)' }}>
                        {courseTitle(a)}
                      </div>
                    </td>

                    {/* Course */}
                    <td>
                      <span className="i-badge i-badge-blue">
                        {courseTitle(a)}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td style={{ color: a.dueDate ? 'var(--i-text-2)' : 'var(--i-muted-2)', fontStyle: a.dueDate ? 'normal' : 'italic' }}>
                      {formatDate(a.dueDate)}
                    </td>

                    {/* Max Points */}
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {a.maxPoints ?? 100}
                    </td>

                    {/* Submissions */}
                    <td style={{ textAlign: 'right' }}>
                      {loading
                        ? <span style={{ display: 'inline-block', width: 28, height: 14, borderRadius: 4, background: '#e2e8f0', animation: 'i-pulse 1.4s ease-in-out infinite' }} />
                        : (submissionCounts[a.id] ?? 0)
                      }
                    </td>

                    {/* Actions */}
                    <td className="td-actions">
                      <div className="td-actions-wrap">
                        <Link
                          href={`/instructor/assignments/${a.id}/submissions`}
                          className="i-btn i-btn-secondary i-btn-sm"
                          title="View submissions"
                        >
                          <IconEye /> Submissions
                        </Link>
                        <button
                          onClick={() => handleDelete(a)}
                          className="i-btn i-btn-danger i-btn-sm i-btn-icon"
                          title="Delete assignment"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && visible.length === 0 && (
        <div className="i-card">
          <div className="i-empty">
            <div className="i-empty-icon">
              <IconClipboard />
            </div>
            <h3>
              {selectedCourse ? 'No assignments for this course' : 'No assignments yet'}
            </h3>
            <p>
              {selectedCourse
                ? 'Try selecting a different course, or create a new assignment.'
                : 'Create your first assignment to track student work and submissions.'}
            </p>
            <button
              className="i-btn i-btn-primary"
              onClick={() => { setSelectedCourse(''); setShowForm(true) }}
            >
              <IconPlus /> New Assignment
            </button>
          </div>
        </div>
      )}

    </div>
  )
}



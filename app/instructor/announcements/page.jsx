'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstructor } from '../context'

/* ── Auth helper ──────────────────────────────────────────────────────────── */
function authHeaders() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('instructor-token')
    : ''
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

/* ── Date helper ──────────────────────────────────────────────────────────── */
function formatDate(str) {
  if (!str) return ''
  try {
    return new Date(str).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch {
    return ''
  }
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
function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconBellSm() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

/* ── Inline create form ───────────────────────────────────────────────────── */
function CreateForm({ courses, onCreated, onCancel }) {
  const [form, setForm] = useState({ course: '', title: '', body: '' })
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
    if (!form.body.trim()) { setErr('Body is required.'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          course: form.course,
          title: form.title.trim(),
          body: form.body.trim(),
        }),
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
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--i-text)' }}>Post Announcement</h3>
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
              <option value="">Select a course…</option>
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
              placeholder="e.g. Important update for this week"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          {/* Body */}
          <div className="i-field i-field-full">
            <label className="i-label">Body <span className="req">*</span></label>
            <textarea
              className="i-textarea"
              rows={4}
              placeholder="Write your announcement here…"
              value={form.body}
              onChange={e => set('body', e.target.value)}
              required
              style={{ minHeight: 100 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} className="i-btn i-btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="i-btn i-btn-primary" disabled={saving}>
            {saving
              ? <><span className="i-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Posting…</>
              : <><IconBellSm /> Post Announcement</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Announcement card ────────────────────────────────────────────────────── */
function AnnouncementCard({ announcement, courses, onDelete, isDeleting }) {
  function getCourseTitle() {
    if (announcement.course && typeof announcement.course === 'object') {
      return announcement.course.title ?? '—'
    }
    const found = courses.find(c => c.id === announcement.course)
    return found?.title ?? '—'
  }

  return (
    <div
      className="i-card i-card-pad"
      style={{
        marginBottom: 16,
        opacity: isDeleting ? 0.4 : 1,
        pointerEvents: isDeleting ? 'none' : 'auto',
        transition: 'opacity 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Top row: badge + timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 12, flexWrap: 'wrap' }}>
        <span className="i-badge i-badge-blue">
          {getCourseTitle()}
        </span>
        <span style={{ fontSize: 12, color: 'var(--i-muted)', flexShrink: 0 }}>
          {formatDate(announcement.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--i-text)', lineHeight: 1.3 }}>
        {announcement.title}
      </h3>

      {/* Body (clamped to 3 lines) */}
      <p style={{
        margin: '0 0 14px',
        fontSize: 13.5,
        color: 'var(--i-muted)',
        lineHeight: 1.6,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {announcement.body}
      </p>

      {/* Bottom row: label + delete */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12,
        borderTop: '1px solid var(--i-border)',
        gap: 12,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--i-muted)', fontWeight: 500 }}>
          <IconUsers />
          Sent to all enrolled students
        </span>
        <button
          onClick={() => onDelete(announcement)}
          className="i-btn i-btn-danger i-btn-sm"
          title="Delete announcement"
        >
          <IconTrash /> Delete
        </button>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function AnnouncementsPage() {
  const ctx        = useInstructor()
  const instructor = ctx?.instructor

  const [announcements, setAnnouncements] = useState([])
  const [courses,       setCourses]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [showForm,      setShowForm]      = useState(false)
  const [deleting,      setDeleting]      = useState(null)

  /* ── Load data ── */
  const load = useCallback(() => {
    if (!instructor?.id) return
    setLoading(true)
    setError(null)

    fetch(
      `/api/courses?where[instructor][equals]=${instructor.id}&limit=100`,
      { headers: authHeaders() }
    )
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`Courses: HTTP ${r.status}`)))
      .then(async courseData => {
        const ownCourses = courseData.docs ?? []
        const ownCourseIds = ownCourses.map(c => c.id)

        setCourses(ownCourses)

        if (ownCourseIds.length === 0) {
          setAnnouncements([])
          setLoading(false)
          return
        }

        const announcementRes = await fetch(
          `/api/announcements?where[course][in]=${encodeURIComponent(JSON.stringify(ownCourseIds))}&limit=100&sort=-createdAt&depth=1`,
          { headers: authHeaders() }
        )
        if (!announcementRes.ok) {
          throw new Error(`Announcements: HTTP ${announcementRes.status}`)
        }
        const announcementData = await announcementRes.json()
        setAnnouncements(announcementData.docs ?? [])
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [instructor?.id])

  useEffect(() => { load() }, [load])

  /* ── Delete ── */
  async function handleDelete(announcement) {
    if (!window.confirm(`Delete "${announcement.title}"? This cannot be undone.`)) return
    setDeleting(announcement.id)
    try {
      const res = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id))
    } catch (e) {
      alert(`Failed to delete: ${e.message}`)
    } finally {
      setDeleting(null)
    }
  }

  /* ── Render ── */
  return (
    <div className="i-content">

      {/* Page header */}
      <div className="i-page-header">
        <div className="i-page-header-left">
          <h1>Announcements</h1>
          <p>
            {loading
              ? 'Loading…'
              : `${announcements.length} announcement${announcements.length !== 1 ? 's' : ''} posted`}
          </p>
        </div>
        <div className="i-page-header-right">
          <button
            className={`i-btn ${showForm ? 'i-btn-secondary' : 'i-btn-primary'}`}
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? <><IconX /> Cancel</> : <><IconPlus /> Post Announcement</>}
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
            setAnnouncements(prev => [doc, ...prev])
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(n => (
            <div key={n} className="i-card i-card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 100, height: 20, background: '#dbeafe', borderRadius: 99, animation: 'i-pulse 1.4s ease-in-out infinite' }} />
                <div style={{ width: 80, height: 13, background: '#e2e8f0', borderRadius: 4, animation: 'i-pulse 1.4s ease-in-out infinite' }} />
              </div>
              <div style={{ height: 18, background: '#e2e8f0', borderRadius: 4, width: '60%', marginBottom: 10, animation: 'i-pulse 1.4s ease-in-out infinite' }} />
              <div style={{ height: 13, background: '#e2e8f0', borderRadius: 4, width: '90%', marginBottom: 6, animation: 'i-pulse 1.4s ease-in-out infinite' }} />
              <div style={{ height: 13, background: '#e2e8f0', borderRadius: 4, width: '75%', animation: 'i-pulse 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      )}

      {/* Announcements list */}
      {!loading && !error && announcements.length > 0 && (
        <div>
          {announcements.map(a => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              courses={courses}
              onDelete={handleDelete}
              isDeleting={deleting === a.id}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && announcements.length === 0 && (
        <div className="i-card">
          <div className="i-empty">
            <div className="i-empty-icon">
              <IconBell />
            </div>
            <h3>No announcements yet</h3>
            <p>
              Post an announcement to notify all students enrolled in one of your courses instantly.
            </p>
            <button
              className="i-btn i-btn-primary"
              onClick={() => setShowForm(true)}
            >
              <IconPlus /> Post First Announcement
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useInstructor } from '../../context'
import { createDoc } from '@/src/lib/payload-api'

/* ── Auth helper ──────────────────────────────────────────────────────────── */
function authHeaders() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('instructor-token')
    : ''
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

function toKobo(value) {
  const cleaned = String(value ?? '').replace(/[^0-9.]/g, '')
  if (!cleaned) return undefined
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return undefined
  return Math.round(n * 100)
}

/* ── Options ──────────────────────────────────────────────────────────────── */
const TAG_OPTIONS   = ['', 'BOOTCAMP', 'NEW', 'POPULAR', 'ADVANCED', 'LIVE']
const LEVEL_OPTIONS = ['', 'Beginner', 'Intermediate', 'Advanced', 'All levels']

/* ── Inline SVG icons ─────────────────────────────────────────────────────── */
const IconPlus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
const IconMinus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><line x1="5" y1="12" x2="19" y2="12" /></svg>
const IconChevronLeft = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="15 18 9 12 15 6" /></svg>
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><polyline points="20 6 9 17 4 12" /></svg>
const IconExternalLink = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
const IconUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
const IconTrash = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
const IconBookOpen = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z" /></svg>

/* ── Builders ─────────────────────────────────────────────────────────────── */
function WhatYouLearnBuilder({ items, onChange }) {
  const update = (idx, val) => onChange(items.map((item, i) => i === idx ? { benefit: val } : item))
  const add    = () => onChange([...items, { benefit: '' }])
  const remove = (idx) => items.length > 1 && onChange(items.filter((_, i) => i !== idx))
  return (
    <div className="i-array-builder">
      {items.map((item, i) => (
        <div key={i} className="i-array-row">
          <input type="text" className="i-input i-input-grow" placeholder={`Benefit ${i + 1}`} value={item.benefit} onChange={e => update(i, e.target.value)} />
          <button type="button" onClick={() => remove(i)} className="i-btn i-btn-ghost i-btn-icon" disabled={items.length === 1}><IconMinus /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="i-btn i-btn-ghost i-btn-sm"><IconPlus /> Add Benefit</button>
    </div>
  )
}

function WhoThisIsForBuilder({ items, onChange }) {
  const update = (idx, val) => onChange(items.map((item, i) => i === idx ? { audience: val } : item))
  const add    = () => onChange([...items, { audience: '' }])
  const remove = (idx) => items.length > 1 && onChange(items.filter((_, i) => i !== idx))
  return (
    <div className="i-array-builder">
      {items.map((item, i) => (
        <div key={i} className="i-array-row">
          <input type="text" className="i-input i-input-grow" placeholder={`Audience ${i + 1}`} value={item.audience} onChange={e => update(i, e.target.value)} />
          <button type="button" onClick={() => remove(i)} className="i-btn i-btn-ghost i-btn-icon" disabled={items.length === 1}><IconMinus /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="i-btn i-btn-ghost i-btn-sm"><IconPlus /> Add Audience</button>
    </div>
  )
}

function CurriculumBuilder({ items, onChange }) {
  const update = (idx, field, val) => onChange(items.map((item, i) => i === idx ? { ...item, [field]: val } : item))
  const add    = () => onChange([...items, { week: '', title: '', description: '' }])
  const remove = (idx) => items.length > 1 && onChange(items.filter((_, i) => i !== idx))
  return (
    <div className="i-array-builder">
      {items.map((m, i) => (
        <div key={i} className="i-array-item-group">
          <div className="i-form-grid">
            <div className="i-field">
              <label className="i-label">Timeframe (e.g. Week 1)</label>
              <input type="text" className="i-input" placeholder="Week 1" value={m.week} onChange={e => update(i, 'week', e.target.value)} />
            </div>
            <div className="i-field">
              <label className="i-label">Module Title</label>
              <input type="text" className="i-input" placeholder="Introduction to..." value={m.title} onChange={e => update(i, 'title', e.target.value)} />
            </div>
          </div>
          <div className="i-field" style={{ marginTop: 12 }}>
            <label className="i-label">Module Description</label>
            <textarea className="i-textarea" rows={2} placeholder="What will students learn in this module?" value={m.description} onChange={e => update(i, 'description', e.target.value)} />
          </div>
          {items.length > 1 && (
            <button type="button" className="i-btn i-btn-danger i-btn-sm" style={{ marginTop: 12 }} onClick={() => remove(i)}>Remove Module</button>
          )}
        </div>
      ))}
      <button type="button" className="i-btn i-btn-secondary" onClick={add}>+ Add New Module</button>
    </div>
  )
}

/* ── UI Components ────────────────────────────────────────────────────────── */
function FormSection({ title, desc, children }) {
  return (
    <div className="i-form-section">
      <div className="i-form-section-header">
        <h2 className="i-form-section-title">{title}</h2>
        {desc && <p className="i-form-section-desc">{desc}</p>}
      </div>
      <div className="i-form-section-body">{children}</div>
    </div>
  )
}

function CoursePanel({ courseId, title, onDelete, deleting }) {
  return (
    <div className="i-course-panel">
      <h3 className="i-course-panel-title">Course Actions</h3>
      <div className="i-course-panel-links">
        <Link href={`/courses/${courseId}`} target="_blank" className="i-panel-link"><IconExternalLink /> View public page</Link>
        <Link href={`/instructor/courses/${courseId}/lessons`} className="i-panel-link"><IconBookOpen /> Lesson Builder</Link>
        <Link href={`/instructor/courses/${courseId}/students`} className="i-panel-link"><IconUsers /> Manage Students</Link>
      </div>
      <div className="i-course-panel-danger">
        <button type="button" className="i-btn i-btn-danger i-btn-block" onClick={onDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : <><IconTrash /> Delete Course</>}
        </button>
        <p className="i-hint-block i-hint-danger">This action cannot be undone.</p>
      </div>
    </div>
  )
}

function courseToForm(data) {
  return {
    title:           data.title           ?? '',
    code:            data.code            ?? '',
    category:        data.category?.id    ?? data.category ?? '',
    thumbnail:       data.thumbnail       ?? '',
    desc:            data.desc            ?? '',
    tag:             data.tag             ?? '',
    tagHot:          data.tagHot          ?? false,
    level:           data.level           ?? '',
    duration:        data.duration        ?? '',
    lessons:         data.lessons         != null ? String(data.lessons) : '',
    price:           data.price           != null ? String(data.price)   : '',
    old:             data.old             ?? '',
    hue:             data.hue             != null ? Number(data.hue)     : 214,
    format:          data.format          ?? '',
    certificate:     data.certificate     ?? '',
    guarantee:       data.guarantee       ?? '',
    support:         data.support         ?? '',
    whatYouLearn:    data.whatYouLearn?.length    ? data.whatYouLearn    : [{ benefit: '' }],
    whoThisIsFor:    data.whoThisIsFor?.length    ? data.whoThisIsFor    : [{ audience: '' }],
    programOverview: data.programOverview?.length ? data.programOverview : [{ week: '', title: '', description: '' }],
  }
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function EditCoursePage() {
  const { id }     = useParams()
  const ctx        = useInstructor()
  const instructor = ctx?.instructor
  const router     = useRouter()

  const [form, setForm]           = useState(null)
  const [categories, setCategories] = useState([])
  const [courseTitle, setCourseTitle] = useState('')
  const [loading, setLoading]     = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)

  const loadCourse = useCallback(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch('/api/categories?limit=100', { headers: authHeaders() })
        .then(r => r.ok ? r.json() : { docs: [] })
        .catch(() => ({ docs: [] })),
      fetch(`/api/courses/${id}`, { headers: authHeaders() })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))),
    ])
      .then(([categoriesData, courseData]) => {
        const doc = courseData?.doc ?? courseData
        setCategories(categoriesData?.docs ?? [])
        setForm(courseToForm(doc))
        setCourseTitle(doc?.title ?? 'Course')
        setLoading(false)
      })
      .catch(err => {
        setFetchError(err.message)
        setLoading(false)
      })
  }, [id])

  useEffect(() => { loadCourse() }, [loadCourse])

  function set(field, val) { setForm(p => ({ ...p, [field]: val })); setSaveSuccess(false) }

  async function uploadThumbnail(file) {
    setUploadingThumbnail(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'courses')
      const res = await fetch('/api/storage/upload', { method: 'POST', body: formData })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Upload failed')
      set('thumbnail', json.url || '')
      await createDoc('media-assets', {
        name: file.name,
        url: json.url || '',
        key: json.key || '',
        bucket: json.bucket || '',
        folder: 'thumbnail',
        mimeType: file.type,
        size: file.size,
      }).catch(() => {})
    } finally {
      setUploadingThumbnail(false)
    }
  }

  function buildPayload() {
    return {
      ...form,
      instructor:      instructor?.id,
      category:        form.category ? Number(form.category) : undefined,
      lessons:         form.lessons !== '' ? Number(form.lessons) : undefined,
      priceKobo:       toKobo(form.price),
      whatYouLearn:    form.whatYouLearn.filter(i => i.benefit.trim()),
      whoThisIsFor:    form.whoThisIsFor.filter(i => i.audience.trim()),
      programOverview: form.programOverview.filter(i => i.week.trim() || i.title.trim()),
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(buildPayload()) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.errors?.[0]?.message ?? 'Save failed')
      setCourseTitle(data.doc?.title ?? form.title)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) { setSaveError(err.message) }
    setSubmitting(false)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${courseTitle}"?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE', headers: authHeaders() })
      router.push('/instructor/courses')
    } catch (err) { alert(err.message); setDeleting(false) }
  }

  if (loading) return <div className="i-page"><div className="i-loading"><div className="i-spinner" /> Loading...</div></div>
  if (fetchError) return <div className="i-page"><div className="i-alert i-alert-error">Error: {fetchError}</div></div>

  return (
    <div className="i-page">
      <nav className="i-breadcrumb">
        <Link href="/instructor/courses"><IconChevronLeft /> My Courses</Link>
        <span className="i-sep">/</span>
        <span className="current">{courseTitle}</span>
      </nav>

      <div className="i-page-header">
        <div className="i-page-header-left">
          <h1>{courseTitle}</h1>
          <p>Update course details and curriculum below.</p>
        </div>
      </div>

      {saveSuccess && <div className="i-alert i-alert-success"><IconCheck /> Saved successfully</div>}
      {saveError && <div className="i-alert i-alert-error">{saveError}</div>}

      <div className="i-edit-layout">
        <form onSubmit={handleSubmit} className="i-edit-form">
          <FormSection title="Basic Info" desc="Update core identity.">
            <div className="i-form-grid">
              <div className="i-field i-field-required">
                <label className="i-label">Title</label>
                <input type="text" className="i-input" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div className="i-field i-field-required">
                <label className="i-label">Category</label>
                <select className="i-select" value={form.category} onChange={e => set('category', e.target.value)} required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>
            <div className="i-form-grid-3">
            <div className="i-field"><label className="i-label">Code</label><input type="text" className="i-input" value={form.code} onChange={e => set('code', e.target.value)} /></div>
            <div className="i-field"><label className="i-label">Status</label><select className="i-select" value={form.tag} onChange={e => set('tag', e.target.value)}>{TAG_OPTIONS.map(t => <option key={t} value={t}>{t || 'None'}</option>)}</select></div>
            <div className="i-field"><label className="i-label">Level</label><select className="i-select" value={form.level} onChange={e => set('level', e.target.value)}>{LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l || 'None'}</option>)}</select></div>
          </div>
          <div className="i-field"><label className="i-label">Description</label><textarea className="i-textarea" rows={4} value={form.desc} onChange={e => set('desc', e.target.value)} /></div>
          <label className="i-checkbox-row"><input type="checkbox" checked={form.tagHot} onChange={e => set('tagHot', e.target.checked)} /> Mark as Hot</label>
          </FormSection>

          <FormSection title="Details" desc="Configure pricing and branding.">
            <div className="i-form-grid-3">
            <div className="i-field"><label className="i-label">Duration</label><input type="text" className="i-input" value={form.duration} onChange={e => set('duration', e.target.value)} /></div>
            <div className="i-field"><label className="i-label">Lessons</label><input type="number" className="i-input" value={form.lessons} onChange={e => set('lessons', e.target.value)} /></div>
            <div className="i-field"><label className="i-label">Price (₦)</label><input type="text" className="i-input" value={form.price} onChange={e => set('price', e.target.value)} /></div>
          </div>
          <div className="i-form-grid">
            <div className="i-field"><label className="i-label">Old Price</label><input type="text" className="i-input" value={form.old} onChange={e => set('old', e.target.value)} /></div>
            <div className="i-field">
              <label className="i-label" htmlFor="thumbnail-upload">Thumbnail</label>
              <input
                id="thumbnail-upload"
                type="file"
                className="i-input"
                accept="image/*"
                disabled={uploadingThumbnail}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) uploadThumbnail(file)
                  e.target.value = ''
                }}
              />
              <input
                type="text"
                className="i-input"
                value={form.thumbnail}
                onChange={e => set('thumbnail', e.target.value)}
                placeholder="Or paste a thumbnail URL..."
                style={{ marginTop: 10 }}
              />
              {uploadingThumbnail ? (
                <p className="i-hint-block" style={{ marginTop: 8 }}>Uploading thumbnail...</p>
              ) : form.thumbnail ? (
                <img
                  src={form.thumbnail}
                  alt="Thumbnail preview"
                  style={{ marginTop: 12, width: '100%', maxWidth: 320, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(15, 23, 42, 0.12)' }}
                />
              ) : null}
            </div>
          </div>
        </FormSection>

          <FormSection title="Enrollment Info">
            <div className="i-form-grid">
              <div className="i-field"><label className="i-label">Format</label><input type="text" className="i-input" value={form.format} onChange={e => set('format', e.target.value)} /></div>
              <div className="i-field"><label className="i-label">Certificate</label><input type="text" className="i-input" value={form.certificate} onChange={e => set('certificate', e.target.value)} /></div>
            </div>
            <div className="i-form-grid">
              <div className="i-field"><label className="i-label">Guarantee</label><input type="text" className="i-input" value={form.guarantee} onChange={e => set('guarantee', e.target.value)} /></div>
              <div className="i-field"><label className="i-label">Support</label><input type="text" className="i-input" value={form.support} onChange={e => set('support', e.target.value)} /></div>
            </div>
          </FormSection>

          <FormSection title="What You'll Learn"><WhatYouLearnBuilder items={form.whatYouLearn} onChange={v => set('whatYouLearn', v)} /></FormSection>
          <FormSection title="Who This Is For"><WhoThisIsForBuilder items={form.whoThisIsFor} onChange={v => set('whoThisIsFor', v)} /></FormSection>
          <FormSection title="Curriculum Builder"><CurriculumBuilder items={form.programOverview} onChange={v => set('programOverview', v)} /></FormSection>

          <div className="i-form-actions">
            <Link href="/instructor/courses" className="i-btn i-btn-ghost">Back</Link>
            <button type="submit" className="i-btn i-btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>

        <aside className="i-edit-sidebar"><CoursePanel courseId={id} title={courseTitle} onDelete={handleDelete} deleting={deleting} /></aside>
      </div>
    </div>
  )
}

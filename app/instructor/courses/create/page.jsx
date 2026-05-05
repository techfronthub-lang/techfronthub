'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

/* ── Default form state ───────────────────────────────────────────────────── */
function defaultForm() {
  return {
    title:           '',
    code:            '',
    category:        '',
    desc:            '',
    tag:             '',
    tagHot:          false,
    level:           '',
    duration:        '',
    lessons:         '',
    price:           '',
    old:             '',
    format:          '',
    certificate:     '',
    guarantee:       '',
    support:         '',
    thumbnail:       '',
    whatYouLearn:    [{ benefit: '' }],
    whoThisIsFor:    [{ audience: '' }],
    programOverview: [{ week: '', title: '', description: '' }],
  }
}

/* ── Inline SVG icons ─────────────────────────────────────────────────────── */
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconMinus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

/* ── Array builders ───────────────────────────────────────────────────────── */
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

/* ── Form section wrapper ─────────────────────────────────────────────────── */
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

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function CreateCoursePage() {
  const ctx        = useInstructor()
  const instructor = ctx?.instructor
  const router     = useRouter()

  const [form, setForm]           = useState(defaultForm())
  const [categories, setCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [error, setError]           = useState(null)

  useEffect(() => {
    fetch('/api/categories?limit=100', { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setCategories(data.docs ?? []))
      .catch(() => console.error('Failed to load categories'))
  }, [])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

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
      price:           form.price !== '' ? form.price : undefined,
      priceKobo:       toKobo(form.price),
      whatYouLearn:    form.whatYouLearn.filter(i => i.benefit.trim()),
      whoThisIsFor:    form.whoThisIsFor.filter(i => i.audience.trim()),
      programOverview: form.programOverview.filter(i => i.week.trim() || i.title.trim()),
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Course title is required.'); return }
    if (!form.category) { setError('Please select a category.'); return }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/courses', {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.errors?.[0]?.message ?? data?.message ?? `HTTP ${res.status}`)
      const newId = data.doc?.id ?? data.id
      router.push(`/instructor/courses/${newId}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="i-page">
      <nav className="i-breadcrumb">
        <Link href="/instructor/courses"><IconChevronLeft /> My Courses</Link>
        <span className="i-sep">/</span>
        <span className="current">New Course</span>
      </nav>

      <div className="i-page-header">
        <div className="i-page-header-left">
          <h1>Create New Course</h1>
          <p>Fill in the details below to publish your course.</p>
        </div>
      </div>

      {error && <div className="i-alert i-alert-error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <FormSection title="Basic Info" desc="Start with the core details of your course.">
          <div className="i-form-grid">
            <div className="i-field i-field-required">
              <label className="i-label" htmlFor="title">Course Title</label>
              <input id="title" type="text" className="i-input" placeholder="e.g. Complete Web Development Bootcamp" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="i-field i-field-required">
              <label className="i-label" htmlFor="category">Category</label>
              <select id="category" className="i-select" value={form.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Select a category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div className="i-form-grid-3">
            <div className="i-field">
              <label className="i-label" htmlFor="code">Course Code</label>
              <input id="code" type="text" className="i-input" placeholder="e.g. WEB-101" value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
            <div className="i-field">
              <label className="i-label" htmlFor="tag">Status Tag</label>
              <select id="tag" className="i-select" value={form.tag} onChange={e => set('tag', e.target.value)}>
                {TAG_OPTIONS.map(t => <option key={t} value={t}>{t || '— None —'}</option>)}
              </select>
            </div>
            <div className="i-field">
              <label className="i-label" htmlFor="level">Difficulty Level</label>
              <select id="level" className="i-select" value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l || '— None —'}</option>)}
              </select>
            </div>
          </div>
          <div className="i-field">
            <label className="i-label" htmlFor="desc">Description</label>
            <textarea id="desc" className="i-textarea" rows={4} placeholder="Briefly describe what this course is about…" value={form.desc} onChange={e => set('desc', e.target.value)} />
          </div>
          <label className="i-checkbox-row">
            <input type="checkbox" className="i-checkbox" checked={form.tagHot} onChange={e => set('tagHot', e.target.checked)} />
            <span className="i-checkbox-label">Mark as Hot <small>(shows fire icon)</small></span>
          </label>
        </FormSection>

        <FormSection title="Details" desc="Configure pricing, duration and branding.">
          <div className="i-form-grid-3">
            <div className="i-field">
              <label className="i-label" htmlFor="duration">Duration</label>
              <input id="duration" type="text" className="i-input" placeholder="e.g. 12 weeks" value={form.duration} onChange={e => set('duration', e.target.value)} />
            </div>
            <div className="i-field">
              <label className="i-label" htmlFor="lessons">Lessons</label>
              <input id="lessons" type="number" className="i-input" placeholder="0" value={form.lessons} onChange={e => set('lessons', e.target.value)} />
            </div>
            <div className="i-field">
              <label className="i-label" htmlFor="price">Price (₦)</label>
              <input id="price" type="text" className="i-input" placeholder="45000" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>
          <div className="i-form-grid">
            <div className="i-field">
              <label className="i-label" htmlFor="old">Old Price</label>
              <input id="old" type="text" className="i-input" placeholder="60000" value={form.old} onChange={e => set('old', e.target.value)} />
            </div>
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
                placeholder="Or paste a thumbnail URL..."
                value={form.thumbnail}
                onChange={e => set('thumbnail', e.target.value)}
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

        <FormSection title="Enrollment Info" desc="Displayed on the public enrollment card.">
          <div className="i-form-grid">
            <div className="i-field">
              <label className="i-label" htmlFor="format">Format</label>
              <input id="format" type="text" className="i-input" placeholder="Hybrid / Online" value={form.format} onChange={e => set('format', e.target.value)} />
            </div>
            <div className="i-field">
              <label className="i-label" htmlFor="certificate">Certificate</label>
              <input id="certificate" type="text" className="i-input" placeholder="Professional Certificate" value={form.certificate} onChange={e => set('certificate', e.target.value)} />
            </div>
          </div>
          <div className="i-form-grid">
            <div className="i-field">
              <label className="i-label" htmlFor="guarantee">Guarantee</label>
              <input id="guarantee" type="text" className="i-input" placeholder="30-day money back" value={form.guarantee} onChange={e => set('guarantee', e.target.value)} />
            </div>
            <div className="i-field">
              <label className="i-label" htmlFor="support">Support</label>
              <input id="support" type="text" className="i-input" placeholder="Discord / Office Hours" value={form.support} onChange={e => set('support', e.target.value)} />
            </div>
          </div>
        </FormSection>

        <FormSection title="What You'll Learn">
          <WhatYouLearnBuilder items={form.whatYouLearn} onChange={v => set('whatYouLearn', v)} />
        </FormSection>

        <FormSection title="Who This Is For">
          <WhoThisIsForBuilder items={form.whoThisIsFor} onChange={v => set('whoThisIsFor', v)} />
        </FormSection>

        <FormSection title="Curriculum Builder" desc="Manage modules and lesson summaries.">
          <CurriculumBuilder items={form.programOverview} onChange={v => set('programOverview', v)} />
        </FormSection>

        <div className="i-form-actions">
          <Link href="/instructor/courses" className="i-btn i-btn-ghost">Cancel</Link>
          <button type="submit" className="i-btn i-btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  )
}

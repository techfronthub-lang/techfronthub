'use client'

import React, { useEffect, useState } from 'react'
import { createDoc } from '@/src/lib/payload-api'

const SCHEMA = {
  courses: [
    { name: 'title', type: 'text', required: true },
    { name: 'code', type: 'text' },
    { name: 'desc', type: 'text' },
    { name: 'tag', type: 'select', options: ['BOOTCAMP', 'NEW', 'POPULAR', 'ADVANCED', 'LIVE'] },
    { name: 'tagHot', type: 'checkbox' },
    { name: 'level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'All levels'] },
    { name: 'duration', type: 'text' },
    { name: 'lessons', type: 'number' },
    { name: 'price', type: 'text' },
    { name: 'old', type: 'text', label: 'Old Price' },
    { name: 'thumbnail', type: 'file', label: 'Thumbnail' },
    { name: 'format', type: 'text', label: 'Delivery (e.g. Cohort-based, live online)' },
    { name: 'certificate', type: 'text', label: 'Certificate' },
    { name: 'guarantee', type: 'text', label: 'Guarantee' },
    { name: 'support', type: 'textarea', label: 'Support Info' },
    { name: 'whatYouLearn', type: 'array-simple', valueKey: 'benefit', label: "What You'll Learn" },
    { name: 'whoThisIsFor', type: 'array-simple', valueKey: 'audience', label: 'Who This Is For' },
    { name: 'programOverview', type: 'array-overview', label: 'Program Overview' },
  ],
  categories: [
    { name: 'title', type: 'text', required: true },
    { name: 'n', type: 'text', label: 'Short Name' },
    { name: 'desc', type: 'text' },
    { name: 'count', type: 'text' },
    { name: 'thumbnail', type: 'file', label: 'Thumbnail' },
    { name: 'icon', type: 'select', options: ['Code', 'Brain', 'Zap', 'Target', 'Rocket', 'Users', 'Shield', 'TrendingUp'] },
  ],
  packages: [
    { name: 'name', type: 'text', required: true },
    { name: 'icon', type: 'select', options: ['BookOpen', 'Video', 'Users', 'MessageCircle'] },
    { name: 'featured', type: 'checkbox' },
    { name: 'badge', type: 'text' },
    { name: 'desc', type: 'text' },
    { name: 'price', type: 'text' },
    { name: 'per', type: 'text', label: 'Per (e.g. /month)' },
    { name: 'features', type: 'array', label: 'Feature List' },
    { name: 'sortOrder', type: 'number' },
  ],
  testimonials: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text' },
    { name: 'initials', type: 'text', label: 'Initials (2 chars)' },
    { name: 'quote', type: 'textarea', required: true },
  ],
  'udemy-courses': [
    { name: 'title', type: 'text', required: true },
    { name: 'author', type: 'text' },
    { name: 'rating', type: 'number' },
    { name: 'count', type: 'text', label: 'Review Count' },
    { name: 'hours', type: 'text' },
    { name: 'price', type: 'text' },
    { name: 'udemyUrl', type: 'text', label: 'Udemy URL' },
    { name: 'thumbnail', type: 'file', label: 'Thumbnail' },
    { name: 'sortOrder', type: 'number' },
  ],
  users: [
    { name: 'name', type: 'text', label: 'Full Name' },
    { name: 'email', type: 'text', required: true },
    { name: 'role', type: 'select', options: ['admin', 'instructor', 'student', 'staff'], defaultValue: 'student' },
    { name: 'status', type: 'select', options: ['active', 'pending', 'suspended'], defaultValue: 'active' },
    { name: 'phone', type: 'text' },
    { name: 'avatar', type: 'text', label: 'Avatar URL' },
    { name: 'password', type: 'password', label: 'New Password' },
  ],
}

function ArrayField({ label, valueKey = 'feature', value = [], onChange }) {
  const items = Array.isArray(value) ? value : []
  const update = (i, v) => {
    const next = [...items]
    next[i] = { [valueKey]: v }
    onChange(next)
  }
  const add = () => onChange([...items, { [valueKey]: '' }])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="a-field">
      <label className="a-label">{label}</label>
      <div className="array-builder">
        {items.map((item, i) => (
          <div key={i} className="array-item">
            <input
              value={item?.[valueKey] ?? ''}
              onChange={e => update(i, e.target.value)}
              placeholder={`Item ${i + 1}`}
            />
            <button type="button" className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--a-danger)', flexShrink: 0 }} onClick={() => remove(i)}>x</button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={add}>+ Add item</button>
      </div>
    </div>
  )
}

function ProgramOverviewField({ label, value = [], onChange }) {
  const items = Array.isArray(value) ? value : []
  const update = (i, key, v) => {
    const next = [...items]
    next[i] = { ...next[i], [key]: v }
    onChange(next)
  }
  const add = () => onChange([...items, { week: '', title: '', description: '' }])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div className="a-field">
      <label className="a-label">{label}</label>
      <div className="array-builder">
        {items.map((item, i) => (
          <div key={i} className="array-item-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--a-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Entry {i + 1}</span>
              <button type="button" className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--a-danger)' }} onClick={() => remove(i)}>x</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, marginBottom: 8 }}>
              <input className="a-input" value={item?.week ?? ''} onChange={e => update(i, 'week', e.target.value)} placeholder="e.g. Week 1-2" />
              <input className="a-input" value={item?.title ?? ''} onChange={e => update(i, 'title', e.target.value)} placeholder="Topic title" />
            </div>
            <textarea className="a-textarea" rows={2} value={item?.description ?? ''} onChange={e => update(i, 'description', e.target.value)} placeholder="Brief description of this week..." />
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={add}>+ Add week</button>
      </div>
    </div>
  )
}

export default function DocForm({ slug, initialData = {}, onSubmit, submitting, submitLabel = 'Save' }) {
  const fields = SCHEMA[slug] || []
  const [uploadingField, setUploadingField] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [_previewError, setPreviewError] = useState('')
  const [data, setData] = useState(() => {
    const d = { ...initialData }
    const arrayTypes = new Set(['array', 'array-simple', 'array-overview'])
    fields.forEach(f => {
      if (f.name in d) return
      if (f.defaultValue !== undefined) d[f.name] = f.defaultValue
      else d[f.name] = f.type === 'checkbox' ? false : arrayTypes.has(f.type) ? [] : ''
    })
    return d
  })

  const set = (name, value) => setData(prev => ({ ...prev, [name]: value }))
  const getUploadFolder = (fieldName) => {
    if (fieldName === 'thumbnail') {
      if (slug === 'udemy-courses') return 'udemy-courses'
      if (slug === 'categories') return 'categories'
      if (slug === 'courses') return 'courses'
    }
    return slug || 'media'
  }

  useEffect(() => {
    if (slug !== 'udemy-courses') return
    const url = String(data.udemyUrl || '').trim()
    if (!url) return

    let cancelled = false
    setPreviewError('')
    const timer = setTimeout(async () => {
      setPreviewLoading(true)
      try {
        const res = await fetch(`/api/udemy/preview?url=${encodeURIComponent(url)}`)
        const json = await res.json().catch(() => ({}))
        if (cancelled) {
          return
        }
        if (!res.ok) {
          setPreviewError(json?.message || 'Could not load Udemy preview')
          return
        }
        let filled = false
        setData((prev) => {
          const next = { ...prev }
          const autoFill = (key, value) => {
            if (value === undefined || value === null || value === '') return
            if (String(prev[key] ?? '').trim()) return
            next[key] = key === 'rating' ? Number(value) : value
            filled = true
          }

          autoFill('title', json.title)
          autoFill('author', json.author)
          autoFill('rating', json.rating)
          autoFill('count', json.count)
          autoFill('hours', json.hours)
          autoFill('price', json.price)
          autoFill('thumbnail', json.thumbnail)
          return next
        })
        if (!filled && !String(json.title || '').trim() && !String(json.thumbnail || '').trim()) {
          setPreviewError(json?.message || 'No preview metadata was returned from Udemy.')
        } else if (json?.message) {
          setPreviewError(json.message)
        }
      } catch {
        setPreviewError('Could not load Udemy preview.')
      } finally {
        if (!cancelled) setPreviewLoading(false)
      }
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [slug, data.udemyUrl])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (slug === 'udemy-courses') {
      const url = String(data.udemyUrl || '').trim()
      const title = String(data.title || '').trim()
      const thumbnail = String(data.thumbnail || '').trim()
      if (!url) {
        setPreviewError('Add a Udemy URL first.')
        return
      }
      if (previewLoading) {
        setPreviewError('Wait for the Udemy preview to finish loading.')
        return
      }
      if (!title || !thumbnail) {
        setPreviewError('Add a title and thumbnail before saving. You can type them manually or upload the image from your computer.')
        return
      }
    }

    const payload = { ...data }
    if (slug === 'users' && !payload.password) delete payload.password
    onSubmit(payload)
  }

  const renderField = (f) => {
    const label = f.label || f.name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())

    if (f.type === 'array' || f.type === 'array-simple') return (
      <ArrayField key={f.name} label={label} valueKey={f.valueKey || 'feature'} value={data[f.name]} onChange={v => set(f.name, v)} />
    )

    if (f.type === 'array-overview') return (
      <ProgramOverviewField key={f.name} label={label} value={data[f.name]} onChange={v => set(f.name, v)} />
    )

    if (f.type === 'checkbox') return (
      <div key={f.name} className="a-field">
        <div className="a-checkbox-row">
          <input id={f.name} type="checkbox" className="a-checkbox" checked={!!data[f.name]} onChange={e => set(f.name, e.target.checked)} />
          <label htmlFor={f.name} className="a-label" style={{ marginBottom: 0, cursor: 'pointer' }}>{label}</label>
        </div>
      </div>
    )

    if (f.type === 'file') return (
      <div key={f.name} className="a-field" style={{ gridColumn: '1 / -1' }}>
        <label className="a-label">{label}</label>
        <input
          className="a-input"
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setUploadingField(f.name)
            try {
              const formData = new FormData()
              formData.append('file', file)
              formData.append('folder', getUploadFolder(f.name))
              const res = await fetch('/api/storage/upload', { method: 'POST', body: formData })
              const json = await res.json().catch(() => ({}))
              if (!res.ok) throw new Error(json.message || 'Upload failed')
              set(f.name, json.url || '')
              await createDoc('media-assets', {
                name: file.name,
                url: json.url || '',
                key: json.key || '',
                bucket: json.bucket || '',
                folder: f.name,
                mimeType: file.type,
                size: file.size,
              }).catch(() => {})
            } finally {
              setUploadingField('')
              e.target.value = ''
            }
          }}
        />
        {uploadingField === f.name ? (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--a-muted)' }}>Uploading...</div>
        ) : null}
        {slug === 'udemy-courses' && previewLoading ? (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--a-muted)' }}>Fetching preview...</div>
        ) : null}
        <input
          className="a-input"
          value={data[f.name] || ''}
          onChange={e => set(f.name, e.target.value)}
          placeholder={slug === 'udemy-courses' ? 'Upload to S3, auto-fill from the Udemy URL, or paste an image URL' : 'Upload an image or paste an image URL'}
          style={{ marginTop: 10 }}
        />
        {data[f.name] ? (
          <img
            src={data[f.name]}
            alt="Thumbnail preview"
            style={{ marginTop: 12, width: 240, maxWidth: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 12, border: '1px solid var(--a-border)' }}
          />
        ) : null}
      </div>
    )

    if (f.type === 'textarea') return (
      <div key={f.name} className="a-field" style={{ gridColumn: '1 / -1' }}>
        <label className="a-label">{label}{f.required && ' *'}</label>
        <textarea className="a-textarea" value={data[f.name] || ''} onChange={e => set(f.name, e.target.value)} required={f.required} />
      </div>
    )

    if (f.type === 'select') return (
      <div key={f.name} className="a-field">
        <label className="a-label">{label}</label>
        <select className="a-select" value={data[f.name] || ''} onChange={e => set(f.name, e.target.value)}>
          <option value="">- none -</option>
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )

    return (
      <div key={f.name} className="a-field">
        <label className="a-label">{label}{f.required && ' *'}</label>
        <input
          className="a-input"
          type={f.type === 'number' ? 'number' : f.type === 'password' ? 'password' : 'text'}
          value={data[f.name] ?? ''}
          onChange={e => set(f.name, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          required={f.required}
          {...(f.name === 'initials' ? { maxLength: 2 } : {})}
        />
      </div>
    )
  }

  const fullTypes = new Set(['array', 'array-simple', 'array-overview', 'textarea', 'file'])
  const gridFields = fields.filter(f => !fullTypes.has(f.type))
  const fullFields = fields.filter(f => fullTypes.has(f.type))

  return (
    <form className="a-form" onSubmit={handleSubmit}>
      <div className="form-grid-2">
        {gridFields.map(renderField)}
      </div>
      {fullFields.map(renderField)}
      <div style={{ marginTop: 4 }}>
        <button className="btn btn-primary" type="submit" disabled={submitting || (slug === 'udemy-courses' && previewLoading)}>
          {submitting ? 'Saving...' : previewLoading && slug === 'udemy-courses' ? 'Loading preview...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

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
  'blog-posts': [
    { name: 'title', type: 'text', required: true, label: 'Article Title' },
    { name: 'slug', type: 'text', required: true, label: 'URL Slug' },
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
    { name: 'featured', type: 'checkbox', label: 'Feature this article' },
    { name: 'author', type: 'text', defaultValue: 'TECHFRONT HUB' },
    { name: 'category', type: 'text', defaultValue: 'Insights' },
    { name: 'readTime', type: 'text', defaultValue: '5 min read', label: 'Read Time' },
    { name: 'publishedAt', type: 'datetime', label: 'Publish Date' },
    { name: 'excerpt', type: 'textarea', required: true, label: 'Deck / Excerpt' },
    { name: 'coverImage', type: 'file', label: 'Cover Image' },
    { name: 'tags', type: 'array-simple', valueKey: 'tag', label: 'Tags' },
    { name: 'bodySections', type: 'blog-sections', label: 'Article Builder' },
    { name: 'content', type: 'textarea', label: 'Fallback Plain Text Body' },
  ],
  events: [
    { name: 'title', type: 'text', required: true, label: 'Event Title' },
    { name: 'photo', type: 'file', label: 'Event Photo' },
    { name: 'sortOrder', type: 'number' },
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

const BLOG_SECTION_TYPES = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'heading', label: 'Heading' },
  { value: 'quote', label: 'Quote' },
  { value: 'bullet-list', label: 'Bullet List' },
  { value: 'image', label: 'Image' },
  { value: 'callout', label: 'Callout' },
]

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatDateTimeLocal(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  const offset = parsed.getTimezoneOffset()
  const local = new Date(parsed.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function toIsoDateTime(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString()
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
            <button type="button" className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--a-danger)', flexShrink: 0 }} onClick={() => remove(i)}>×</button>
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
              <button type="button" className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--a-danger)' }} onClick={() => remove(i)}>×</button>
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

function BlogSectionsField({ label, value = [], onChange, uploadFile, uploadingField }) {
  const items = Array.isArray(value) ? value : []

  const update = (index, key, nextValue) => {
    const next = [...items]
    next[index] = { ...next[index], [key]: nextValue }
    onChange(next)
  }

  const add = (type = 'paragraph') => {
    onChange([
      ...items,
      {
        type,
        heading: '',
        body: '',
        image: '',
        imageAlt: '',
        caption: '',
      },
    ])
  }

  const remove = (index) => onChange(items.filter((_, itemIndex) => itemIndex !== index))

  const move = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(targetIndex, 0, item)
    onChange(next)
  }

  return (
    <div className="a-field" style={{ gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <label className="a-label" style={{ marginBottom: 4 }}>{label}</label>
          <div style={{ fontSize: 12, color: 'var(--a-muted)', lineHeight: 1.6 }}>
            Compose the article with content blocks. Mix text, quotes, image breaks, lists, and callouts.
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BLOG_SECTION_TYPES.map((type) => (
            <button key={type.value} type="button" className="btn btn-ghost btn-sm" onClick={() => add(type.value)}>
              + {type.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {items.map((item, index) => {
          const type = item?.type || 'paragraph'
          const typeLabel = BLOG_SECTION_TYPES.find((entry) => entry.value === type)?.label || 'Block'
          const uploadKey = `bodySections.${index}.image`

          return (
            <div key={index} className="a-card blog-block-card">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'inline-flex', minWidth: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 999, background: 'var(--a-bg-subtle)', fontSize: 12, fontWeight: 700, color: 'var(--a-muted)' }}>
                    {index + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--a-text)' }}>{typeLabel}</div>
                    <div style={{ fontSize: 11, color: 'var(--a-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Content block</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(index, -1)} disabled={index === 0}>Up</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(index, 1)} disabled={index === items.length - 1}>Down</button>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--a-danger)' }} onClick={() => remove(index)}>Remove</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'minmax(0,200px) 1fr' }}>
                  <div>
                    <label className="a-label">Block Type</label>
                    <select className="a-select" value={type} onChange={(event) => update(index, 'type', event.target.value)}>
                      {BLOG_SECTION_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  {type !== 'image' ? (
                    <div>
                      <label className="a-label">{type === 'heading' ? 'Heading text' : 'Optional heading'}</label>
                      <input className="a-input" value={item?.heading || ''} onChange={(event) => update(index, 'heading', event.target.value)} placeholder={type === 'heading' ? 'Section heading' : 'Optional label for this block'} />
                    </div>
                  ) : (
                    <div>
                      <label className="a-label">Image alt text</label>
                      <input className="a-input" value={item?.imageAlt || ''} onChange={(event) => update(index, 'imageAlt', event.target.value)} placeholder="Describe the image for accessibility" />
                    </div>
                  )}
                </div>

                {type === 'image' ? (
                  <div>
                    <label className="a-label">Image</label>
                    <input
                      className="a-input"
                      type="file"
                      accept="image/*"
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        const url = await uploadFile(file, uploadKey, 'blog')
                        if (url) update(index, 'image', url)
                        event.target.value = ''
                      }}
                    />
                    {uploadingField === uploadKey ? (
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--a-muted)' }}>Uploading image...</div>
                    ) : null}
                    <input className="a-input" value={item?.image || ''} onChange={(event) => update(index, 'image', event.target.value)} placeholder="Upload an image or paste a URL" style={{ marginTop: 10 }} />
                    <input className="a-input" value={item?.caption || ''} onChange={(event) => update(index, 'caption', event.target.value)} placeholder="Optional caption" style={{ marginTop: 10 }} />
                    {item?.image ? (
                      <img src={item.image} alt={item?.imageAlt || 'Article block preview'} style={{ marginTop: 12, width: '100%', maxWidth: 560, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 16, border: '1px solid var(--a-border)' }} />
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <label className="a-label">
                      {type === 'quote' ? 'Quote' : type === 'bullet-list' ? 'List items' : type === 'callout' ? 'Callout copy' : 'Body copy'}
                    </label>
                    <textarea
                      className="a-textarea"
                      rows={type === 'bullet-list' ? 5 : type === 'heading' ? 3 : 6}
                      value={item?.body || ''}
                      onChange={(event) => update(index, 'body', event.target.value)}
                      placeholder={
                        type === 'bullet-list'
                          ? 'Write one point per line'
                          : type === 'quote'
                            ? 'Strong takeaway or quote'
                            : 'Write the content for this section'
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {!items.length ? (
          <div className="a-empty" style={{ borderStyle: 'dashed', borderRadius: 18 }}>
            No blocks yet. Start with a paragraph, heading, or image section.
          </div>
        ) : null}
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

  const uploadAsset = async (file, fieldName, folderOverride) => {
    if (!file) return ''
    setUploadingField(fieldName)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folderOverride || getUploadFolder(fieldName))
      const res = await fetch('/api/storage/upload', { method: 'POST', body: formData })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Upload failed')

      await createDoc('media-assets', {
        name: file.name,
        url: json.url || '',
        key: json.key || '',
        bucket: json.bucket || '',
        folder: folderOverride || fieldName,
        mimeType: file.type,
        size: file.size,
      }).catch(() => {})

      return json.url || ''
    } finally {
      setUploadingField('')
    }
  }

  const getUploadFolder = (fieldName) => {
    if (fieldName === 'thumbnail' || fieldName === 'photo' || fieldName === 'coverImage') {
      if (slug === 'udemy-courses') return 'udemy-courses'
      if (slug === 'categories') return 'categories'
      if (slug === 'courses') return 'courses'
      if (slug === 'events') return 'events'
      if (slug === 'blog-posts') return 'blog'
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
    if (slug === 'blog-posts') {
      payload.slug = slugify(payload.slug || payload.title)
      if (!payload.publishedAt) delete payload.publishedAt
      payload.bodySections = Array.isArray(payload.bodySections)
        ? payload.bodySections.filter((item) => {
            const type = String(item?.type || '')
            return Boolean(
              type === 'image'
                ? item?.image
                : item?.heading || item?.body || item?.caption,
            )
          })
        : []
    }
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

    if (f.type === 'blog-sections') return (
      <BlogSectionsField
        key={f.name}
        label={label}
        value={data[f.name]}
        onChange={v => set(f.name, v)}
        uploadFile={uploadAsset}
        uploadingField={uploadingField}
      />
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
            try {
              const url = await uploadAsset(file, f.name)
              set(f.name, url)
            } finally {
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
        <textarea
          className="a-textarea"
          rows={slug === 'blog-posts' && (f.name === 'excerpt' || f.name === 'content') ? (f.name === 'excerpt' ? 4 : 10) : undefined}
          value={data[f.name] || ''}
          onChange={e => set(f.name, e.target.value)}
          required={f.required}
          placeholder={
            slug === 'blog-posts' && f.name === 'excerpt'
              ? 'Write the short summary readers see on the blog index and social previews.'
              : slug === 'blog-posts' && f.name === 'content'
                ? 'Optional plain-text backup body. Separate paragraphs with blank lines.'
                : undefined
          }
        />
      </div>
    )

    if (f.type === 'datetime') return (
      <div key={f.name} className="a-field">
        <label className="a-label">{label}</label>
        <input
          className="a-input"
          type="datetime-local"
          value={formatDateTimeLocal(data[f.name])}
          onChange={e => set(f.name, toIsoDateTime(e.target.value))}
        />
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
          onChange={e => {
            const nextValue = f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
            set(f.name, nextValue)
            if (slug === 'blog-posts' && f.name === 'title') {
              setData(prev => {
                const currentSlug = String(prev.slug || '')
                const generatedSlug = slugify(nextValue)
                if (!currentSlug || currentSlug === slugify(prev.title || '')) {
                  return { ...prev, title: nextValue, slug: generatedSlug }
                }
                return { ...prev, title: nextValue }
              })
            }
          }}
          required={f.required}
          {...(f.name === 'initials' ? { maxLength: 2 } : {})}
        />
        {slug === 'blog-posts' && f.name === 'slug' ? (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--a-muted)', lineHeight: 1.6 }}>
            Final URL: <code>/blog/{data.slug || 'your-article-slug'}</code>
          </div>
        ) : null}
      </div>
    )
  }

  const fullTypes = new Set(['array', 'array-simple', 'array-overview', 'textarea', 'file', 'blog-sections'])
  const gridFields = fields.filter(f => !fullTypes.has(f.type))
  const fullFields = fields.filter(f => fullTypes.has(f.type))
  const isBlog = slug === 'blog-posts'
  const fieldByName = (name) => fields.find((field) => field.name === name)
  const renderNamedField = (name) => {
    const field = fieldByName(name)
    return field ? renderField(field) : null
  }

  if (isBlog) {
    return (
      <form className="a-form blog-editor-form" onSubmit={handleSubmit}>
        <div className="blog-editor-head">
          <div>
            <div className="blog-editor-kicker">Article editor</div>
            <h2>New blog post</h2>
            <p>Write the article, set the public preview details, then publish when it is ready.</p>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </div>

        <div className="blog-editor-grid">
          <section className="blog-editor-main">
            {renderNamedField('title')}
            {renderNamedField('slug')}
            {renderNamedField('excerpt')}
            {renderNamedField('coverImage')}
            {renderNamedField('bodySections')}
            {renderNamedField('content')}
          </section>

          <aside className="blog-editor-side">
            <div className="blog-side-section">
              <div className="blog-side-title">Publish</div>
              {renderNamedField('status')}
              {renderNamedField('publishedAt')}
              {renderNamedField('featured')}
            </div>
            <div className="blog-side-section">
              <div className="blog-side-title">Details</div>
              {renderNamedField('author')}
              {renderNamedField('category')}
              {renderNamedField('readTime')}
              {renderNamedField('tags')}
            </div>
          </aside>
        </div>

        <div className="blog-editor-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    )
  }

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

'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getGlobal, updateGlobal } from '@/src/lib/payload-api'

const GLOBALS_SCHEMA = {
  'site-config': [
    {
      section: 'Header & Top Bar',
      fields: [
        { name: 'topbarLocation', type: 'text', label: 'Location Line' },
        { name: 'topbarAnnouncement', type: 'text', label: 'Announcement' },
        { name: 'topbarPhoneLabel', type: 'text', label: 'Phone Label' },
        { name: 'topbarPhoneHref', type: 'text', label: 'Phone Link' },
        { name: 'topbarSupportLabel', type: 'text', label: 'Support Label' },
        { name: 'topbarSupportHref', type: 'text', label: 'Support Link' },
        { name: 'topbarPartnersLabel', type: 'text', label: 'Partners Label' },
        { name: 'topbarPartnersHref', type: 'text', label: 'Partners Link' },
        {
          name: 'headerLinks',
          type: 'array',
          label: 'Header Links',
          itemFields: [
            { name: 'label', label: 'Label', placeholder: 'Courses' },
            { name: 'href', label: 'Href', placeholder: '/courses' },
          ],
        },
      ],
    },
    {
      section: 'Hero',
      fields: [
        { name: 'heroBadge', type: 'text', label: 'Badge Text' },
        { name: 'heroHeadline', type: 'text', label: 'Headline' },
        { name: 'heroLede', type: 'textarea', label: 'Sub-headline' },
      ],
    },
    {
      section: 'Stats',
      fields: [
        { name: 'statLearners', type: 'text', label: 'Learners Count' },
        { name: 'statCourses', type: 'text', label: 'Courses Count' },
        { name: 'statCareerTracks', type: 'text', label: 'Career Tracks Count' },
        { name: 'statPlacement', type: 'text', label: 'Placement Rate' },
        { name: 'statRating', type: 'text', label: 'Rating' },
      ],
    },
    {
      section: 'CTA',
      fields: [
        { name: 'ctaHeadline', type: 'text', label: 'CTA Headline' },
        { name: 'ctaBody', type: 'textarea', label: 'CTA Body' },
      ],
    },
    {
      section: 'Trusted Companies',
      fields: [
        { name: 'trustedLabel', type: 'text', label: 'Section Label' },
        {
          name: 'trustedCompanies',
          type: 'array',
          label: 'Company Names',
          itemFields: [{ name: 'name', label: 'Company', placeholder: 'Company name' }],
        },
      ],
    },
    {
      section: 'Homepage Sections',
      fields: [
        { name: 'featuredCoursesEyebrow', type: 'text', label: 'Featured Courses Eyebrow' },
        { name: 'featuredCoursesHeadline', type: 'text', label: 'Featured Courses Headline' },
        { name: 'featuredCoursesBody', type: 'textarea', label: 'Featured Courses Body' },
        { name: 'udemyEyebrow', type: 'text', label: 'Udemy Eyebrow' },
        { name: 'udemyHeadline', type: 'text', label: 'Udemy Headline' },
        { name: 'udemyBody', type: 'textarea', label: 'Udemy Body' },
        { name: 'whyUsEyebrow', type: 'text', label: 'Why Us Eyebrow' },
        { name: 'whyUsHeadline', type: 'text', label: 'Why Us Headline' },
        { name: 'whyUsBody', type: 'textarea', label: 'Why Us Body' },
        { name: 'categoriesEyebrow', type: 'text', label: 'Categories Eyebrow' },
        { name: 'categoriesHeadline', type: 'text', label: 'Categories Headline' },
        { name: 'categoriesBody', type: 'textarea', label: 'Categories Body' },
        { name: 'packagesEyebrow', type: 'text', label: 'Packages Eyebrow' },
        { name: 'packagesHeadline', type: 'text', label: 'Packages Headline' },
        { name: 'packagesBody', type: 'textarea', label: 'Packages Body' },
        { name: 'testimonialsEyebrow', type: 'text', label: 'Testimonials Eyebrow' },
        { name: 'testimonialsHeadline', type: 'text', label: 'Testimonials Headline' },
        { name: 'testimonialsBody', type: 'textarea', label: 'Testimonials Body' },
        { name: 'eventsEyebrow', type: 'text', label: 'Events Eyebrow' },
        { name: 'eventsHeadline', type: 'text', label: 'Events Headline' },
        { name: 'eventsBody', type: 'textarea', label: 'Events Body' },
        {
          name: 'events',
          type: 'array',
          label: 'Events List',
          itemFields: [
            { name: 'title', label: 'Title', placeholder: 'Event title' },
            { name: 'photo', label: 'Photo', placeholder: 'Paste image URL', type: 'file' },
            { name: 'sortOrder', label: 'Sort Order', placeholder: '0' },
          ],
        },
        { name: 'finalCtaEyebrow', type: 'text', label: 'Final CTA Eyebrow' },
        { name: 'finalCtaSecondaryLabel', type: 'text', label: 'Final CTA Secondary Label' },
        { name: 'finalCtaSecondaryHref', type: 'text', label: 'Final CTA Secondary Link' },
      ],
    },
    {
      section: 'Footer Identity',
      fields: [
        { name: 'footerHeadline', type: 'textarea', label: 'About Copy' },
        { name: 'footerAddress', type: 'text', label: 'Address' },
        { name: 'footerEmail', type: 'text', label: 'Email' },
        { name: 'footerPhone', type: 'text', label: 'Phone' },
      ],
    },
    {
      section: 'Footer Links',
      fields: [
        { name: 'footerLearnTitle', type: 'text', label: 'Learn Title' },
        {
          name: 'footerLearnLinks',
          type: 'array',
          label: 'Learn Links',
          itemFields: [
            { name: 'label', label: 'Label', placeholder: 'All courses' },
            { name: 'href', label: 'Href', placeholder: '/courses' },
          ],
        },
        { name: 'footerBusinessTitle', type: 'text', label: 'Business Title' },
        {
          name: 'footerBusinessLinks',
          type: 'array',
          label: 'Business Links',
          itemFields: [
            { name: 'label', label: 'Label', placeholder: 'Corporate training' },
            { name: 'href', label: 'Href', placeholder: '/business' },
          ],
        },
        { name: 'footerResourcesTitle', type: 'text', label: 'Resources Title' },
        {
          name: 'footerResourcesLinks',
          type: 'array',
          label: 'Resources Links',
          itemFields: [
            { name: 'label', label: 'Label', placeholder: 'Course catalog' },
            { name: 'href', label: 'Href', placeholder: '/courses' },
          ],
        },
        {
          name: 'footerLegalLinks',
          type: 'array',
          label: 'Legal Links',
          itemFields: [
            { name: 'label', label: 'Label', placeholder: 'Privacy' },
            { name: 'href', label: 'Href', placeholder: '/privacy' },
          ],
        },
      ],
    },
    {
      section: 'Footer Socials',
      fields: [
        {
          name: 'footerSocialLinks',
          type: 'array',
          label: 'Social Links',
          itemFields: [
            { name: 'platform', label: 'Platform', placeholder: 'Facebook' },
            { name: 'href', label: 'Href', placeholder: 'https://facebook.com/...' },
          ],
        },
      ],
    },
    {
      section: 'Footer Newsletter',
      fields: [
        { name: 'footerNewsletterTitle', type: 'text', label: 'Newsletter Title' },
        { name: 'footerNewsletterBody', type: 'textarea', label: 'Newsletter Body' },
        { name: 'footerNewsletterPlaceholder', type: 'text', label: 'Email Placeholder' },
        { name: 'footerNewsletterButton', type: 'text', label: 'Button Text' },
        { name: 'footerNewsletterNote', type: 'text', label: 'Helper Note' },
        { name: 'footerCopyright', type: 'text', label: 'Copyright Line' },
      ],
    },
  ],
}

function ArrayField({ label, value = [], onChange, itemFields = [{ name: 'name', label: 'Value', placeholder: 'Item' }] }) {
  const items = Array.isArray(value) ? value : []
  const [uploadingKey, setUploadingKey] = useState('')

  const template = () =>
    itemFields.reduce((acc, field) => {
      acc[field.name] = ''
      return acc
    }, {})

  const normalize = (item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) return item
    if (typeof item === 'string') return { [itemFields[0].name]: item }
    return template()
  }

  const update = (i, key, v) => {
    const next = [...items]
    next[i] = { ...normalize(next[i]), [key]: v }
    onChange(next)
  }

  const add = () => onChange([...items, template()])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const uploadImage = async (file, itemIndex, fieldName) => {
    setUploadingKey(`${itemIndex}:${fieldName}`)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'site-config-events')
      const res = await fetch('/api/storage/upload', { method: 'POST', body: formData })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Upload failed')
      update(itemIndex, fieldName, json.url || '')
    } finally {
      setUploadingKey('')
    }
  }

  return (
    <div className="a-field" style={{ gridColumn: '1 / -1' }}>
      <label className="a-label">{label}</label>
      <div className="array-builder">
        {items.map((item, i) => {
          const row = normalize(item)
          return (
            <div key={i} className="array-item">
              {itemFields.map((field) => (
                <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <span className="a-label" style={{ marginBottom: 0 }}>{field.label}</span>
                  {field.type === 'file' ? (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) await uploadImage(file, i, field.name)
                          e.target.value = ''
                        }}
                      />
                      <input
                        value={row?.[field.name] ?? ''}
                        onChange={(e) => update(i, field.name, e.target.value)}
                        placeholder={field.placeholder || field.label}
                      />
                      {uploadingKey === `${i}:${field.name}` ? (
                        <div style={{ fontSize: 12, color: 'var(--a-muted)' }}>Uploading...</div>
                      ) : null}
                    </>
                  ) : (
                    <input
                      value={row?.[field.name] ?? ''}
                      onChange={(e) => update(i, field.name, e.target.value)}
                      placeholder={field.placeholder || field.label}
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                style={{ color: 'var(--a-danger)', flexShrink: 0 }}
                onClick={() => remove(i)}
              >
                ×
              </button>
            </div>
          )
        })}
        <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={add}>
          + Add
        </button>
      </div>
    </div>
  )
}

export default function GlobalEditorPage() {
  const { slug } = useParams()
  const schema = GLOBALS_SCHEMA[slug] || []

  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getGlobal(slug)
      .then((d) => setData(d?.doc || d || {}))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  const set = (name, value) => setData((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSaved(false)
    try {
      await updateGlobal(slug, data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (f) => {
    if (f.type === 'array') {
      return (
        <ArrayField
          key={f.name}
          label={f.label}
          value={data[f.name]}
          onChange={(v) => set(f.name, v)}
          itemFields={f.itemFields}
        />
      )
    }

    if (f.type === 'textarea') {
      return (
        <div key={f.name} className="a-field" style={{ gridColumn: '1 / -1' }}>
          <label className="a-label">{f.label}</label>
          <textarea className="a-textarea" value={data[f.name] || ''} onChange={(e) => set(f.name, e.target.value)} />
        </div>
      )
    }

    return (
      <div key={f.name} className="a-field">
        <label className="a-label">{f.label}</label>
        <input className="a-input" type="text" value={data[f.name] || ''} onChange={(e) => set(f.name, e.target.value)} />
      </div>
    )
  }

  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <>
      <div className="admin-topbar">
        <div className="topbar-title">{title}</div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" form="global-form" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="admin-content">
        {error && <div className="a-error" style={{ marginBottom: 16 }}>{error}</div>}
        {saved && <div className="a-success-msg" style={{ marginBottom: 16 }}>Saved successfully.</div>}

        {loading ? (
          <div className="a-spinner" />
        ) : (
          <form id="global-form" onSubmit={handleSubmit}>
            {schema.map(({ section, fields }) => (
              <div key={section} className="a-card" style={{ maxWidth: 720, marginBottom: 20 }}>
                <div className="a-card-header">
                  <div className="a-card-title">{section}</div>
                </div>
                <div className="form-grid-2">
                  {fields.map(renderField)}
                </div>
              </div>
            ))}
          </form>
        )}
      </div>
    </>
  )
}

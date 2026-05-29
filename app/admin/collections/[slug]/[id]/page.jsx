'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getDoc, updateDoc, deleteDoc } from '@/src/lib/payload-api'
import DocForm from '../DocForm'

const LABEL = {
  courses: 'Courses', categories: 'Categories', packages: 'Packages',
  testimonials: 'Testimonials', 'udemy-courses': 'Udemy Courses', 'blog-posts': 'Blog Posts', users: 'Users',
}

export default function EditDocPage() {
  const { slug, id } = useParams()
  const router = useRouter()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getDoc(slug, id)
      .then(d => setDoc(d.doc || d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug, id])

  const handleSave = async (data) => {
    setSubmitting(true)
    setError('')
    setSaved(false)
    try {
      await updateDoc(slug, id, data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this document? This cannot be undone.')) return
    try {
      await deleteDoc(slug, id)
      router.replace(`/admin/collections/${slug}`)
    } catch (e) {
      setError(e.message)
    }
  }

  const title = LABEL[slug] || slug

  return (
    <>
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href={`/admin/collections/${slug}`} className="btn btn-ghost btn-sm">← {title}</Link>
          <span style={{ color: 'var(--a-muted)' }}>/</span>
          <span className="topbar-title">Edit</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="admin-content">
        {error && <div className="a-error" style={{ marginBottom: 16 }}>{error}</div>}
        {saved && <div className="a-success-msg" style={{ marginBottom: 16 }}>Saved successfully.</div>}

        <div
          className="a-card"
          style={slug === 'blog-posts'
            ? { maxWidth: 1320, padding: 0, background: 'transparent', border: 0 }
            : { maxWidth: 720 }}
        >
          {loading ? (
            <div className="a-spinner" />
          ) : doc ? (
            <DocForm slug={slug} initialData={doc} onSubmit={handleSave} submitting={submitting} submitLabel="Save Changes" />
          ) : (
            <div className="a-empty">Document not found.</div>
          )}
        </div>
      </div>
    </>
  )
}

'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createDoc } from '@/src/lib/payload-api'
import DocForm from '../DocForm'

const LABEL = {
  courses: 'Courses', categories: 'Categories', packages: 'Packages',
  testimonials: 'Testimonials', events: 'Events', 'udemy-courses': 'Udemy Courses', users: 'Users',
}

export default function CreateDocPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (data) => {
    setSubmitting(true)
    setError('')
    try {
      const res = await createDoc(slug, data)
      const newId = res.doc?.id || res.id
      router.replace(`/admin/collections/${slug}/${newId}`)
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  const title = LABEL[slug] || slug

  return (
    <>
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href={`/admin/collections/${slug}`} className="btn btn-ghost btn-sm">← {title}</Link>
          <span style={{ color: 'var(--a-muted)' }}>/</span>
          <span className="topbar-title">New</span>
        </div>
      </div>

      <div className="admin-content">
        {error && <div className="a-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="a-card" style={{ maxWidth: 720 }}>
          <DocForm slug={slug} onSubmit={handleCreate} submitting={submitting} submitLabel="Create" />
        </div>
      </div>
    </>
  )
}

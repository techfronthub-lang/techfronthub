'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createDoc, deleteDoc, getCollection } from '@/src/lib/payload-api'

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [recordsRes, bucketRes] = await Promise.all([
        getCollection('media-assets', { limit: 250, page: 1 }),
        fetch('/api/storage/list').then((r) => r.json()),
      ])
      const records = recordsRes.docs || []
      const objects = bucketRes.items || []
      const byKey = new Map(records.filter((item) => item.key).map((item) => [item.key, item]))
      const merged = [
        ...records,
        ...objects.filter((obj) => !byKey.has(obj.key)).map((obj) => ({
          id: `storage:${obj.key}`,
          name: obj.key.split('/').pop() || obj.key,
          url: obj.url,
          key: obj.key,
          bucket: obj.bucket,
          folder: obj.key.includes('/') ? obj.key.split('/').slice(0, -1).join('/') : '',
          mimeType: '',
          size: obj.size,
          lastModified: obj.lastModified,
        })),
      ]
      setItems(merged)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) => {
      const haystack = [item.name, item.url, item.key, item.folder, item.mimeType].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(needle)
    })
  }, [items, query])

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'media')

      const uploadRes = await fetch('/api/storage/upload', { method: 'POST', body: formData })
      const uploadJson = await uploadRes.json().catch(() => ({}))
      if (!uploadRes.ok) throw new Error(uploadJson.message || 'Upload failed')

      await createDoc('media-assets', {
        name: file.name,
        url: uploadJson.url,
        key: uploadJson.key,
        bucket: uploadJson.bucket,
        folder: 'media',
        mimeType: file.type,
        size: file.size,
      })

      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this media item?')) return
    setDeleting(item.id)
    try {
      if (item.key) {
        await fetch('/api/storage/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: item.key, bucket: item.bucket }),
        })
      }
      if (!String(item.id).startsWith('storage:')) {
        await deleteDoc('media-assets', item.id)
      }
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(null)
    }
  }

  const copyUrl = async (url) => {
    await navigator.clipboard.writeText(url)
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="topbar-title">Media Library</div>
          <div style={{ fontSize: 12, color: 'var(--a-muted)', marginTop: 2 }}>
            Upload, reuse, and remove course thumbnails and other assets
          </div>
        </div>
        <div className="topbar-actions">
          <Link href="/admin/collections/media-assets" className="btn btn-ghost btn-sm">
            Raw collection
          </Link>
          <label className="btn btn-primary btn-sm" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            {uploading ? 'Uploading...' : '+ Upload image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="admin-content">
        {error && <div className="a-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="stats-grid" style={{ marginBottom: 16 }}>
          <div className="stat-card"><div className="stat-label">Assets</div><div className="stat-value">{items.length}</div></div>
          <div className="stat-card"><div className="stat-label">Images</div><div className="stat-value">{items.filter((item) => (item.mimeType || '').startsWith('image/') || item.url).length}</div></div>
          <div className="stat-card"><div className="stat-label">Filtered</div><div className="stat-value">{filtered.length}</div></div>
        </div>

        <div className="a-card" style={{ marginBottom: 16, padding: 16 }}>
          <div className="users-toolbar" style={{ gridTemplateColumns: '1fr auto' }}>
            <input
              className="a-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search media name, URL, folder or MIME type"
            />
            {query ? (
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setQuery('')}>
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="media-grid">
          {loading ? (
            <div className="a-spinner" />
          ) : filtered.length === 0 ? (
            <div className="a-empty">No media uploaded yet.</div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="media-card">
                <img src={item.url} alt={item.name} className="media-preview" />
                <div className="media-meta">
                  <div className="media-title">{item.name}</div>
                  <div className="media-sub">{formatSize(item.size)} {item.folder ? `- ${item.folder}` : ''}</div>
                  {String(item.id).startsWith('storage:') ? (
                    <div className="media-sub" style={{ marginTop: 4, color: 'var(--a-warn)' }}>Bucket object only</div>
                  ) : null}
                </div>
                <div className="media-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => copyUrl(item.url)}>
                    Copy URL
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.open(item.url, '_blank')}>
                    Open
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.id}
                  >
                    {deleting === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

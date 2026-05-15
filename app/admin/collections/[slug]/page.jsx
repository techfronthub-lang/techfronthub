'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getCollection, deleteDoc } from '@/src/lib/payload-api'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.04,
    },
  },
}

const COLLECTION_META = {
  courses: { title: 'Courses', titleField: 'title', cols: ['title', 'level', 'tag', 'price', 'lessons'] },
  categories: { title: 'Categories', titleField: 'title', cols: ['title', 'icon', 'desc'] },
  packages: { title: 'Packages', titleField: 'name', cols: ['name', 'price', 'per', 'featured'] },
  testimonials: { title: 'Testimonials', titleField: 'name', cols: ['name', 'role', 'quote'] },
  events: { title: 'Events', titleField: 'title', cols: ['title', 'photo'] },
  'udemy-courses': { title: 'Udemy Courses', titleField: 'title', cols: ['title', 'author', 'rating', 'price'] },
  users: { title: 'Users', titleField: 'email', cols: ['name', 'email', 'role', 'status', 'phone'] },
}

function CellValue({ value, col }) {
  if (value === null || value === undefined || value === '') return <span style={{ color: 'var(--a-muted)' }}>-</span>
  if (typeof value === 'boolean') {
    return value ? <span className="badge badge-green">Yes</span> : <span className="badge">No</span>
  }
  if (col === 'status') {
    const tone = String(value).toLowerCase()
    const cls = tone === 'active' ? 'badge badge-green' : tone === 'suspended' ? 'badge badge-red' : 'badge'
    return <span className={cls}>{String(value)}</span>
  }
  if (col === 'role') return <span className="badge">{String(value)}</span>
  if (col === 'quote') {
    return (
      <span
        style={{
          color: 'var(--a-muted)',
          display: 'block',
          maxWidth: 260,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    )
  }
  return String(value)
}

export default function CollectionListPage() {
  const { slug } = useParams()
  const router = useRouter()
  const meta = COLLECTION_META[slug] || { title: slug, titleField: 'id', cols: ['id'] }
  const isUsers = slug === 'users'

  const [docs, setDocs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(`${meta.titleField}:asc`)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)

  const LIMIT = 20

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getCollection(slug, { limit: LIMIT, page })
      .then((d) => {
        setDocs(d.docs || [])
        setTotal(d.totalDocs || 0)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug, page])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    setDeleting(id)
    try {
      await deleteDoc(slug, id)
      load()
    } catch (e) {
      alert(e.message)
    } finally {
      setDeleting(null)
    }
  }

  const pages = Math.ceil(total / LIMIT)

  const sortChoices = useMemo(() => {
    const fields = Array.from(new Set([meta.titleField, ...meta.cols]))
    return fields
      .map((field) => ({ value: `${field}:asc`, label: `${field} A-Z` }))
      .concat(fields.map((field) => ({ value: `${field}:desc`, label: `${field} Z-A` })))
  }, [meta.titleField, meta.cols])

  const visibleDocs = useMemo(() => {
    let next = [...docs]

    if (query.trim()) {
      const needle = query.trim().toLowerCase()
      next = next.filter((doc) => {
        const haystack = Object.values(doc)
          .flatMap((v) => (Array.isArray(v) ? v : [v]))
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(needle)
      })
    }

    const [field, direction] = sort.split(':')
    const mult = direction === 'desc' ? -1 : 1
    next.sort((a, b) => {
      const av = String(a?.[field] ?? '').toLowerCase()
      const bv = String(b?.[field] ?? '').toLowerCase()
      if (av < bv) return -1 * mult
      if (av > bv) return 1 * mult
      return 0
    })

    const needle = query.trim().toLowerCase()
    if (isUsers && !needle) return next
    return next
  }, [docs, query, sort, isUsers])

  const activeCount = isUsers ? docs.filter((doc) => String(doc.status || '').toLowerCase() === 'active').length : 0
  const adminCount = isUsers ? docs.filter((doc) => String(doc.role || '').toLowerCase() === 'admin').length : 0

  return (
    <>
      <motion.div className="admin-topbar" initial="hidden" animate="visible" variants={fadeUp}>
        <div className="topbar-title">{meta.title}</div>
        <div className="topbar-actions">
          {isUsers && (
            <Link href="/admin/users" className="btn btn-ghost btn-sm">
              User Console
            </Link>
          )}
          <span style={{ color: 'var(--a-muted)', fontSize: 12, marginRight: 8 }}>{total} total</span>
          <Link href={`/admin/collections/${slug}/create`} className="btn btn-primary btn-sm">
            {isUsers ? '+ New User' : '+ New'}
          </Link>
        </div>
      </motion.div>

      <div className="admin-content">
        {error && <div className="a-error" style={{ marginBottom: 16 }}>{error}</div>}

        <motion.div className="a-card" style={{ marginBottom: 16, padding: 16 }} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="users-toolbar">
            <input
              className="a-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${meta.title.toLowerCase()}...`}
            />
            <select className="a-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {sortChoices.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {query ? (
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setQuery('')}>
                Clear
              </button>
            ) : null}
          </div>
        </motion.div>

        {isUsers && (
          <div className="stats-grid" style={{ marginBottom: 16 }}>
            <div className="stat-card"><div className="stat-label">Accounts</div><div className="stat-value">{total}</div></div>
            <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value">{activeCount}</div></div>
            <div className="stat-card"><div className="stat-label">Admins</div><div className="stat-value">{adminCount}</div></div>
          </div>
        )}

        <motion.div className="a-card" style={{ padding: 0 }} initial="hidden" animate="visible" variants={fadeUp}>
          {loading ? (
            <div className="a-spinner" />
          ) : visibleDocs.length === 0 ? (
            <div className="a-empty">
              No {meta.title.toLowerCase()} yet.{' '}
              <Link href={`/admin/collections/${slug}/create`} style={{ color: 'var(--a-brand)' }}>Create one -&gt;</Link>
            </div>
          ) : (
            <motion.div className="a-table-wrap" variants={stagger} initial="hidden" animate="visible">
              <table className="a-table">
                <thead>
                  <tr>
                    {meta.cols.map((c) => <th key={c}>{c}</th>)}
                    <th className="col-actions" />
                  </tr>
                </thead>
                <tbody>
                  {visibleDocs.map((doc) => (
                    <motion.tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/collections/${slug}/${doc.id}`)} variants={fadeUp}>
                      {meta.cols.map((c) => (
                        <td key={c}><CellValue value={c === 'name' && !doc[c] ? doc.email : doc[c]} col={c} /></td>
                      ))}
                      <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Delete"
                          disabled={deleting === doc.id}
                          onClick={() => handleDelete(doc.id)}
                          style={{ color: 'var(--a-danger)' }}
                        >
                          {deleting === doc.id ? '...' : '×'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </motion.div>

        {pages > 1 && (
          <div className="a-pagination">
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>&lt; Prev</button>
            <span>Page {page} of {pages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next &gt;</button>
          </div>
        )}
      </div>
    </>
  )
}

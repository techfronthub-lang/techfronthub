'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createDoc, getCollection, updateDoc } from '@/src/lib/payload-api'
import { useAuth } from '@/src/components/AdminAuth'

const ROLES = ['all', 'admin', 'instructor', 'student', 'staff']
const STATUSES = ['all', 'active', 'pending', 'suspended']
const SORTS = [
  { value: 'updatedAt-desc', label: 'Recently updated' },
  { value: 'updatedAt-asc', label: 'Oldest updated' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'email-asc', label: 'Email A-Z' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function valueText(doc, field) {
  const raw = doc?.[field]
  return raw === null || raw === undefined ? '' : String(raw)
}

function badgeStyle(kind) {
  if (kind === 'active' || kind === 'admin') return { background: 'rgba(16,185,129,.12)', color: '#34d399' }
  if (kind === 'suspended') return { background: 'rgba(239,68,68,.12)', color: '#f87171' }
  if (kind === 'pending') return { background: 'rgba(251,191,36,.12)', color: '#fbbf24' }
  return { background: 'rgba(148,163,184,.12)', color: '#cbd5e1' }
}

function compareUsers(a, b, sort) {
  const [field, direction] = sort.split('-')
  const mult = direction === 'desc' ? -1 : 1

  const av = field === 'updatedAt' ? new Date(a.updatedAt || 0).getTime() : valueText(a, field).toLowerCase()
  const bv = field === 'updatedAt' ? new Date(b.updatedAt || 0).getTime() : valueText(b, field).toLowerCase()

  if (av < bv) return -1 * mult
  if (av > bv) return 1 * mult
  return 0
}

export default function UsersConsolePage() {
  const auth = useAuth()
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('updatedAt-desc')
  const [selected, setSelected] = useState([])
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [usersRes, logsRes] = await Promise.all([
        getCollection('users', { limit: 250, page: 1 }),
        getCollection('admin-activity', { limit: 15, page: 1 }),
      ])
      setUsers(usersRes.docs || [])
      setLogs(logsRes.docs || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return [...users]
      .filter((user) => {
        if (role !== 'all' && valueText(user, 'role') !== role) return false
        if (status !== 'all' && valueText(user, 'status') !== status) return false
        if (!needle) return true
        const haystack = [user.name, user.email, user.role, user.status, user.phone].filter(Boolean).join(' ').toLowerCase()
        return haystack.includes(needle)
      })
      .sort((a, b) => compareUsers(a, b, sort))
  }, [users, query, role, status, sort])

  const selectedCount = selected.length
  const allVisibleSelected = filteredUsers.length > 0 && filteredUsers.every((user) => selected.includes(user.id))

  const toggleOne = (id) => {
    setSelected((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ))
  }

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelected((current) => current.filter((id) => !filteredUsers.some((user) => user.id === id)))
      return
    }
    setSelected((current) => Array.from(new Set([...current, ...filteredUsers.map((user) => user.id)])))
  }

  const refreshLogs = async () => {
    try {
      const res = await getCollection('admin-activity', { limit: 15, page: 1 })
      setLogs(res.docs || [])
    } catch {
      // ignore log refresh errors
    }
  }

  const patchUsers = async (ids, patch, activityAction) => {
    for (const id of ids) {
      await updateDoc('users', id, patch)

      if (activityAction === 'password-reset') {
        const user = users.find((item) => item.id === id)
        await createDoc('admin-activity', {
          actor: auth?.user?.email || auth?.user?.name || 'admin',
          action: activityAction,
          targetCollection: 'users',
          targetId: String(id),
          targetLabel: user?.email || user?.name || String(id),
          note: 'Temporary password set from the admin console',
        })
      }
    }

    await Promise.all([load(), refreshLogs()])
  }

  const handleBulkStatus = async (nextStatus) => {
    if (!selectedCount) return
    setBusy(true)
    try {
      await patchUsers(selected, { status: nextStatus }, nextStatus === 'suspended' ? 'bulk-suspend' : 'bulk-activate')
      setSelected([])
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleResetPassword = async (ids = selected) => {
    const password = window.prompt('Enter a temporary password for the selected user(s):')
    if (!password) return
    if (password.length < 8) {
      alert('Use at least 8 characters.')
      return
    }

    setBusy(true)
    try {
      await patchUsers(ids, { password }, 'password-reset')
      setSelected([])
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const updateSingleStatus = async (user, nextStatus) => {
    setBusy(true)
    try {
      await updateDoc('users', user.id, { status: nextStatus })
      await Promise.all([load(), refreshLogs()])
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const total = users.length
  const active = users.filter((user) => valueText(user, 'status') === 'active').length
  const admins = users.filter((user) => valueText(user, 'role') === 'admin').length

  return (
    <>
      <motion.div className="admin-topbar" initial="hidden" animate="visible" variants={fadeUp}>
        <div>
          <div className="topbar-title">Users</div>
          <div style={{ fontSize: 12, color: 'var(--a-muted)', marginTop: 2 }}>
            Dedicated account management, bulk actions, and activity tracking
          </div>
        </div>
        <div className="topbar-actions">
          <Link href="/admin/collections/users" className="btn btn-ghost btn-sm">
            Raw collection
          </Link>
          <Link href="/admin/collections/users/create" className="btn btn-primary btn-sm">
            + New User
          </Link>
        </div>
      </motion.div>

      <div className="admin-content">
        {error && <div className="a-error" style={{ marginBottom: 16 }}>{error}</div>}

        <motion.div className="stats-grid" style={{ marginBottom: 16 }} variants={stagger} initial="hidden" animate="visible">
          <motion.div className="stat-card" variants={fadeUp}><div className="stat-label">Accounts</div><div className="stat-value">{total}</div></motion.div>
          <motion.div className="stat-card" variants={fadeUp}><div className="stat-label">Active</div><div className="stat-value">{active}</div></motion.div>
          <motion.div className="stat-card" variants={fadeUp}><div className="stat-label">Admins</div><div className="stat-value">{admins}</div></motion.div>
          <motion.div className="stat-card" variants={fadeUp}><div className="stat-label">Selected</div><div className="stat-value">{selectedCount}</div></motion.div>
        </motion.div>

        <div className="a-grid-2">
          <div>
            <motion.div className="a-card" style={{ marginBottom: 16 }} initial="hidden" animate="visible" variants={fadeUp}>
              <div className="users-toolbar">
                <input
                  className="a-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, phone or role"
                />
                <select className="a-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((value) => (
                    <option key={value} value={value}>
                      {value === 'all' ? 'All roles' : value}
                    </option>
                  ))}
                </select>
                <select className="a-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value === 'all' ? 'All statuses' : value}
                    </option>
                  ))}
                </select>
                <select className="a-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </motion.div>

            {selectedCount > 0 && (
              <motion.div className="bulk-bar" initial="hidden" animate="visible" variants={fadeUp}>
                <span>{selectedCount} selected</span>
                <div className="bulk-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleBulkStatus('active')} disabled={busy}>
                    Activate
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleBulkStatus('suspended')} disabled={busy}>
                    Suspend
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleResetPassword()} disabled={busy}>
                    Reset Password
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected([])} disabled={busy}>
                    Clear
                  </button>
                </div>
              </motion.div>
            )}

            <motion.div className="a-card" style={{ padding: 0 }} initial="hidden" animate="visible" variants={fadeUp}>
              {loading ? (
                <div className="a-spinner" />
              ) : filteredUsers.length === 0 ? (
                <div className="a-empty">No users match your filters.</div>
              ) : (
                <motion.div className="a-table-wrap" variants={stagger} initial="hidden" animate="visible">
                  <table className="a-table">
                    <thead>
                      <tr>
                        <th style={{ width: 48 }}>
                          <input
                            type="checkbox"
                            className="a-checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleAllVisible}
                          />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Phone</th>
                        <th>Updated</th>
                        <th className="col-actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <input
                              type="checkbox"
                              className="a-checkbox"
                              checked={selected.includes(user.id)}
                              onChange={() => toggleOne(user.id)}
                            />
                          </td>
                          <td>{user.name || user.email}</td>
                          <td>{user.email}</td>
                          <td><span className="pill" style={badgeStyle(user.role)}>{user.role || 'unset'}</span></td>
                          <td><span className="pill" style={badgeStyle(user.status)}>{user.status || 'unset'}</span></td>
                          <td>{user.phone || '-'}</td>
                          <td>{formatDate(user.updatedAt)}</td>
                          <td className="col-actions" style={{ whiteSpace: 'nowrap' }}>
                            <Link href={`/admin/collections/users/${user.id}`} className="btn btn-ghost btn-sm" style={{ marginRight: 8 }}>
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => updateSingleStatus(user, valueText(user, 'status') === 'suspended' ? 'active' : 'suspended')}
                              disabled={busy}
                            >
                              {valueText(user, 'status') === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </motion.div>
          </div>

          <motion.div className="a-card" initial="hidden" animate="visible" variants={fadeUp}>
            <div className="a-card-header">
              <div className="a-card-title">Audit History</div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={refreshLogs} disabled={busy}>
                Refresh
              </button>
            </div>

            <div className="audit-feed">
              {logs.length === 0 ? (
                <div className="a-empty" style={{ padding: 0 }}>No activity yet.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="audit-item">
                    <div className="audit-head">
                      <span className="pill" style={badgeStyle(log.action)}>{log.action}</span>
                      <span style={{ color: 'var(--a-muted)', fontSize: 12 }}>{formatDate(log.createdAt)}</span>
                    </div>
                    <div className="audit-title">{log.targetLabel}</div>
                    <div className="audit-meta">
                      <span>{log.actor}</span>
                      <span>-</span>
                      <span>{log.note || log.targetCollection}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

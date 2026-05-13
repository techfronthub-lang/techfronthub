'use client'

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { I } from './Icons'

const DEFAULT_SUGGESTIONS = [
  { label: 'Python', type: 'Popular search', href: '/courses?q=Python' },
  { label: 'Excel', type: 'Popular search', href: '/courses?q=Excel' },
  { label: 'Data analysis', type: 'Popular search', href: '/courses?q=Data%20analysis' },
  { label: 'Web development', type: 'Popular search', href: '/courses?q=Web%20development' },
  { label: 'AI automation', type: 'Popular search', href: '/courses?q=AI%20automation' },
]

function normalizeSuggestion(item) {
  if (!item) return null
  if (typeof item === 'string') {
    const label = item.trim()
    return label ? { label, type: 'Popular search', href: `/courses?q=${encodeURIComponent(label)}` } : null
  }
  const label = String(item.label || item.title || '').trim()
  if (!label) return null
  return {
    label,
    type: item.type || item.category || 'Course',
    href: item.href || `/courses?q=${encodeURIComponent(label)}`,
  }
}

function mergeSuggestions(...groups) {
  const seen = new Set()
  return groups.flat().map(normalizeSuggestion).filter((item) => {
    if (!item) return false
    const key = item.label.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function SearchBox({
  defaultValue = '',
  suggestions = [],
  placeholder = 'Search for anything',
  size = 'default',
  className = '',
  inputClassName = '',
}) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [remoteSuggestions, setRemoteSuggestions] = useState([])
  const [hasFetched, setHasFetched] = useState(false)
  const deferredValue = useDeferredValue(value)
  const rootRef = useRef(null)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const fetchSuggestions = () => {
    if (hasFetched) return
    setHasFetched(true)
    Promise.all([
      fetch('/api/courses?limit=24&depth=1').then((response) => response.json()).catch(() => null),
      fetch('/api/categories?limit=16').then((response) => response.json()).catch(() => null),
    ]).then(([courses, categories]) => {
      const courseItems = (courses?.docs || []).map((course) => ({
        label: course.title,
        type: course.category?.title || course.level || 'Course',
        href: `/courses?q=${encodeURIComponent(course.title || '')}`,
      }))
      const categoryItems = (categories?.docs || []).map((category) => ({
        label: category.title,
        type: 'Category',
        href: `/courses?category=${category.id}`,
      }))
      setRemoteSuggestions(mergeSuggestions(courseItems, categoryItems))
    })
  }

  const allSuggestions = useMemo(
    () => mergeSuggestions(suggestions, remoteSuggestions, DEFAULT_SUGGESTIONS),
    [suggestions, remoteSuggestions],
  )
  const filteredSuggestions = useMemo(() => {
    const term = deferredValue.trim().toLowerCase()
    if (!term) return allSuggestions.slice(0, 7)
    const matches = allSuggestions.filter((item) => item.label.toLowerCase().includes(term))
    return matches.slice(0, 7)
  }, [allSuggestions, deferredValue])

  const searchHref = `/courses?q=${encodeURIComponent(value.trim())}`
  const wrapperSize = size === 'compact' ? 'h-11' : 'min-h-14'
  const buttonSize = size === 'compact' ? 'h-8 px-4' : 'h-10 px-5'

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form action="/courses">
        <label className={`flex ${wrapperSize} items-center gap-3 rounded-full border border-[color:var(--border-soft)] bg-white px-4 shadow-[0_12px_30px_rgba(16,35,63,0.08)] transition focus-within:border-[color:var(--brand)]`}>
          <I.Search size={size === 'compact' ? 17 : 20} />
          <input
            name="q"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setOpen(true)
              fetchSuggestions()
            }}
            onFocus={() => {
              setOpen(true)
              fetchSuggestions()
            }}
            autoComplete="off"
            placeholder={placeholder}
            className={`min-w-0 flex-1 bg-transparent font-semibold text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-muted)] ${size === 'compact' ? 'text-sm' : 'text-base'} ${inputClassName}`}
          />
          <button className={`hidden rounded-full bg-[color:var(--brand)] text-sm font-extrabold text-white transition hover:bg-[color:var(--brand-strong)] sm:inline-flex sm:items-center ${buttonSize}`}>
            Search
          </button>
        </label>
      </form>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[80] overflow-hidden rounded-xl border border-[color:var(--border-soft)] bg-white shadow-[0_18px_44px_rgba(16,35,63,0.14)]">
          {value.trim() ? (
            <a href={searchHref} className="flex items-center justify-between gap-4 border-b border-[color:var(--border-soft)] px-4 py-3 text-sm hover:bg-[color:var(--brand-soft)]">
              <span className="font-extrabold text-[color:var(--text-strong)]">Search for "{value.trim()}"</span>
              <I.Arrow size={14} />
            </a>
          ) : null}
          {filteredSuggestions.length ? (
            <div className="py-2">
              {filteredSuggestions.map((item) => (
                <a key={`${item.type}-${item.label}`} href={item.href} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm hover:bg-[color:var(--brand-soft)]">
                  <span>
                    <b className="block text-[color:var(--text-strong)]">{item.label}</b>
                    <span className="text-xs font-semibold text-[color:var(--text-muted)]">{item.type}</span>
                  </span>
                  <I.Arrow size={13} />
                </a>
              ))}
            </div>
          ) : (
            <div className="px-4 py-4 text-sm font-semibold text-[color:var(--text-muted)]">No suggestions yet. Press Search to check the catalog.</div>
          )}
        </div>
      ) : null}
    </div>
  )
}

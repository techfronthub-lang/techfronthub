'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { I } from './Icons'
import { SearchBox } from './SearchBox'

const FAQS = [
  { q: 'Can I switch tracks?', a: 'Yes. Many learners start in one track and pivot once they find their focus. We support transitions within the first two weeks of cohort start.' },
  { q: 'Do I need prerequisites?', a: 'Most tracks are beginner-friendly. During onboarding we assess your background and point you to bridge resources.' },
  { q: 'How long is each track?', a: 'Cohort-based tracks run 6-16 weeks depending on the subject. Self-paced courses have no fixed timeline.' },
  { q: 'What do I get when I finish?', a: 'A portfolio of practical projects, a certificate, and access to support resources for your next move.' },
]

export function CoursesPageSkeleton() {
  return (
    <div className="bg-[#fff8f0]">
      <div className="border-b border-[#f0c89a] bg-[#ffe0bf] py-10">
        <div className="site-container">
          <div className="shimmer-block h-11 max-w-3xl rounded-full" />
          <div className="mt-6 shimmer-block h-10 w-2/3 rounded" />
        </div>
      </div>
      <div className="site-container grid gap-8 py-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="shimmer-block h-10 rounded" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => <div key={index} className="shimmer-block aspect-[4/3] rounded" />)}
        </div>
      </div>
    </div>
  )
}

export function CoursesPage({ categories = [], courses = [], siteConfig = {}, totalCourses = 0, filters = {}, options = {}, searchSuggestions = [] }) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const activeFilterCount = [filters.q, filters.category, filters.level, filters.tag, filters.format].filter(Boolean).length
  const activeCategoryTitle = categories.find((category) => String(category.id) === String(filters.category))?.title

  useEffect(() => {
    setMobileFiltersOpen(false)
  }, [filters.q, filters.category, filters.level, filters.tag, filters.format, filters.sort])

  return (
    <div className="bg-[#fff8f0]">
      <section className="border-b border-[#f0c89a] bg-[#ffe0bf] py-8 sm:py-10">
        <div className="site-container">
          <SearchBox defaultValue={filters.q || ''} suggestions={searchSuggestions} placeholder="Search for courses, skills, instructors, or topics" className="max-w-4xl" />
          <div className="mt-7">
            <h1 className="text-3xl font-extrabold text-[#3b1800] sm:text-4xl">Courses</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8c5a2a]">
              {activeCategoryTitle ? `Showing courses in ${activeCategoryTitle}${filters.level ? ` at ${filters.level} level` : ''}.` : 'Browse practical courses, compare ratings, filter by topic, and choose the path that fits your goal.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.slice(0, 8).map((category) => (
                <Link key={category.id} href={`/courses?category=${category.id}`} className={`rounded-full border px-4 py-2 text-sm font-extrabold transition ${String(filters.category) === String(category.id) ? 'border-[#c04a00] bg-[#c04a00] text-white' : 'border-[#d4a060] bg-[#fff8f0] text-[#6b3a10] hover:border-[#c04a00]'}`}>{category.title}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-8">
        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded border border-[#c04a00] px-4 text-sm font-extrabold text-[#3b1800]" onClick={() => setMobileFiltersOpen((v) => !v)}>Filters <b>{activeFilterCount}</b></button>
          <ResultCount count={courses.length} total={totalCourses} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
            <FilterPanel categories={categories} filters={filters} options={options} activeFilterCount={activeFilterCount} />
          </aside>
          <main>
            <div className="mb-5 hidden items-center justify-between gap-4 border-b border-[#f0c89a] pb-4 lg:flex">
              <div>
                <h2 className="text-2xl font-extrabold text-[#3b1800]">All courses</h2>
                <p className="mt-1 text-sm text-[#8c5a2a]">Compare course details before you enroll.</p>
              </div>
              <ResultCount count={courses.length} total={totalCourses} />
            </div>
            {activeFilterCount > 0 ? (
              <div className="mb-5 flex flex-wrap gap-2">
                {filters.q ? <ActiveChip label={`Search: ${filters.q}`} /> : null}
                {activeCategoryTitle ? <ActiveChip label={`Category: ${activeCategoryTitle}`} /> : null}
                {filters.level ? <ActiveChip label={`Level: ${filters.level}`} /> : null}
                {filters.format ? <ActiveChip label={`Format: ${filters.format}`} /> : null}
                {filters.tag ? <ActiveChip label={`Focus: ${filters.tag}`} /> : null}
                <Link href="/courses" className="rounded-full border border-[#d4a060] px-3 py-1.5 text-xs font-extrabold text-[#6b3a10] hover:border-[#c04a00]">Clear all</Link>
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
            {!courses.length ? (
              <div className="rounded border border-dashed border-[#d4a060] bg-[#ffe0bf] px-6 py-10 text-center">
                <h3 className="text-2xl font-extrabold text-[#3b1800]">No courses match that search yet</h3>
                <p className="mt-3 text-sm leading-6 text-[#8c5a2a]">Try another keyword, broaden the category, or clear some filters to see more courses.</p>
              </div>
            ) : null}
          </main>
        </div>
      </section>
      <FAQ />
      <CatalogCTA siteConfig={siteConfig} />
    </div>
  )
}

function FilterPanel({ categories, filters, options, activeFilterCount }) {
  return (
    <form method="get" action="/courses" className="sticky top-24 w-full rounded border border-[#f0c89a] bg-[#fff8f0]">
      <div className="border-b border-[#f0c89a] p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-[#3b1800]">Filters</h2>
          <span className="rounded-full bg-[#ffe0bf] px-2 py-1 text-xs font-extrabold text-[#8c5a2a]">{activeFilterCount}</span>
        </div>
      </div>
      <div className="space-y-5 p-4">
        <input type="hidden" name="q" value={filters.q || ''} readOnly />
        <SelectField label="Category" name="category" value={filters.category || ''} options={[{ label: 'All categories', value: '' }, ...categories.map((c) => ({ label: c.title, value: c.id }))]} />
        <SelectField label="Level" name="level" value={filters.level || ''} options={[{ label: 'All levels', value: '' }, ...(options.levels || []).map((l) => ({ label: l, value: l }))]} />
        <SelectField label="Format" name="format" value={filters.format || ''} options={[{ label: 'All formats', value: '' }, ...(options.formats || []).map((f) => ({ label: f, value: f }))]} />
        <SelectField label="Topic" name="tag" value={filters.tag || ''} options={[{ label: 'All topics', value: '' }, ...(options.tags || []).map((t) => ({ label: t, value: t }))]} />
        <SelectField label="Sort by" name="sort" value={filters.sort || 'newest'} options={[{ label: 'Newest first', value: 'newest' }, { label: 'Title A-Z', value: 'title' }, { label: 'Price low to high', value: 'price-low' }, { label: 'Price high to low', value: 'price-high' }]} />
      </div>
      <div className="grid gap-3 border-t border-[#f0c89a] p-4">
        <button type="submit" className="h-11 rounded bg-[#c04a00] px-4 text-sm font-extrabold text-white transition hover:bg-[#a03d00]">Apply filters</button>
        <Link href="/courses" className="inline-flex h-11 items-center justify-center rounded border border-[#c04a00] px-4 text-sm font-extrabold text-[#3b1800] transition hover:bg-[#ffe0bf]">Clear all</Link>
      </div>
    </form>
  )
}

function SelectField({ label, name, value, options }) {
  return (
    <label className="grid w-full gap-2 text-sm font-bold text-[#3b1800]">
      <span>{label}</span>
      <select name={name} defaultValue={value} className="h-11 w-full rounded border border-[#d4a060] bg-[#fff8f0] px-3 text-sm font-semibold text-[#3b1800] outline-none transition focus:border-[#c04a00]">
        {options.map((option) => (<option key={`${name}-${option.value}`} value={option.value}>{option.label}</option>))}
      </select>
    </label>
  )
}

function ResultCount({ count, total }) {
  return (
    <div className="text-right">
      <strong className="block text-xl font-extrabold text-[#3b1800]">{count}</strong>
      <span className="text-xs font-semibold text-[#a67845]">{count === 1 ? 'course found' : `of ${total || count} courses`}</span>
    </div>
  )
}

function ActiveChip({ label }) {
  return <span className="rounded-full bg-[#ffe0bf] px-3 py-1.5 text-xs font-extrabold text-[#6b3a10]">{label}</span>
}

function CourseCard({ course }) {
  const categoryTitle = course.category?.title || 'General'
  const price = formatPrice(course.price)
  const oldPrice = formatPrice(course.old)
  const thumbnail = course.thumbnail || course.category?.thumbnail || fallbackThumbnail(course)
  return (
    <Link href={`/courses/${course.slug || course.id}`} className="group block overflow-hidden rounded border border-[#f0c89a] bg-[#fff8f0] transition hover:shadow-[0_8px_22px_rgba(120,60,10,0.16)]">
      <div className="aspect-[16/9] overflow-hidden bg-[#ffe0bf]">
        <img src={thumbnail} alt={course.title || 'Course thumbnail'} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="p-3">
        <p className="truncate text-xs font-bold text-[#a67845]">{categoryTitle}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-[15px] font-extrabold leading-5 text-[#3b1800]">{course.title || 'Untitled Course'}</h3>
        <p className="mt-1 truncate text-xs text-[#a67845]">{course.code || course.tag || 'TECHFRONT HUB'}</p>
        <div className="mt-2 flex items-center gap-1 text-sm">
          <b className="text-[#c04a00]">4.7</b>
          <span className="flex text-[#ff8c42]">{Array.from({ length: 5 }).map((_, i) => <I.Star key={i} size={13} />)}</span>
          <span className="text-xs text-[#a67845]">(1,240)</span>
        </div>
        <div className="mt-2 text-xs font-semibold text-[#8c5a2a]">{course.duration || 'Flexible'} - {course.lessons || 0} lessons - {course.level || 'All levels'}</div>
        <div className="mt-2 flex items-center gap-2">
          <strong className="text-base font-extrabold text-[#3b1800]">{price}</strong>
          {oldPrice ? <small className="text-xs font-semibold text-[#a67845] line-through">{oldPrice}</small> : null}
        </div>
        {course.tag ? <span className="mt-3 inline-flex rounded-sm bg-[#ff8c42] px-2 py-1 text-[11px] font-extrabold text-[#3b1800]">{course.tag}</span> : null}
      </div>
    </Link>
  )
}

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section className="border-t border-[#f0c89a] bg-[#ffe0bf] py-10">
      <div className="site-container">
        <h2 className="text-2xl font-extrabold text-[#3b1800]">Frequently asked questions</h2>
        <div className="mt-5 divide-y divide-[#f0c89a] rounded border border-[#f0c89a] bg-[#fff8f0]">
          {FAQS.map((item, index) => (
            <div key={item.q}>
              <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-extrabold text-[#3b1800]" onClick={() => setOpen(open === index ? null : index)}>
                <span>{item.q}</span>
                <I.Chev dir={open === index ? 'up' : 'down'} size={16} />
              </button>
              {open === index ? <p className="px-5 pb-5 text-sm leading-6 text-[#8c5a2a]">{item.a}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CatalogCTA({ siteConfig }) {
  return (
    <section className="bg-[#3b1800] py-10 text-white">
      <div className="site-container flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">{siteConfig?.ctaHeadline || 'Find the right course and start learning'}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{siteConfig?.ctaBody || 'Browse the catalog, compare options, and enroll when you are ready.'}</p>
        </div>
        <Link href="/#courses" className="inline-flex h-12 shrink-0 items-center justify-center rounded bg-[#ff8c42] px-6 text-sm font-extrabold text-[#3b1800] transition hover:bg-[#ffb05c]">Back to featured courses</Link>
      </div>
    </section>
  )
}

function formatPrice(value) {
  if (!value) return 'Price unavailable'
  return String(value).replace(/ÃƒÆ'Ã‚Â¢Ãƒâ€šÃ¢â‚¬Å¡Ãƒâ€šÃ‚Â¦/g, 'N').replace(/ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¦/g, 'N')
}

function fallbackThumbnail(course) {
  const title = encodeURIComponent(course?.title || 'Course')
  return `https://placehold.co/800x450/c04a00/ffffff?text=${title}`
}

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { I } from './Icons'

const FAQS = [
  { q: 'Can I switch tracks?', a: 'Yes. Many learners start in one track and pivot once they find their focus. We support transitions within the first 2 weeks of cohort start at no extra cost.' },
  { q: 'Do I need prerequisites?', a: 'Most tracks are beginner-friendly. During onboarding we assess your background and provide bridge resources to close any gaps before the cohort begins.' },
  { q: 'Can I take multiple tracks?', a: 'Absolutely. Take them back-to-back or combine self-paced courses with a bootcamp for deeper focus. Many alumni complete two or three tracks over time.' },
  { q: 'How long is each track?', a: 'Cohort-based tracks run 6–16 weeks depending on the subject. Self-paced courses have no fixed timeline. Corporate training schedules are fully customizable.' },
  { q: 'What do I get when I finish?', a: 'A portfolio of real shipped projects, an industry-recognised certificate, and access to our hiring partner network and alumni community.' },
]

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-header anim-fade-up">
          <div className="eyebrow">Questions?</div>
          <h2>How tracks work</h2>
          <p>Everything you need to know before picking your path.</p>
        </div>
        <div className="faq-list">
          {FAQS.map((item, i) => (
            <div key={i} className={`faq-item anim-fade-up d${i + 1}${open === i ? ' faq-open' : ''}`}>
              <button className="faq-trigger" onClick={() => setOpen(open === i ? null : i)}>
                <span>{item.q}</span>
                <span className="faq-icon"><I.Chev dir={open === i ? 'up' : 'down'} size={16}/></span>
              </button>
              {open === i && <div className="faq-answer anim-fade"><p>{item.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryCardSkeleton() {
  return (
    <div className="skel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="skel skel-circle" style={{ width: 40, height: 40 }} />
        <div className="skel" style={{ width: 32, height: 12 }} />
      </div>
      <div style={{ marginTop: 18 }}>
        <div className="skel skel-line" style={{ width: '65%' }} />
        <div className="skel skel-line" style={{ width: '90%', height: 11 }} />
        <div className="skel skel-line" style={{ width: '75%', height: 11, marginBottom: 0 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.06)', marginTop: 16 }}>
        <div className="skel" style={{ width: 70, height: 11 }} />
        <div className="skel skel-circle" style={{ width: 28, height: 28 }} />
      </div>
    </div>
  )
}

export function CoursesPageSkeleton() {
  return (
    <div className="courses-page">
      <section className="courses-hero">
        <div className="container">
          <div className="hero-content">
            <div className="skel" style={{ width: 160, height: 13, margin: '0 auto 20px', borderRadius: 20 }} />
            <div className="skel" style={{ width: '55%', height: 52, margin: '0 auto 16px' }} />
            <div className="skel" style={{ width: '72%', height: 16, margin: '0 auto 8px' }} />
            <div className="skel" style={{ width: '60%', height: 16, margin: '0 auto 44px' }} />
            <div style={{ display: 'flex', gap: 60, justifyContent: 'center', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[80, 70, 90].map((w, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div className="skel" style={{ width: w, height: 32, margin: '0 auto 8px' }} />
                  <div className="skel" style={{ width: 80, height: 12, margin: '0 auto' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="browse-tracks">
        <div className="container">
          <div style={{ marginBottom: 36 }}>
            <div className="skel" style={{ width: 80, height: 12, marginBottom: 12, borderRadius: 20 }} />
            <div className="skel" style={{ width: 220, height: 36 }} />
          </div>
          <div className="catalog-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export function CoursesPage({ categories = [], courses = [], siteConfig = {}, totalCourses = 0, filters = {}, options = {} }) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const statTracks = siteConfig.statCareerTracks || categories.length
  const statCourses = siteConfig.statCourses || `${totalCourses || courses.length}+`
  const statAlumni = siteConfig.statLearners || '12,400+'
  const activeFilterCount = [filters.q, filters.category, filters.level, filters.tag, filters.format].filter(Boolean).length
  const activeCategoryTitle = categories.find(category => String(category.id) === String(filters.category))?.title

  useEffect(() => {
    setMobileFiltersOpen(false)
  }, [filters.q, filters.category, filters.level, filters.tag, filters.format, filters.sort])

  return (
    <div className="courses-page anim-fade">
      <section className="courses-hero">
        <div className="container">
          <div className="hero-content">
            <div className="eyebrow anim-fade-up">Career-focused learning</div>
            <h1 className="anim-fade-up d1">Explore courses built for real career outcomes.</h1>
            <p className="anim-fade-up d2">Browse programs across product design, development, data, AI, and digital skills. Learn at your pace, build practical projects, and earn certificates that support your next move.</p>
            <div className="hero-stats anim-fade-up d3">
              <div className="stat">
                <strong>{statTracks}</strong>
                <span>Learning categories</span>
              </div>
              <div className="stat">
                <strong>{statCourses}</strong>
                <span>Courses total</span>
              </div>
              <div className="stat">
                <strong>{statAlumni}</strong>
                <span>Alumni</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="browse-tracks">
        <div className="container">
          <div className="anim-fade-up catalog-shell">
            <div className="catalog-main catalog-main-full">
              <form className="catalog-toolbar" method="get" action="/courses">
                <div className="catalog-toolbar-head">
                  <div>
                    <div className="eyebrow">Find the right course</div>
                    <h2>Search, narrow, and compare before you enroll</h2>
                    <p>Use backend filters to refine the catalog by category, level, format, topic, or keyword before you start reviewing results.</p>
                  </div>
                  <div className="catalog-toolbar-meta">
                    <strong>{activeFilterCount}</strong>
                    <span>{activeFilterCount === 1 ? 'active filter' : 'active filters'}</span>
                  </div>
                </div>

                <div className="catalog-mobile-quickbar">
                  <label className="catalog-field catalog-field-search">
                    <span>Search</span>
                    <div className="catalog-search">
                      <span className="catalog-search-icon"><I.Search size={16} /></span>
                      <input
                        type="text"
                        name="q"
                        defaultValue={filters.q || ''}
                        placeholder="Search title, code, topic, skill..."
                      />
                    </div>
                  </label>

                  <button
                    type="button"
                    className="catalog-mobile-filter-toggle"
                    onClick={() => setMobileFiltersOpen(open => !open)}
                  >
                    <span>{mobileFiltersOpen ? 'Hide Filters' : 'More Filters'}</span>
                    <b>{activeFilterCount}</b>
                  </button>
                </div>

                <div className={`catalog-toolbar-grid${mobileFiltersOpen ? ' mobile-open' : ''}`}>
                  <label className="catalog-field catalog-field-search">
                    <span>Search</span>
                    <div className="catalog-search">
                      <span className="catalog-search-icon"><I.Search size={16} /></span>
                      <input
                        type="text"
                        name="q"
                        defaultValue={filters.q || ''}
                        placeholder="Search title, code, topic, skill..."
                      />
                    </div>
                  </label>

                  <label className="catalog-field">
                    <span>Category</span>
                    <select name="category" defaultValue={filters.category || ''} className="catalog-select">
                      <option value="">All categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.title}</option>
                      ))}
                    </select>
                  </label>

                  <label className="catalog-field">
                    <span>Level</span>
                    <select name="level" defaultValue={filters.level || ''} className="catalog-select">
                      <option value="">All levels</option>
                      {(options.levels || []).map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </label>

                  <label className="catalog-field">
                    <span>Format</span>
                    <select name="format" defaultValue={filters.format || ''} className="catalog-select">
                      <option value="">All formats</option>
                      {(options.formats || []).map(format => (
                        <option key={format} value={format}>{format}</option>
                      ))}
                    </select>
                  </label>

                  <label className="catalog-field">
                    <span>Focus</span>
                    <select name="tag" defaultValue={filters.tag || ''} className="catalog-select">
                      <option value="">All focus areas</option>
                      {(options.tags || []).map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </label>

                  <label className="catalog-field">
                    <span>Sort</span>
                    <select name="sort" defaultValue={filters.sort || 'newest'} className="catalog-select">
                      <option value="newest">Newest first</option>
                      <option value="title">Title A-Z</option>
                      <option value="price-low">Price low to high</option>
                      <option value="price-high">Price high to low</option>
                    </select>
                  </label>
                </div>

                <div className={`catalog-toolbar-actions${mobileFiltersOpen ? ' mobile-open' : ''}`}>
                  <button type="submit" className="btn btn-primary">Apply Filters</button>
                  <Link href="/courses" className="btn btn-ghost">Clear All</Link>
                </div>

                {activeFilterCount > 0 ? (
                  <div className="catalog-active-filters">
                    {filters.q ? <span className="catalog-active-chip">Search: {filters.q}</span> : null}
                    {activeCategoryTitle ? <span className="catalog-active-chip">Category: {activeCategoryTitle}</span> : null}
                    {filters.level ? <span className="catalog-active-chip">Level: {filters.level}</span> : null}
                    {filters.format ? <span className="catalog-active-chip">Format: {filters.format}</span> : null}
                    {filters.tag ? <span className="catalog-active-chip">Focus: {filters.tag}</span> : null}
                  </div>
                ) : null}
              </form>

              <div className="catalog-main-head">
                <div>
                  <div className="eyebrow">Course catalog</div>
                  <h2>Choose the course that fits your goal</h2>
                  <p>
                    {activeCategoryTitle
                      ? `Showing backend-filtered results for ${activeCategoryTitle}${filters.level ? ` at ${filters.level} level` : ''}.`
                      : 'These results are coming from the backend based on your current search and filter selections.'}
                  </p>
                </div>
                <div className="catalog-results">
                  <strong>{courses.length}</strong>
                  <span>{courses.length === 1 ? 'course found' : 'courses found'}</span>
                </div>
              </div>

              <div className="catalog-grid">
                {courses.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </div>

              {!courses.length ? (
                <div className="catalog-empty">
                  <h3>No courses match that search yet</h3>
                  <p>Try another keyword, broaden the category, or clear some filters to see more courses.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="final-cta anim-fade-up">
        <div className="container">
          <div className="eyebrow" style={{ color: 'var(--brand-200)' }}>Ready to pick your track?</div>
          <h2>Start your tech journey today.</h2>
          <p>Join 12,400+ learners who traded uncertain futures for working careers in data, engineering and AI.</p>
          <div className="btns">
            <a href="#" className="btn btn-primary btn-lg">Enroll Now <I.Arrow size={16} /></a>
            <a href="#" className="btn btn-lg" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>Contact Us</a>
          </div>
        </div>
      </section>
    </div>
  )
}

function CourseCard({ course, index }) {
  const categoryTitle = course.category?.title || 'General'
  const price = formatPrice(course.price)
  const oldPrice = formatPrice(course.old)
  const thumbnail = course.thumbnail || course.category?.thumbnail || fallbackThumbnail(course)

  return (
    <article className={`catalog-course-card anim-fade-up d${Math.min(index + 1, 8)}`}>
      <div className="catalog-course-thumb">
        <img src={thumbnail} alt={course.title || 'Course thumbnail'} />
        <div className="catalog-course-overlay" />
        <div className="catalog-course-badges">
          <span>{categoryTitle}</span>
          {course.tag ? <b>{course.tag}</b> : null}
        </div>
      </div>

      <div className="catalog-course-body">
        <div className="catalog-course-code">{course.code || 'Course'}</div>
        <h3>{course.title || 'Untitled Course'}</h3>
        <p>{course.desc || 'No description available yet.'}</p>

        <div className="catalog-course-meta">
          <span>{course.level || 'All levels'}</span>
          <span>{course.duration || 'Flexible'}</span>
          <span>{course.lessons || 0} lessons</span>
        </div>

        <div className="catalog-course-foot">
          <div className="catalog-course-price">
            {oldPrice ? <small>{oldPrice}</small> : null}
            <strong>{price}</strong>
          </div>
          <Link href={`/courses/${course.slug || course.id}`} className="catalog-course-link">
            View Course
          </Link>
        </div>
      </div>
    </article>
  )
}

function formatPrice(value) {
  if (!value) return 'Price unavailable'
  return String(value).replace(/Ã¢Â‚Â¦/g, 'N').replace(/â‚¦/g, 'N')
}

function fallbackThumbnail(course) {
  const hue = Number(course?.id || 0) * 37 % 360
  const bg = hslToHex(hue, 60, 40)
  const fg = hslToHex(hue, 75, 96)
  const title = escapeSvg(course?.title || 'Course')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${bg}"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#g)"/>
      <circle cx="640" cy="120" r="90" fill="rgba(255,255,255,0.10)"/>
      <circle cx="130" cy="410" r="120" fill="rgba(255,255,255,0.08)"/>
      <text x="56" y="220" fill="${fg}" font-family="Arial, sans-serif" font-size="28" font-weight="700">TECHFRONT HUB</text>
      <text x="56" y="272" fill="white" font-family="Arial, sans-serif" font-size="42" font-weight="700">${title}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function escapeSvg(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { I } from './Icons'
import { DEFAULT_SITE_CONFIG } from './Layout'

function formatPrice(value) {
  if (!value) return 'Price unavailable'
  return String(value).replace(/ÃƒÆ'Ã‚Â¢Ãƒâ€šÃ¢â‚¬Å¡Ãƒâ€šÃ‚Â¦/g, 'N').replace(/ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¦/g, 'N')
}

function courseHref(course) {
  return `/courses/${course?.slug || course?.id || ''}`
}

function fallbackThumbnail(course) {
  const title = encodeURIComponent(course?.title || 'Course')
  return `https://placehold.co/800x450/c04a00/ffffff?text=${title}`
}

function StarRating({ value = '4.7', count = '1,240' }) {
  return (
    <div className="mt-2 flex items-center gap-1 text-sm">
      <b className="text-[#c04a00]">{value}</b>
      <span className="flex text-[#ff8c42]">
        {Array.from({ length: 5 }).map((_, index) => (
          <I.Star key={index} size={13} />
        ))}
      </span>
      <span className="text-xs text-[#a67845]">({count})</span>
    </div>
  )
}

function SectionTitle({ eyebrow, title, body, href, linkLabel = 'Show all' }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-extrabold text-[#c04a00]">{eyebrow}</p> : null}
        <h2 className="mt-1 text-2xl font-extrabold text-[#3b1800] sm:text-3xl">{title}</h2>
        {body ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8c5a2a]">{body}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-extrabold text-[#c04a00] hover:text-[#a03d00]">
          {linkLabel} <I.Arrow size={14} />
        </Link>
      ) : null}
    </div>
  )
}

export function CourseCard({ c }) {
  const thumbnail = c.thumbnail || c.category?.thumbnail || fallbackThumbnail(c)
  return (
    <Link href={courseHref(c)} className="group block overflow-hidden rounded border border-[#f0c89a] bg-[#fff8f0] transition hover:shadow-[0_8px_22px_rgba(120,60,10,0.16)]">
      <div className="aspect-[16/9] overflow-hidden bg-[#ffe0bf]">
        <img src={thumbnail} alt={c.title || 'Course thumbnail'} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-extrabold leading-5 text-[#3b1800]">{c.title || 'Untitled Course'}</h3>
        <p className="mt-1 truncate text-xs text-[#a67845]">{c.author || c.instructor || c.category?.title || 'TECHFRONT HUB'}</p>
        <StarRating value={c.rating || '4.7'} count={c.count || c.reviews || '1,240'} />
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-[#8c5a2a]">
          <span>{c.duration || 'Flexible'}</span><span>·</span><span>{c.lessons || 0} lessons</span><span>·</span><span>{c.level || 'All levels'}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <strong className="text-base font-extrabold text-[#3b1800]">{formatPrice(c.price)}</strong>
          {c.old ? <span className="text-xs font-semibold text-[#a67845] line-through">{formatPrice(c.old)}</span> : null}
        </div>
        {c.tag ? <span className="mt-3 inline-flex rounded-sm bg-[#ff8c42] px-2 py-1 text-[11px] font-extrabold text-[#3b1800]">{c.tag}</span> : null}
      </div>
    </Link>
  )
}

export function CourseSlider({ courses, loading, siteConfig }) {
  const items = Array.isArray(courses) ? courses : []
  const title = siteConfig?.featuredCoursesHeadline || DEFAULT_SITE_CONFIG.featuredCoursesHeadline || 'Learners are viewing'
  const body = siteConfig?.featuredCoursesBody || 'Explore practical courses across software, data, design, cloud, business, and AI skills.'
  return (
    <section id="courses" className="bg-[#fff8f0] py-10 sm:py-12">
      <div className="site-container">
        <SectionTitle eyebrow="Featured courses" title={title} body={body} href="/courses" linkLabel="Browse all courses" />
        {!loading && !items.length ? <EmptyState text="No courses are published yet." /> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(loading ? Array.from({ length: 4 }) : items.slice(0, 8)).map((course, index) =>
            loading ? <CourseSkeleton key={index} /> : <CourseCard key={course.id ?? index} c={course} />,
          )}
        </div>
      </div>
    </section>
  )
}

export function Catalog({ courses = [], categories = [] }) {
  const cats = Array.isArray(categories) ? categories : []
  const countByCategory = useMemo(() => {
    const map = {}
    ;(Array.isArray(courses) ? courses : []).forEach((course) => {
      const id = course.category?.id ?? course.category
      if (id != null) map[id] = (map[id] || 0) + 1
    })
    return map
  }, [courses])
  return (
    <section className="border-y border-[#f0c89a] bg-[#ffe0bf] py-10 sm:py-12">
      <div className="site-container">
        <SectionTitle eyebrow="Explore" title="A broad selection of courses" body={`${courses?.length || 0} courses across ${cats.length || 0} learning categories.`} href="/courses" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cats.slice(0, 8).map((category) => (
            <Link key={category.id} href={`/courses?category=${category.id}`} className="rounded border border-[#f0c89a] bg-[#fff8f0] p-4 transition hover:border-[#c04a00]">
              <h3 className="font-extrabold text-[#3b1800]">{category.title}</h3>
              <p className="mt-1 text-sm text-[#8c5a2a]">{countByCategory[category.id] || 0} courses</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function UdemyGrid({ udemy, siteConfig }) {
  const items = [...(Array.isArray(udemy) ? udemy : [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const title = siteConfig?.udemyHeadline || DEFAULT_SITE_CONFIG.udemyHeadline || 'Self-paced courses, globally'
  const body = siteConfig?.udemyBody || DEFAULT_SITE_CONFIG.udemyBody
  return (
    <section id="udemy" className="bg-[#fff8f0] py-10 sm:py-12">
      <div className="site-container">
        <SectionTitle eyebrow="Also on Udemy" title={title} body={body} href="/udemy" linkLabel="Open Udemy shelf" />
        {!items.length ? <EmptyState text="No Udemy courses are published yet." /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.slice(0, 8).map((item, index) => (
              <a key={item.id ?? index} href={item.udemyUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded border border-[#f0c89a] bg-[#fff8f0] transition hover:shadow-[0_8px_22px_rgba(120,60,10,0.16)]">
                <div className="relative aspect-[16/9] overflow-hidden bg-[#ffe0bf]">
                  <img src={item.thumbnail || fallbackThumbnail(item)} alt={item.title || 'Udemy course'} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  <span className="absolute bottom-2 left-2 rounded-sm bg-[#3b1800] px-2 py-1 text-xs font-bold text-white">{item.hours}</span>
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-extrabold leading-5 text-[#3b1800]">{item.title}</h3>
                  <p className="mt-1 truncate text-xs text-[#a67845]">{item.author}</p>
                  <StarRating value={item.rating || '4.7'} count={item.count || '1,000'} />
                  <strong className="mt-2 block text-base font-extrabold text-[#3b1800]">{item.price}</strong>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function WhyUs({ siteConfig }) {
  const items = [
    { title: 'Hands-on projects', desc: 'Build practical work you can show, not just watch videos.' },
    { title: 'Cohort and self-paced options', desc: 'Choose live guidance or flexible learning depending on your schedule.' },
    { title: 'Career-ready certificates', desc: 'Finish with a structured record of the skills and projects completed.' },
  ]
  return (
    <section className="bg-[#ffe0bf] py-10 sm:py-12">
      <div className="site-container">
        <SectionTitle eyebrow={siteConfig?.whyUsEyebrow || 'Why learners choose us'} title={siteConfig?.whyUsHeadline || 'Learning built for progress'} body={siteConfig?.whyUsBody || 'The platform keeps discovery broad while still giving learners clear paths to outcomes.'} />
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="rounded border border-[#f0c89a] bg-[#fff8f0] p-5">
              <h3 className="text-lg font-extrabold text-[#3b1800]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#8c5a2a]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Categories({ categories, courses = [], siteConfig }) {
  const items = Array.isArray(categories) ? categories : []
  return (
    <section id="categories" className="bg-[#fff8f0] py-10 sm:py-12">
      <div className="site-container">
        <SectionTitle eyebrow={siteConfig?.categoriesEyebrow || 'Top categories'} title={siteConfig?.categoriesHeadline || 'Popular topics to start with'} body={siteConfig?.categoriesBody || 'A quick path into the course marketplace by career area.'} href="/courses" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map((category) => (
            <Link key={category.id} href={`/courses?category=${category.id}`} className="rounded border border-[#f0c89a] bg-[#fff8f0] p-4 transition hover:border-[#c04a00]">
              <h3 className="font-extrabold text-[#3b1800]">{category.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#8c5a2a]">{category.desc || 'Explore courses and programs in this topic.'}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Packages({ packages, siteConfig }) {
  const items = [...(Array.isArray(packages) ? packages : [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  return (
    <section id="enroll" className="border-y border-[#f0c89a] bg-[#ffe0bf] py-10 sm:py-12">
      <div className="site-container">
        <SectionTitle eyebrow={siteConfig?.packagesEyebrow || 'Learning plans'} title={siteConfig?.packagesHeadline || 'Choose how you want to learn'} body={siteConfig?.packagesBody || 'Compare self-paced, cohort, and team training options before starting.'} />
        {!items.length ? <EmptyState text="No training packages yet." /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          {items.slice(0, 3).map((item, index) => (
            <div key={item.id ?? index} className="rounded border border-[#f0c89a] bg-[#fff8f0] p-5">
              {item.badge ? <span className="rounded-sm bg-[#ff8c42] px-2 py-1 text-xs font-extrabold text-[#3b1800]">{item.badge}</span> : null}
              <h3 className="mt-4 text-xl font-extrabold text-[#3b1800]">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[#8c5a2a]">{item.desc}</p>
              <div className="mt-5 flex items-end gap-2">
                <strong className="text-2xl font-extrabold text-[#3b1800]">{item.price}</strong>
                <span className="text-sm font-semibold text-[#a67845]">{item.per}</span>
              </div>
              <a href="#courses" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded bg-[#c04a00] px-4 text-sm font-extrabold text-white transition hover:bg-[#a03d00]">Start learning</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Testimonials({ testimonials, siteConfig }) {
  const items = Array.isArray(testimonials) ? testimonials : []
  return (
    <section className="bg-[#fff8f0] py-10 sm:py-12" id="testimonials">
      <div className="site-container">
        <SectionTitle eyebrow={siteConfig?.testimonialsEyebrow || 'Learner outcomes'} title={siteConfig?.testimonialsHeadline || 'What learners are saying'} body={siteConfig?.testimonialsBody || 'Real feedback from learners using the platform.'} href="/reviews" linkLabel="Read reviews" />
        {!items.length ? <EmptyState text="No testimonials yet." /> : null}
        <div className="grid gap-4 lg:grid-cols-3">
          {items.slice(0, 3).map((item, index) => (
            <figure key={item.id ?? index} className="rounded border border-[#f0c89a] bg-[#fff8f0] p-5">
              <div className="flex text-[#ff8c42]">{Array.from({ length: 5 }).map((_, si) => <I.Star key={si} size={15} />)}</div>
              <blockquote className="mt-4 text-sm leading-7 text-[#6b3a10]">"{item.quote}"</blockquote>
              <figcaption className="mt-5 border-t border-[#f0c89a] pt-4">
                <strong className="block text-[#3b1800]">{item.name}</strong>
                <span className="text-sm text-[#a67845]">{item.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FinalCTA({ siteConfig }) {
  return (
    <section className="bg-[#3b1800] py-10 text-white sm:py-12">
      <div className="site-container flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-extrabold text-[#ff8c42]">{siteConfig?.finalCtaEyebrow || 'Ready when you are'}</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-extrabold sm:text-3xl">{siteConfig?.ctaHeadline || 'Start learning today'}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{siteConfig?.ctaBody || 'Search the catalog, pick a course, and enroll when you find the right fit.'}</p>
        </div>
        <a href="/courses" className="inline-flex h-12 shrink-0 items-center justify-center rounded bg-[#ff8c42] px-6 text-sm font-extrabold text-[#3b1800] transition hover:bg-[#ffb05c]">Explore courses <I.Arrow size={14} /></a>
      </div>
    </section>
  )
}

function EmptyState({ text }) {
  return <div className="rounded border border-dashed border-[#d4a060] bg-[#fff8f0] p-6 text-sm font-semibold text-[#a67845]">{text}</div>
}

function CourseSkeleton() {
  return (
    <div className="overflow-hidden rounded border border-[#f0c89a] bg-[#fff8f0]">
      <div className="shimmer-block aspect-[16/9]" />
      <div className="space-y-2 p-3">
        <div className="shimmer-block h-4 w-5/6 rounded" />
        <div className="shimmer-block h-3 w-1/2 rounded" />
        <div className="shimmer-block h-3 w-2/3 rounded" />
      </div>
    </div>
  )
}

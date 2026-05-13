'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { CourseCard } from '@/src/components/Sections'
import { I } from '@/src/components/Icons'
import { ActionLink, Eyebrow } from '@/src/components/public-ui'

export default function CategoryPage({ params }) {
  const [category, setCategory] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const BASE = '/api'
    const get = (path) => fetch(`${BASE}${path}`).then((response) => response.json()).catch(() => null)

    Promise.all([
      get('/categories?limit=50'),
      get('/courses?limit=100'),
    ]).then(([cats, allCourses]) => {
      const categoryId = parseInt(params.id)
      const cat = cats?.docs?.find((item) => item.id === categoryId)
      setCategory(cat)

      if (cat) {
        const categoryCourses = allCourses?.docs?.filter((course) => {
          const catId = course.category?.id || course.category
          return catId === categoryId
        }) || []
        setCourses(categoryCourses)
      }
    }).finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="bg-white">
        <section className="border-b border-slate-200 bg-[color:var(--bg-surface-strong)] py-12">
          <div className="site-container max-w-5xl">
            <div className="shimmer-block h-5 w-40 rounded" />
            <div className="mt-8 flex gap-5">
              <div className="shimmer-block h-[72px] w-[72px] rounded" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="shimmer-block h-4 w-20 rounded" />
                <div className="shimmer-block h-12 w-2/3 rounded" />
                <div className="shimmer-block h-5 w-4/5 rounded" />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="site-container py-16 text-center">
        <h2 className="text-3xl font-extrabold text-slate-950">Category not found</h2>
        <Link href="/courses" className="mt-4 inline-flex font-extrabold text-[color:var(--brand-strong)]">Back to all tracks</Link>
      </div>
    )
  }

  const Icon = I[category.icon || 'Code']

  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-[color:var(--bg-surface-strong)] py-12 sm:py-14">
        <div className="site-container max-w-5xl">
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--brand-strong)] transition hover:text-[color:var(--brand)]">
            <I.Chev dir="left" size={16} /> Back to all courses
          </Link>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row">
            <div className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded border border-slate-200 bg-white text-slate-950 shadow-[0_8px_22px_rgba(15,23,42,0.08)]" style={category.thumbnail ? { backgroundImage: `url(${category.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {!category.thumbnail && Icon ? <Icon size={28} /> : null}
            </div>
            <div className="min-w-0">
              <Eyebrow>{category.n}</Eyebrow>
              <h1 className="mt-4 text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">{category.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">{category.desc}</p>
            </div>
          </div>

          <div className="mt-8 rounded border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.06)] sm:p-6">
            <h3 className="text-2xl font-extrabold tracking-normal text-slate-950">What you will learn</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Portfolio-ready projects, practical exercises, and clear next steps for building proof of skill in this topic.
            </p>
            <div className="mt-5">
              <ActionLink href={`/courses?category=${category.id}`} variant="primary">Browse this track <I.Arrow size={14} /></ActionLink>
            </div>
          </div>
        </div>
      </section>

      {courses.length > 0 ? (
        <section className="py-10 sm:py-12">
          <div className="site-container">
            <div className="mb-6">
              <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Curriculum</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">Currently available in our catalog.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => <CourseCard key={course.id} c={course} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-slate-200 bg-[color:var(--bg-surface-strong)] py-10 sm:py-12">
        <div className="site-container">
          <div className="mb-6 text-center">
            <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Questions?</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">How tracks work</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Can I switch tracks?', 'Yes. Many learners pivot once they discover their focus.'],
              ['Prerequisites?', 'Most tracks are beginner-friendly, with bridge resources where needed.'],
              ['Multiple tracks?', 'Combine self-paced courses with bootcamps for deeper focus.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--bg-cta)] py-10 text-white">
        <div className="site-container flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#cdeaff]">Ready to start?</p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Begin your journey in {category.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Compare the courses in this track and choose the one that matches your current level.</p>
          </div>
          <ActionLink href={`/courses?category=${category.id}`} variant="primary" size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
            Browse Track <I.Arrow size={16} />
          </ActionLink>
        </div>
      </section>
    </div>
  )
}

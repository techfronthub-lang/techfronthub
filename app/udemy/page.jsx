'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { I } from '@/src/components/Icons'
import { ActionLink, PageHero } from '@/src/components/public-ui'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function fallbackThumbnail(course) {
  const title = encodeURIComponent(course?.title || 'Udemy course')
  return `https://placehold.co/800x450/1f2937/ffffff?text=${title}`
}

function StarRating({ value = '4.7', count = '1,000' }) {
  return (
    <div className="mt-2 flex items-center gap-1 text-sm">
      <b className="text-[#b4690e]">{value}</b>
      <span className="flex text-[#f69c08]">
        {Array.from({ length: 5 }).map((_, index) => <I.Star key={index} size={13} />)}
      </span>
      <span className="text-xs text-slate-500">({count})</span>
    </div>
  )
}

export default function UdemyPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetch('/api/udemy-courses?limit=100')
      .then((response) => response.json())
      .then((data) => {
        const sorted = (data.docs || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        setCourses(sorted)
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Also on Udemy"
        title="Self-paced courses, globally."
        body="Prefer learning on your own time? Browse our Udemy-style shelf and open each course externally."
        actions={
          <>
            <ActionLink href="#courses" variant="primary" size="lg">Browse Courses <I.Arrow size={16} /></ActionLink>
            <ActionLink href="/courses" variant="ghost" size="lg">View Main Catalog</ActionLink>
          </>
        }
      />

      <section id="courses" className="py-10 sm:py-12">
        <div className="site-container">
          <div className="mb-6">
            <p className="text-sm font-extrabold text-[#5624d0]">Self-paced shelf</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">Courses available through Udemy</h2>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="rounded border border-slate-200 bg-white p-3">
                  <div className="shimmer-block aspect-[16/9] rounded" />
                  <div className="mt-4 shimmer-block h-5 w-4/5 rounded" />
                  <div className="mt-3 shimmer-block h-4 w-2/5 rounded" />
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-[#f6f8fb] px-6 py-10 text-center text-sm font-semibold text-slate-500">
              No Udemy courses published yet. Check back soon.
            </div>
          ) : (
            <motion.div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={stagger} initial="hidden" animate="visible">
              {courses.map((course, index) => (
                <motion.a
                  key={course.id ?? index}
                  className="group block overflow-hidden rounded border border-slate-200 bg-white transition hover:shadow-[0_8px_22px_rgba(15,23,42,0.16)]"
                  variants={fadeUp}
                  href={course.udemyUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                    <img src={course.thumbnail || fallbackThumbnail(course)} alt={course.title || 'Udemy course'} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    <span className="absolute bottom-2 left-2 rounded-sm bg-slate-950 px-2 py-1 text-xs font-bold text-white">{course.hours}</span>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-extrabold leading-5 text-slate-950">{course.title}</h3>
                    <div className="mt-1 truncate text-xs text-slate-500">{course.author}</div>
                    <StarRating value={course.rating || '4.7'} count={course.count || '1,000'} />
                    <div className="mt-2 text-base font-extrabold text-slate-950">{course.price}</div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

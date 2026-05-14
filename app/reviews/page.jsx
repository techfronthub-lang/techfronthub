'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { I } from '@/src/components/Icons'
import { ActionLink, PageHero } from '@/src/components/public-ui'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
}

function displayText(value, fallback = '') {
  if (value == null) return fallback
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    return value.name || value.title || value.label || value.fullName || value.email || fallback
  }
  return fallback
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true)
  const [testimonials, setTestimonials] = useState([])

  useEffect(() => {
    fetch('/api/testimonials?limit=100')
      .then((response) => response.json())
      .then((data) => setTestimonials(data.docs || []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Student stories"
        title="Learner reviews and outcomes."
        body="A cleaner review page with readable stories, visible ratings, and marketplace-style proof."
        actions={
          <>
            <ActionLink href="/courses" variant="primary" size="lg">Start Learning <I.Arrow size={16} /></ActionLink>
            <ActionLink href="/programs" variant="ghost" size="lg">View Programs</ActionLink>
          </>
        }
        stats={[
          { value: `${testimonials.length || '-' }+`, label: 'Success stories' },
          { value: '4.8', label: 'Average rating' },
          { value: '87%', label: 'Placement rate' },
        ]}
      />

      <section className="py-10 sm:py-12">
        <div className="site-container">
          <div className="mb-6">
            <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Reviews</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">What learners say after taking a course</h2>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded border border-slate-200 bg-white p-5">
                  <div className="shimmer-block h-6 w-32 rounded" />
                  <div className="mt-6 shimmer-block h-5 w-full rounded" />
                  <div className="mt-3 shimmer-block h-5 w-4/5 rounded" />
                </div>
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-[color:var(--bg-surface-strong)] px-6 py-10 text-center text-sm font-semibold text-slate-500">
              No reviews yet. Check back soon.
            </div>
          ) : (
            <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="visible">
              {testimonials.map((testimonial, index) => (
                <motion.figure key={testimonial.id ?? index} className="rounded border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.06)]" variants={fadeUp}>
                  <div className="flex text-[color:var(--brand)]">
                    {Array.from({ length: 5 }).map((_, starIndex) => <I.Star key={starIndex} size={15} />)}
                  </div>
                  <blockquote className="mt-4 text-sm leading-7 text-slate-700">"{testimonial.quote}"</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4">
                    <div className="grid h-11 w-11 place-items-center rounded bg-slate-950 text-sm font-extrabold text-white">
                      {displayText(testimonial.initials, displayText(testimonial.name, 'TF').slice(0, 2).toUpperCase())}
                    </div>
                    <div>
                      <b className="block text-slate-950">{displayText(testimonial.name, 'Anonymous')}</b>
                    </div>
                  </figcaption>
                </motion.figure>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { I } from '@/src/components/Icons'
import { ActionLink, PageHero } from '@/src/components/public-ui'

function featureText(feature) {
  return typeof feature === 'string' ? feature : feature?.feature ?? ''
}

function ProgramCard({ program }) {
  const featured = !!program.featured
  const Icon = program.icon && I[program.icon] ? I[program.icon] : I.Briefcase

  return (
    <article className={`flex h-full flex-col rounded border bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.06)] ${featured ? 'border-slate-950' : 'border-slate-200'}`}>
      {program.badge ? <span className="w-fit rounded-sm bg-[color:var(--brand-soft)] px-2 py-1 text-xs font-extrabold text-[color:var(--brand-strong)]">{program.badge}</span> : null}
      <div className="mt-4 grid h-12 w-12 place-items-center rounded bg-slate-950 text-white">
        <Icon size={20} />
      </div>
      <h3 className="mt-5 text-xl font-extrabold text-slate-950">{program.name}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{program.desc}</p>
      <div className="mt-5 flex items-end gap-2">
        <strong className="text-2xl font-extrabold text-slate-950">{program.price}</strong>
        {program.per ? <span className="pb-1 text-sm font-semibold text-slate-500">{program.per}</span> : null}
      </div>
      {program.features?.length ? (
        <ul className="mt-5 space-y-2 border-t border-slate-200 pt-5 text-sm text-slate-700">
          {program.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex gap-2">
              <span className="mt-1 text-[color:var(--brand-strong)]"><I.Check size={14} /></span>
              <span>{featureText(feature)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <ActionLink href="/courses" variant={featured ? 'primary' : 'ghost'} className="mt-auto w-full">
        {featured ? 'Get started' : 'Learn more'} <I.Arrow size={14} />
      </ActionLink>
    </article>
  )
}

export default function ProgramsPage() {
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState([])

  useEffect(() => {
    fetch('/api/packages?limit=100')
      .then((response) => response.json())
      .then((data) => {
        const sorted = (data.docs || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        setPackages(sorted)
      })
      .catch(() => setPackages([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Learning Programs"
        title="Find the learning format that fits your goal."
        body="Compare bootcamps, 1-on-1 coaching, and corporate training in a cleaner marketplace format."
        actions={
          <>
            <ActionLink href="/courses" variant="primary" size="lg">Browse Courses <I.Arrow size={16} /></ActionLink>
            <ActionLink href="#programs" variant="ghost" size="lg">See Programs</ActionLink>
          </>
        }
      />

      <section id="programs" className="py-10 sm:py-12">
        <div className="site-container">
          <div className="mb-6 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] p-5">
            <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Featured promotion</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-950">TSI College AI & Automation Skills Program</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  A dedicated sales page for the TSI College promotion, with a basic info form and Paystack checkout for termly enrollment.
                </p>
              </div>
              <ActionLink href="/programs/tsi-college-ai-automation" variant="primary" size="lg">
                Open sales page <I.Arrow size={16} />
              </ActionLink>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Ways to learn</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">Choose a program type</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Pick the structure, support level, and pace that fits your schedule.</p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded border border-slate-200 bg-white p-5">
                  <div className="shimmer-block h-5 w-24 rounded" />
                  <div className="mt-6 shimmer-block h-12 w-12 rounded" />
                  <div className="mt-6 shimmer-block h-8 w-2/3 rounded" />
                  <div className="mt-4 shimmer-block h-5 w-full rounded" />
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-[color:var(--bg-surface-strong)] px-6 py-10 text-center text-sm font-semibold text-slate-500">
              No programs available yet. Check back soon.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((program) => <ProgramCard key={program.id} program={program} />)}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[color:var(--bg-cta)] py-10 text-white">
        <div className="site-container flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#cdeaff]">Ready to compare?</p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Start with the course catalog.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Every program links back to practical courses, topics, and learner outcomes.</p>
          </div>
          <ActionLink href="/courses" variant="primary" size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
            Explore Courses <I.Arrow size={16} />
          </ActionLink>
        </div>
      </section>
    </div>
  )
}

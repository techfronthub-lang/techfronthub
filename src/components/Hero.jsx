import React from 'react'
import { DEFAULT_SITE_CONFIG } from './Layout'
import { SearchBox } from './SearchBox'

const quickSearches = ['Python', 'Excel', 'Data analysis', 'Web development', 'AI automation']

export function Hero({ siteConfig }) {
  const headline = siteConfig?.heroHeadline || 'Learn practical tech skills'
  const lede =
    siteConfig?.heroLede ||
    'Practical courses, cohort programs, certificates, and self-paced lessons in one place.'

  return (
    <section className="market-hero border-b border-[color:var(--border-soft)] bg-[radial-gradient(circle_at_top_left,#dff0ff_0%,transparent_36%),linear-gradient(180deg,#ffffff_0%,#eef7ff_100%)]">
      <div className="site-container grid min-h-[520px] gap-8 py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-center lg:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[color:var(--brand-strong)]">TECHFRONT HUB marketplace</p>
          <h1 className="mt-3 font-[var(--font-display)] text-4xl font-extrabold leading-[1.05] text-[color:var(--text-strong)] sm:text-5xl lg:text-[56px]">
            {headline}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--text-body)] sm:text-lg">{lede}</p>

          <SearchBox className="mt-7 max-w-2xl" />

          <div className="mt-5 flex flex-wrap gap-2">
            {quickSearches.map((term) => (
              <a
                key={term}
                href={`/courses?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-2 text-sm font-bold text-[color:var(--text-body)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--text-strong)]"
              >
                {term}
              </a>
            ))}
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[color:var(--bg-cta)] shadow-[0_24px_70px_rgba(16,35,63,0.20)]">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
            alt="Learners studying together"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a2347] via-[#0a2347]/72 to-transparent p-6 text-white sm:p-8">
            <div className="mb-4 inline-flex rounded-sm bg-white px-3 py-1 text-xs font-extrabold uppercase text-[color:var(--brand-strong)]">
              Popular now
            </div>
            <h2 className="max-w-md text-2xl font-extrabold leading-tight">
              AI, development, design, and data skills in one place.
            </h2>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <HeroMetric value={siteConfig?.statCourses || '120+'} label="Courses" />
              <HeroMetric value={siteConfig?.statLearners || '12k+'} label="Learners" />
              <HeroMetric value={siteConfig?.statRating || '4.8'} label="Rating" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroMetric({ value, label }) {
  return (
    <div className="rounded-md bg-white/12 px-3 py-3 backdrop-blur">
      <strong className="block text-xl font-extrabold">{value}</strong>
      <span className="text-xs font-semibold text-white/75">{label}</span>
    </div>
  )
}

export function Trusted({ siteConfig }) {
  const companies = siteConfig?.trustedCompanies?.length
    ? siteConfig.trustedCompanies.map((c) => c?.name).filter(Boolean)
    : ['Nasdaq', 'Volkswagen', 'Samsung', 'Cisco', 'Eventbrite', 'NetApp']
  const label =
    siteConfig?.trustedLabel ||
    DEFAULT_SITE_CONFIG.trustedLabel ||
    'Trusted by teams and learners around the world'

  return (
    <section className="border-b border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] py-8">
      <div className="site-container">
        <p className="text-center text-sm font-bold text-[color:var(--text-body)]">{label}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {companies.slice(0, 6).map((company) => (
            <div
              key={company}
              className="grid h-14 place-items-center rounded border border-[color:var(--border-soft)] bg-white px-4 text-sm font-extrabold text-[color:var(--text-muted)]"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

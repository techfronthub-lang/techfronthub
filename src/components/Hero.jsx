import React from 'react'
import { DEFAULT_SITE_CONFIG } from './Layout'
import { SearchBox } from './SearchBox'

const quickSearches = ['Python', 'Excel', 'Data analysis', 'Web development', 'AI automation']

export function Hero({ siteConfig }) {
  const headline = siteConfig?.heroHeadline || 'Learn essential career and tech skills'
  const lede =
    siteConfig?.heroLede ||
    'Build in-demand skills with practical courses, cohort programs, certificates, and self-paced lessons taught by working instructors.'

  return (
    <section className="market-hero border-b border-[#f0c89a] bg-[radial-gradient(circle_at_top_left,#fff0d4_0%,transparent_36%),linear-gradient(180deg,#fff5ee_0%,#ffecd2_100%)]">
      <div className="site-container grid min-h-[520px] gap-8 py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-center lg:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[#c04a00]">TECHFRONT HUB marketplace</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] text-[#3b1800] sm:text-5xl lg:text-[56px]">
            {headline}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#8c5a2a] sm:text-lg">{lede}</p>

          <SearchBox className="mt-7 max-w-2xl" />

          <div className="mt-5 flex flex-wrap gap-2">
            {quickSearches.map((term) => (
              <a
                key={term}
                href={`/courses?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-[#d4a060] bg-[#ffeed8] px-4 py-2 text-sm font-bold text-[#6b3a10] transition hover:border-[#c04a00] hover:bg-[#ffe0bf]"
              >
                {term}
              </a>
            ))}
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-lg bg-[#6b3a10] shadow-[0_24px_70px_rgba(120,60,10,0.28)]">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
            alt="Learners studying together"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3b1800] via-[#3b1800]/70 to-transparent p-6 text-white sm:p-8">
            <div className="mb-4 inline-flex rounded-sm bg-[#ff8c42] px-3 py-1 text-xs font-extrabold uppercase text-[#3b1800]">
              Popular now
            </div>
            <h2 className="max-w-md text-2xl font-extrabold leading-tight">
              AI, development, design, data, and business skills in one place.
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
    <section className="border-b border-[#f0c89a] bg-[#ffeed8] py-8">
      <div className="site-container">
        <p className="text-center text-sm font-bold text-[#8c5a2a]">{label}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {companies.slice(0, 6).map((company) => (
            <div
              key={company}
              className="grid h-14 place-items-center rounded border border-[#d4a060] bg-[#fff8f0] px-4 text-sm font-extrabold text-[#a67845]"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

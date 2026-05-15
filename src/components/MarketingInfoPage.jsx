'use client'

import Link from 'next/link'

export default function MarketingInfoPage({
  eyebrow,
  title,
  lede,
  sections = [],
  primaryHref = '/courses',
  primaryLabel = 'Explore courses',
  secondaryHref = '/programs',
  secondaryLabel = 'View programs',
}) {
  return (
    <div className="bg-[radial-gradient(circle_at_top_left,#e8f4ff_0%,transparent_26%),linear-gradient(180deg,#ffffff_0%,#f7fbff_48%,#ffffff_100%)] py-12 sm:py-16">
      <div className="site-container max-w-5xl">
        <section className="overflow-hidden rounded-[28px] border border-[color:var(--border-soft)] bg-white shadow-[0_24px_60px_rgba(16,35,63,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_340px]">
            <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[color:var(--brand-strong)]">{eyebrow}</p>
              <h1 className="mt-4 max-w-3xl font-[var(--font-display)] text-3xl font-extrabold leading-tight text-[color:var(--text-strong)] sm:text-4xl lg:text-[44px]">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--text-body)]">{lede}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={primaryHref} className="inline-flex h-12 items-center justify-center rounded bg-[color:var(--brand)] px-5 text-sm font-extrabold text-white transition hover:bg-[color:var(--brand-strong)]">
                  {primaryLabel}
                </Link>
                <Link href={secondaryHref} className="inline-flex h-12 items-center justify-center rounded border border-[color:var(--border-soft)] bg-white px-5 text-sm font-extrabold text-[color:var(--text-strong)] transition hover:bg-[color:var(--brand-soft)]">
                  {secondaryLabel}
                </Link>
              </div>
            </div>
            <div className="border-t border-[color:var(--border-soft)] bg-[linear-gradient(180deg,#0a2347_0%,#0f3e77_100%)] px-6 py-8 text-white lg:border-l lg:border-t-0 lg:px-7 lg:py-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#cdeaff]">What to expect</p>
              <div className="mt-5 space-y-4">
                {sections.slice(0, 3).map((section) => (
                  <div key={section.title} className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 backdrop-blur">
                    <h2 className="text-base font-extrabold">{section.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-white/78">{section.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {sections.length > 3 ? (
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            {sections.slice(3).map((section) => (
              <article key={section.title} className="rounded-2xl border border-[color:var(--border-soft)] bg-white px-6 py-6 shadow-[var(--shadow-soft)]">
                <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-[color:var(--text-strong)]">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-body)]">{section.body}</p>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getGlobal } from '@/src/lib/payload-api'
import { I } from './Icons'
import { ActionLink } from './public-ui'
import { SearchBox } from './SearchBox'

export const DEFAULT_SITE_CONFIG = {
  topbarLocation: 'Bodija, Ibadan | Lekki, Lagos',
  topbarAnnouncement: 'New AI, data, design, and development courses are now live',
  topbarPhoneLabel: '+234 810 000 0000',
  topbarPhoneHref: 'tel:+2348100000000',
  topbarSupportLabel: 'Help',
  topbarSupportHref: '/help-center',
  topbarPartnersLabel: 'Partners',
  topbarPartnersHref: '/partner-with-us',
  headerLinks: [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: 'Programs', href: '/programs' },
    { label: 'Udemy', href: '/udemy' },
  ],
  footerHeadline:
    "Nigeria's career-focused tech academy - cohort bootcamps, 1-on-1 coaching and corporate training for the next wave of builders.",
  footerAddress: 'Bodija, Ibadan | Lekki, Lagos',
  footerEmail: 'hello@techfronthub.ng',
  footerPhone: '+234 810 000 0000',
  footerLearnTitle: 'Learn',
  footerLearnLinks: [
    { label: 'All courses', href: '/courses' },
    { label: 'Bootcamps', href: '/programs' },
    { label: 'Private lessons', href: '/private-lessons' },
    { label: 'Tech for kids', href: '/tech-for-kids' },
    { label: 'Student login', href: '/login' },
  ],
  footerBusinessTitle: 'Business',
  footerBusinessLinks: [
    { label: 'Corporate training', href: '/corporate-training' },
    { label: 'Team assessments', href: '/team-assessments' },
    { label: 'Partner with us', href: '/partner-with-us' },
    { label: 'Hire our graduates', href: '/hire-graduates' },
  ],
  footerResourcesTitle: 'Resources',
  footerResourcesLinks: [
    { label: 'Course catalog', href: '/courses' },
    { label: 'Blog', href: '/blog' },
    { label: 'Free mini-courses', href: '/udemy' },
    { label: 'Templates & guides', href: '/templates' },
    { label: 'Help center', href: '/help-center' },
  ],
  footerSocialLinks: [
    { platform: 'Facebook', href: 'https://facebook.com' },
    { platform: 'X', href: 'https://x.com' },
    { platform: 'Instagram', href: 'https://instagram.com' },
    { platform: 'LinkedIn', href: 'https://linkedin.com' },
    { platform: 'YouTube', href: 'https://youtube.com' },
  ],
  footerNewsletterTitle: 'Newsletter',
  footerNewsletterBody: 'Monthly digest of new cohorts, free workshops and scholarship slots.',
  footerNewsletterPlaceholder: 'you@work.com',
  footerNewsletterButton: 'Join',
  footerNewsletterNote: 'We never share your email. Unsubscribe anytime.',
  footerCopyright: '(c) 2026 TECHFRONT HUB. RC 1234567. All rights reserved.',
  footerLegalLinks: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
  trustedLabel: 'Trusted by teams and learners from',
  featuredCoursesEyebrow: 'Featured courses',
  featuredCoursesHeadline: 'Cohorts shipping this quarter',
  featuredCoursesBody:
    'Hand-picked programs starting in the next 8 weeks. Each cohort is capped at 30 learners to keep instruction tight.',
  udemyEyebrow: 'Also on Udemy',
  udemyHeadline: 'Self-paced courses, globally',
  udemyBody:
    'Prefer learning on your own time? Our instructors also publish on Udemy - grab a course and keep lifetime access.',
  whyUsEyebrow: 'Why TECHFRONT HUB',
  whyUsHeadline: 'Built for outcomes, not just completion.',
  whyUsBody:
    "We're measured by what our learners go on to do - promotions, placements, and products shipped.",
  categoriesEyebrow: 'Course categories',
  categoriesHeadline: 'Pick a track, ship real work.',
  categoriesBody: 'Each category maps to a career outcome, not just a topic list.',
  packagesEyebrow: 'Training packages',
  packagesHeadline: 'Ways to learn with us.',
  packagesBody:
    'From cohort-based bootcamps to full-team corporate programs - pick the format that fits your goal.',
  testimonialsEyebrow: 'Student stories',
  testimonialsHeadline: 'Careers built in months, not years.',
  testimonialsBody: 'A few alumni, in their own words.',
  finalCtaEyebrow: 'Ready when you are',
  finalCtaSecondaryLabel: 'Contact Us',
  finalCtaSecondaryHref: '/contact',
}

const HIDDEN_NAV_HREFS = new Set(['/reviews', '/review', '/sales'])

function isExternalHref(href = '') {
  return /^(https?:|mailto:|tel:)/i.test(href)
}

function SmartLink({ href, children, ...props }) {
  if (!href || href === '#') {
    return <a href="#" {...props}>{children}</a>
  }

  if (isExternalHref(href)) {
    return <a href={href} {...props}>{children}</a>
  }

  return <Link href={href} {...props}>{children}</Link>
}

function normalizeConfig(siteConfig) {
  const headerLinksSource = siteConfig?.headerLinks?.length ? siteConfig.headerLinks : DEFAULT_SITE_CONFIG.headerLinks
  const headerLinks = Array.isArray(headerLinksSource) ? [...headerLinksSource] : []

  if (!headerLinks.some((item) => item?.href === '/blog')) {
    headerLinks.push({ label: 'Blog', href: '/blog' })
  }

  return {
    ...DEFAULT_SITE_CONFIG,
    ...(siteConfig || {}),
    headerLinks: headerLinks.filter((item) => !HIDDEN_NAV_HREFS.has(item?.href)),
    footerLearnLinks: siteConfig?.footerLearnLinks?.length ? siteConfig.footerLearnLinks : DEFAULT_SITE_CONFIG.footerLearnLinks,
    footerBusinessLinks: siteConfig?.footerBusinessLinks?.length ? siteConfig.footerBusinessLinks : DEFAULT_SITE_CONFIG.footerBusinessLinks,
    footerResourcesLinks: siteConfig?.footerResourcesLinks?.length ? siteConfig.footerResourcesLinks : DEFAULT_SITE_CONFIG.footerResourcesLinks,
    footerSocialLinks: siteConfig?.footerSocialLinks?.length ? siteConfig.footerSocialLinks : DEFAULT_SITE_CONFIG.footerSocialLinks,
    footerLegalLinks: siteConfig?.footerLegalLinks?.length ? siteConfig.footerLegalLinks : DEFAULT_SITE_CONFIG.footerLegalLinks,
  }
}

function socialIcon(platform) {
  switch ((platform || '').toLowerCase()) {
    case 'facebook':
      return <I.FB />
    case 'x':
    case 'twitter':
      return <I.TW />
    case 'instagram':
      return <I.IG />
    case 'linkedin':
      return <I.IN />
    case 'youtube':
      return <I.YT />
    default:
      return <I.ArrowUpRight size={14} />
  }
}

export function TopBar({ siteConfig }) {
  const config = normalizeConfig(siteConfig)

  return (
    <div className="border-b border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)]">
      <div className="site-container flex min-h-8 flex-col gap-1.5 py-2 text-[11px] leading-5 text-[color:var(--text-body)] sm:flex-row sm:items-center sm:justify-between sm:py-0 sm:text-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-3">
          <span>{config.topbarLocation}</span>
          <span className="hidden text-[color:var(--text-muted)] sm:inline">|</span>
          <span className="font-semibold text-[color:var(--brand-strong)]">{config.topbarAnnouncement}</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-4">
          <a href={config.topbarPhoneHref || '#'} className="inline-flex items-center gap-1.5 transition hover:text-[color:var(--text-strong)]"><I.Phone size={12} /> {config.topbarPhoneLabel}</a>
          <SmartLink href={config.topbarSupportHref} className="transition hover:text-[color:var(--text-strong)]">{config.topbarSupportLabel}</SmartLink>
          <SmartLink href={config.topbarPartnersHref} className="transition hover:text-[color:var(--text-strong)]">{config.topbarPartnersLabel}</SmartLink>
        </div>
      </div>
    </div>
  )
}

export function Header({ siteConfig }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const pathname = usePathname()
  const config = normalizeConfig(siteConfig)

  const checkAuth = React.useCallback(() => {
    const token = localStorage.getItem('payload-token')
    setIsAuthenticated(!!token)
  }, [])

  React.useEffect(() => {
    checkAuth()
  }, [pathname, checkAuth])

  React.useEffect(() => {
    document.body.classList.toggle('menu-open', isMenuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [isMenuOpen])

  const close = () => setIsMenuOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('payload-token')
    localStorage.removeItem('user-email')
    setIsAuthenticated(false)
    close()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border-soft)] bg-white/92 backdrop-blur">
      <div className="site-container flex min-h-[64px] items-center gap-3 py-2 lg:gap-4 lg:py-0">
        <Link href="/" className="inline-flex items-center gap-2 text-[color:var(--text-strong)]" aria-label="TECHFRONT HUB">
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded bg-[color:var(--brand)] text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(11,132,223,0.22)]">
            TF
          </span>
          <span className="text-sm font-extrabold tracking-normal sm:text-base">TECHFRONT<span className="text-[color:var(--brand)]">.</span>HUB</span>
        </Link>

        <SearchBox size="compact" className="hidden min-w-0 flex-1 lg:block" />

        <nav className={`${isMenuOpen ? 'fixed inset-x-4 top-[76px] z-40 flex max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-[color:var(--border-soft)] bg-white p-4 shadow-[0_18px_50px_rgba(16,35,63,0.14)] sm:top-[86px] lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none' : 'hidden'} lg:flex lg:items-center lg:justify-center`}>
          {!isAuthenticated ? (
            <div className="flex w-full flex-col gap-1 lg:w-auto lg:flex-row lg:items-center lg:justify-center">
            {config.headerLinks.map((link) => (
              <SmartLink key={`${link.label}-${link.href}`} href={link.href} onClick={close} className="rounded px-3 py-3 text-sm font-bold text-[color:var(--text-body)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--text-strong)] lg:py-2">
                {link.label}
              </SmartLink>
            ))}
            <div className="mt-3 grid gap-2 lg:hidden">
              <ActionLink href="/student/register" variant="primary" size="sm" className="w-full" onClick={close}>Sign up</ActionLink>
              <ActionLink href="/login" variant="ghost" size="sm" className="w-full" onClick={close}>Login</ActionLink>
            </div>
          </div>
          ) : (
            <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-center">
              <Link href="/student/dashboard" onClick={close} className="rounded px-4 py-3 text-sm font-bold text-[color:var(--text-body)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--text-strong)] lg:px-3 lg:py-2">Dashboard</Link>
              <Link href="/student/dashboard/courses" onClick={close} className="rounded px-4 py-3 text-sm font-bold text-[color:var(--text-body)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--text-strong)] lg:px-3 lg:py-2">My Courses</Link>
              <Link href="/courses" onClick={close} className="rounded px-4 py-3 text-sm font-bold text-[color:var(--text-body)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--text-strong)] lg:px-3 lg:py-2">Explore</Link>
              <div className="mt-3 lg:hidden">
                <button onClick={handleLogout} className="inline-flex h-11 w-full items-center justify-center rounded border border-[color:var(--border-soft)] bg-white px-4 text-sm font-bold text-[color:var(--text-strong)] transition hover:bg-[color:var(--brand-soft)]">Logout</button>
              </div>
            </div>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!isAuthenticated && (
            <>
              <SmartLink href="/login" className="hidden h-10 items-center rounded border border-[color:var(--border-soft)] bg-white px-4 text-sm font-extrabold text-[color:var(--text-strong)] transition hover:bg-[color:var(--brand-soft)] lg:inline-flex">Log in</SmartLink>
              <SmartLink href="/student/register" className="hidden h-10 items-center rounded bg-[color:var(--brand)] px-4 text-sm font-extrabold text-white transition hover:bg-[color:var(--brand-strong)] sm:inline-flex">Sign up</SmartLink>
            </>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="hidden h-10 rounded border border-[color:var(--border-soft)] bg-white px-4 text-sm font-extrabold text-[color:var(--text-strong)] transition hover:bg-[color:var(--brand-soft)] lg:inline-flex lg:items-center lg:justify-center">Logout</button>
          )}
          <button className="inline-flex h-10 w-10 items-center justify-center rounded border border-[color:var(--border-soft)] bg-white text-[color:var(--text-strong)] transition hover:bg-[color:var(--brand-soft)] lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
            {isMenuOpen ? <I.X size={24} /> : <I.Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export function Footer({ siteConfig }) {
  const config = normalizeConfig(siteConfig)

  return (
    <footer className="border-t border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)]">
      <div className="site-container py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))] xl:gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-[color:var(--text-strong)]">
              <span className="grid h-10 w-10 place-items-center rounded bg-[color:var(--brand)] text-sm font-extrabold text-white">TF</span>
              <span className="text-sm font-extrabold tracking-normal sm:text-base">TECHFRONT<span className="text-[color:var(--brand)]">.</span>HUB</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-[color:var(--text-body)]">{config.footerHeadline}</p>
            <div className="mt-6 flex flex-col gap-3 text-sm font-semibold text-[color:var(--text-body)]">
              <span className="inline-flex items-center gap-2"><I.MapPin size={14} /> {config.footerAddress}</span>
              <a href={`mailto:${config.footerEmail}`} className="inline-flex items-center gap-2 transition hover:text-[color:var(--text-strong)]">
                <I.Mail size={14} /> {config.footerEmail}
              </a>
              <a href={`tel:${String(config.footerPhone || '').replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 transition hover:text-[color:var(--text-strong)]">
                <I.Phone size={14} /> {config.footerPhone}
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {config.footerSocialLinks.map((item) => (
                <SmartLink key={`${item.platform}-${item.href}`} href={item.href} aria-label={item.platform} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded border border-[color:var(--border-soft)] bg-white text-[color:var(--text-body)] transition hover:border-[color:var(--border-strong)] hover:text-[color:var(--brand-strong)]">
                  {socialIcon(item.platform)}
                </SmartLink>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-extrabold uppercase text-[color:var(--text-strong)]">{config.footerLearnTitle}</h5>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[color:var(--text-body)]">
              {config.footerLearnLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}><SmartLink href={item.href} className="transition hover:text-[color:var(--text-strong)]">{item.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-extrabold uppercase text-[color:var(--text-strong)]">{config.footerBusinessTitle}</h5>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[color:var(--text-body)]">
              {config.footerBusinessLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}><SmartLink href={item.href} className="transition hover:text-[color:var(--text-strong)]">{item.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-extrabold uppercase text-[color:var(--text-strong)]">{config.footerResourcesTitle}</h5>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[color:var(--text-body)]">
              {config.footerResourcesLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}><SmartLink href={item.href} className="transition hover:text-[color:var(--text-strong)]">{item.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-extrabold uppercase text-[color:var(--text-strong)]">{config.footerNewsletterTitle}</h5>
            <p className="mt-5 text-sm leading-6 text-[color:var(--text-body)]">{config.footerNewsletterBody}</p>
            <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); alert('Subscribed - check your inbox.') }}>
              <input type="email" placeholder={config.footerNewsletterPlaceholder} required className="h-11 flex-1 rounded border border-[color:var(--border-soft)] bg-white px-4 text-sm font-semibold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--brand)]" />
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded bg-[color:var(--brand)] px-5 text-sm font-extrabold text-white transition hover:bg-[color:var(--brand-strong)]">{config.footerNewsletterButton}</button>
            </form>
            <div className="mt-3 text-xs font-semibold text-[color:var(--text-muted)]">{config.footerNewsletterNote}</div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[color:var(--border-soft)] pt-6 text-sm font-semibold text-[color:var(--text-muted)] lg:flex-row lg:items-center lg:justify-between">
          <div>{config.footerCopyright}</div>
          <div className="flex flex-wrap gap-4">
            {config.footerLegalLinks.map((item) => (
              <SmartLink key={`${item.label}-${item.href}`} href={item.href} className="transition hover:text-[color:var(--text-strong)]">{item.label}</SmartLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export async function loadSiteConfig() {
  try {
    const result = await getGlobal('site-config')
    return result?.doc || result || {}
  } catch {
    return {}
  }
}

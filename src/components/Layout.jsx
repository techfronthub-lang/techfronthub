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
    { label: 'Reviews', href: '/reviews' },
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
  return {
    ...DEFAULT_SITE_CONFIG,
    ...(siteConfig || {}),
    headerLinks: siteConfig?.headerLinks?.length ? siteConfig.headerLinks : DEFAULT_SITE_CONFIG.headerLinks,
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
    <div className="border-b border-[#f0c89a] bg-[#ffeed8]">
      <div className="site-container flex min-h-8 flex-col gap-1.5 py-2 text-[11px] leading-5 text-[#8c5a2a] sm:flex-row sm:items-center sm:justify-between sm:py-0 sm:text-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-3">
          <span>{config.topbarLocation}</span>
          <span className="hidden text-[#d4a060] sm:inline">|</span>
          <span className="font-semibold text-[#c04a00]">{config.topbarAnnouncement}</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-4">
          <a href={config.topbarPhoneHref || '#'} className="inline-flex items-center gap-1.5 transition hover:text-[#3b1800]"><I.Phone size={12} /> {config.topbarPhoneLabel}</a>
          <SmartLink href={config.topbarSupportHref} className="transition hover:text-[#3b1800]">{config.topbarSupportLabel}</SmartLink>
          <SmartLink href={config.topbarPartnersHref} className="transition hover:text-[#3b1800]">{config.topbarPartnersLabel}</SmartLink>
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
    <header className="sticky top-0 z-50 border-b border-[#f0c89a] bg-[#fff8f0]/95 backdrop-blur">
      <div className="site-container flex min-h-[64px] items-center gap-3 py-2 lg:gap-4 lg:py-0">
        <Link href="/" className="inline-flex items-center gap-2 text-[#3b1800]" aria-label="TECHFRONT HUB">
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded bg-[#c04a00] text-sm font-extrabold text-white">
            TF
          </span>
          <span className="text-sm font-extrabold tracking-normal sm:text-base">TECHFRONT<span className="text-[#d4600a]">.</span>HUB</span>
        </Link>

        <SearchBox size="compact" className="hidden min-w-0 flex-1 lg:block" />

        <nav className={`${isMenuOpen ? 'fixed inset-x-4 top-[76px] z-40 flex max-h-[calc(100vh-6rem)] overflow-y-auto rounded border border-[#f0c89a] bg-[#fff8f0] p-4 shadow-[0_18px_50px_rgba(120,60,10,0.16)] sm:top-[86px] lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none' : 'hidden'} lg:flex lg:items-center lg:justify-center`}>
          {!isAuthenticated ? (
            <div className="flex w-full flex-col gap-1 lg:w-auto lg:flex-row lg:items-center lg:justify-center">
            {config.headerLinks.map((link) => (
              <SmartLink key={`${link.label}-${link.href}`} href={link.href} onClick={close} className="rounded px-3 py-3 text-sm font-bold text-[#6b3a10] transition hover:bg-[#ffe0bf] hover:text-[#3b1800] lg:py-2">
                {link.label}
              </SmartLink>
            ))}
            <div className="mt-3 lg:hidden">
              <ActionLink href="/login" variant="ghost" size="sm" className="w-full" onClick={close}>Login</ActionLink>
            </div>
          </div>
          ) : (
            <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-center">
              <Link href="/student/dashboard" onClick={close} className="rounded px-4 py-3 text-sm font-bold text-[#6b3a10] transition hover:bg-[#ffe0bf] hover:text-[#3b1800] lg:px-3 lg:py-2">Dashboard</Link>
              <Link href="/student/dashboard/courses" onClick={close} className="rounded px-4 py-3 text-sm font-bold text-[#6b3a10] transition hover:bg-[#ffe0bf] hover:text-[#3b1800] lg:px-3 lg:py-2">My Courses</Link>
              <Link href="/courses" onClick={close} className="rounded px-4 py-3 text-sm font-bold text-[#6b3a10] transition hover:bg-[#ffe0bf] hover:text-[#3b1800] lg:px-3 lg:py-2">Explore</Link>
              <div className="mt-3 lg:hidden">
                <button onClick={handleLogout} className="inline-flex h-11 w-full items-center justify-center rounded border border-[#d4a060] bg-[#ffeed8] px-4 text-sm font-bold text-[#6b3a10] transition hover:bg-[#ffe0bf]">Logout</button>
              </div>
            </div>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!isAuthenticated && (
            <>
              <SmartLink href="/login" className="hidden h-10 items-center rounded border border-[#d4a060] bg-[#ffeed8] px-4 text-sm font-extrabold text-[#6b3a10] transition hover:bg-[#ffe0bf] lg:inline-flex">Log in</SmartLink>
              <SmartLink href="/#enroll" className="hidden h-10 items-center rounded bg-[#c04a00] px-4 text-sm font-extrabold text-white transition hover:bg-[#a03d00] sm:inline-flex">Sign up</SmartLink>
            </>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="hidden h-10 rounded border border-[#d4a060] bg-[#ffeed8] px-4 text-sm font-extrabold text-[#6b3a10] transition hover:bg-[#ffe0bf] lg:inline-flex lg:items-center lg:justify-center">Logout</button>
          )}
          <button className="inline-flex h-10 w-10 items-center justify-center rounded border border-[#d4a060] bg-[#ffeed8] text-[#6b3a10] transition hover:bg-[#ffe0bf] lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
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
    <footer className="border-t border-[#f0c89a] bg-[#ffeed8]">
      <div className="site-container py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))] xl:gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-[#3b1800]">
              <span className="grid h-10 w-10 place-items-center rounded bg-[#c04a00] text-sm font-extrabold text-white">TF</span>
              <span className="text-sm font-extrabold tracking-normal sm:text-base">TECHFRONT<span className="text-[#d4600a]">.</span>HUB</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#8c5a2a]">{config.footerHeadline}</p>
            <div className="mt-6 flex flex-col gap-3 text-sm font-semibold text-[#8c5a2a]">
              <span className="inline-flex items-center gap-2"><I.MapPin size={14} /> {config.footerAddress}</span>
              <a href={`mailto:${config.footerEmail}`} className="inline-flex items-center gap-2 transition hover:text-[#3b1800]">
                <I.Mail size={14} /> {config.footerEmail}
              </a>
              <a href={`tel:${String(config.footerPhone || '').replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 transition hover:text-[#3b1800]">
                <I.Phone size={14} /> {config.footerPhone}
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {config.footerSocialLinks.map((item) => (
                <SmartLink key={`${item.platform}-${item.href}`} href={item.href} aria-label={item.platform} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded border border-[#d4a060] bg-[#fff8f0] text-[#8c5a2a] transition hover:border-[#c04a00] hover:text-[#3b1800]">
                  {socialIcon(item.platform)}
                </SmartLink>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-extrabold uppercase text-[#3b1800]">{config.footerLearnTitle}</h5>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[#8c5a2a]">
              {config.footerLearnLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}><SmartLink href={item.href} className="transition hover:text-[#3b1800]">{item.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-extrabold uppercase text-[#3b1800]">{config.footerBusinessTitle}</h5>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[#8c5a2a]">
              {config.footerBusinessLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}><SmartLink href={item.href} className="transition hover:text-[#3b1800]">{item.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-extrabold uppercase text-[#3b1800]">{config.footerResourcesTitle}</h5>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[#8c5a2a]">
              {config.footerResourcesLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}><SmartLink href={item.href} className="transition hover:text-[#3b1800]">{item.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-extrabold uppercase text-[#3b1800]">{config.footerNewsletterTitle}</h5>
            <p className="mt-5 text-sm leading-6 text-[#8c5a2a]">{config.footerNewsletterBody}</p>
            <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); alert('Subscribed - check your inbox.') }}>
              <input type="email" placeholder={config.footerNewsletterPlaceholder} required className="h-11 flex-1 rounded border border-[#d4a060] bg-[#fff8f0] px-4 text-sm font-semibold text-[#3b1800] outline-none transition focus:border-[#c04a00]" />
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded bg-[#c04a00] px-5 text-sm font-extrabold text-white transition hover:bg-[#a03d00]">{config.footerNewsletterButton}</button>
            </form>
            <div className="mt-3 text-xs font-semibold text-[#a67845]">{config.footerNewsletterNote}</div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#f0c89a] pt-6 text-sm font-semibold text-[#a67845] lg:flex-row lg:items-center lg:justify-between">
          <div>{config.footerCopyright}</div>
          <div className="flex flex-wrap gap-4">
            {config.footerLegalLinks.map((item) => (
              <SmartLink key={`${item.label}-${item.href}`} href={item.href} className="transition hover:text-[#3b1800]">{item.label}</SmartLink>
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

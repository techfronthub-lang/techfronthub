'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getGlobal } from '@/src/lib/payload-api'
import { I } from './Icons'

export const DEFAULT_SITE_CONFIG = {
  topbarLocation: 'Bodija, Ibadan | Lekki, Lagos',
  topbarAnnouncement: 'New AI cohort starts June 3 - limited seats',
  topbarPhoneLabel: '+234 810 000 0000',
  topbarPhoneHref: 'tel:+2348100000000',
  topbarSupportLabel: 'Support',
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
    <div className="topbar">
      <div className="container">
        <div className="left">
          <span>{config.topbarLocation}</span>
          <span className="sep">|</span>
          <span>{config.topbarAnnouncement}</span>
        </div>
        <div className="right">
          <a href={config.topbarPhoneHref || '#'}><I.Phone size={12} /> {config.topbarPhoneLabel}</a>
          <SmartLink href={config.topbarSupportHref}>{config.topbarSupportLabel}</SmartLink>
          <SmartLink href={config.topbarPartnersHref}>{config.topbarPartnersLabel}</SmartLink>
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

  const close = () => setIsMenuOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('payload-token')
    localStorage.removeItem('user-email')
    setIsAuthenticated(false)
    close()
    window.location.href = '/'
  }

  return (
    <header className={`header${isMenuOpen ? ' menu-is-open' : ''}`}>
      <div className="container">
        <Link href="/" className="brand" aria-label="TECHFRONT HUB">
          <span className="brand-mark">TF</span>
          <span className="brand-name">TECHFRONT<span className="dot">.</span>HUB</span>
        </Link>

        {!isAuthenticated && (
          <nav className={`nav ${isMenuOpen ? 'mobile-open' : ''}`}>
            {config.headerLinks.map((link) => (
              <SmartLink key={`${link.label}-${link.href}`} href={link.href} onClick={close}>
                {link.label}
              </SmartLink>
            ))}
            <div className="mobile-only-cta">
              <Link href="/login" className="btn btn-ghost btn-sm" onClick={close}>Login</Link>
            </div>
          </nav>
        )}

        {isAuthenticated && (
          <nav className={`nav ${isMenuOpen ? 'mobile-open' : ''}`}>
            <Link href="/student/dashboard" onClick={close}>Dashboard</Link>
            <Link href="/student/dashboard/courses" onClick={close}>My Courses</Link>
            <Link href="/courses" onClick={close}>Explore</Link>
            <div className="mobile-only-cta">
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </div>
          </nav>
        )}

        <div className="header-cta">
          {!isAuthenticated && (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm hide-mobile">Login</Link>
              <a href="/#enroll" className="btn btn-primary btn-sm">Enroll Now <I.Arrow size={14} /></a>
            </>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="btn btn-ghost btn-sm hide-mobile">Logout</button>
          )}
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
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
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand" style={{ color: '#fff' }}>
              <span className="brand-mark">TF</span>
              <span className="brand-name">TECHFRONT<span className="dot">.</span>HUB</span>
            </Link>
            <p className="about-copy">{config.footerHeadline}</p>
            <div className="footer-contact" style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><I.MapPin size={14} /> {config.footerAddress}</span>
              <a href={`mailto:${config.footerEmail}`} style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                <I.Mail size={14} /> {config.footerEmail}
              </a>
              <a href={`tel:${String(config.footerPhone || '').replace(/[^+\d]/g, '')}`} style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                <I.Phone size={14} /> {config.footerPhone}
              </a>
            </div>
            <div className="socials">
              {config.footerSocialLinks.map((item) => (
                <SmartLink key={`${item.platform}-${item.href}`} href={item.href} aria-label={item.platform} target="_blank" rel="noreferrer">
                  {socialIcon(item.platform)}
                </SmartLink>
              ))}
            </div>
          </div>

          <div>
            <h5>{config.footerLearnTitle}</h5>
            <ul>
              {config.footerLearnLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}><SmartLink href={item.href}>{item.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h5>{config.footerBusinessTitle}</h5>
            <ul>
              {config.footerBusinessLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}><SmartLink href={item.href}>{item.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h5>{config.footerResourcesTitle}</h5>
            <ul>
              {config.footerResourcesLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}><SmartLink href={item.href}>{item.label}</SmartLink></li>
              ))}
            </ul>
          </div>

          <div>
            <h5>{config.footerNewsletterTitle}</h5>
            <p style={{ fontSize: 13, margin: '0 0 12px', color: '#9ca3af' }}>{config.footerNewsletterBody}</p>
            <form className="newsletter" onSubmit={(e) => { e.preventDefault(); alert('Subscribed - check your inbox.') }}>
              <input type="email" placeholder={config.footerNewsletterPlaceholder} required />
              <button type="submit" className="btn btn-primary btn-sm">{config.footerNewsletterButton}</button>
            </form>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 10 }}>{config.footerNewsletterNote}</div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>{config.footerCopyright}</div>
          <div className="links">
            {config.footerLegalLinks.map((item) => (
              <SmartLink key={`${item.label}-${item.href}`} href={item.href}>{item.label}</SmartLink>
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

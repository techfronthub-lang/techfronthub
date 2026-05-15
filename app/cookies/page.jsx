'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Essential usage', body: 'Cookies and local storage can be used to support sign-in state, navigation continuity, and core platform behavior.' },
  { title: 'Analytics and experience', body: 'Over time, usage signals may also support platform improvement and user experience decisions.' },
  { title: 'More detail coming', body: 'A more formal cookie notice can be expanded here as tracking and consent requirements evolve.' },
]

export default function CookiesPage() {
  return (
    <MarketingInfoPage
      eyebrow="Cookies"
      title="How session and experience data may be used on the platform"
      lede="This page exists so visitors do not hit a dead route while the fuller cookie notice is being formalized."
      sections={sections}
      primaryHref="/privacy"
      primaryLabel="Privacy policy"
      secondaryHref="/terms"
      secondaryLabel="Terms"
    />
  )
}

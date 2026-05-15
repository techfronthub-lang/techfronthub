'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Institution partnerships', body: 'Collaborate on training delivery, curriculum support, or student upskilling initiatives.' },
  { title: 'Community events', body: 'Bring TECHFRONT HUB into workshops, conferences, school programs, and industry meetups.' },
  { title: 'Brand-aligned training', body: 'We shape engagements around the goals, audience, and reputation standards of the partner.' },
]

export default function PartnerWithUsPage() {
  return (
    <MarketingInfoPage
      eyebrow="Partnerships"
      title="Partner with TECHFRONT HUB on learning, outreach, and talent development"
      lede="We work with schools, communities, companies, and ecosystem leaders that need credible technical training or learning experiences."
      sections={sections}
      primaryHref="/programs"
      primaryLabel="See active programs"
      secondaryHref="/corporate-training"
      secondaryLabel="Corporate training"
    />
  )
}

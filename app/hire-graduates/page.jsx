'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Practical portfolios', body: 'Our strongest learners leave with projects and applied work, not just passive course completion.' },
  { title: 'Skills-first screening', body: 'We can help point hiring teams toward candidates based on demonstrated capability areas.' },
  { title: 'Growth-stage fit', body: 'This works best for companies looking for trainable operators, analysts, junior builders, and emerging technical talent.' },
]

export default function HireGraduatesPage() {
  return (
    <MarketingInfoPage
      eyebrow="Hiring"
      title="Hire graduates with applied technical training"
      lede="If your team needs early-career technical talent with practical exposure, we can support conversations around trained learners and role fit."
      sections={sections}
      primaryHref="/partner-with-us"
      primaryLabel="Talk hiring needs"
      secondaryHref="/reviews"
      secondaryLabel="See learner outcomes"
    />
  )
}

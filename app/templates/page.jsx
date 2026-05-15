'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Downloadable resources', body: 'This area will hold practical templates, planning tools, and worksheets that support active learners.' },
  { title: 'Built for execution', body: 'Templates are intended to help with study, project delivery, portfolio prep, and workplace application.' },
  { title: 'Still being assembled', body: 'The route is live now so visitors land on a real page while the resource library is being expanded.' },
]

export default function TemplatesPage() {
  return (
    <MarketingInfoPage
      eyebrow="Templates"
      title="Reusable resources are being prepared"
      lede="TECHFRONT HUB will publish downloadable tools that make learning and project execution easier. The library is being staged."
      sections={sections}
      primaryHref="/courses"
      primaryLabel="Continue learning"
      secondaryHref="/programs"
      secondaryLabel="Explore programs"
    />
  )
}

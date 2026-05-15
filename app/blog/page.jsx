'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Insights in progress', body: 'The TECHFRONT HUB blog is being prepared for training updates, industry commentary, and learner guidance.' },
  { title: 'Course notes and breakdowns', body: 'Expect practical explainers around AI, data, automation, design, and career strategy.' },
  { title: 'Community updates', body: 'This space will also carry event notes, announcements, and platform releases over time.' },
]

export default function BlogPage() {
  return (
    <MarketingInfoPage
      eyebrow="Blog"
      title="Articles and training notes are on the way"
      lede="We are setting up a clearer publishing surface for insights, explainers, and community updates. For now, the course catalog remains the main learning hub."
      sections={sections}
      primaryHref="/courses"
      primaryLabel="Browse courses"
      secondaryHref="/reviews"
      secondaryLabel="Read reviews"
    />
  )
}

'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Skills baseline', body: 'Understand the current level of your team before committing to a training plan.' },
  { title: 'Role-based evaluation', body: 'Assess around the actual responsibilities of analysts, operators, marketers, developers, and managers.' },
  { title: 'Training recommendations', body: 'Use the result to prioritize the right programs, not generic workshops.' },
]

export default function TeamAssessmentsPage() {
  return (
    <MarketingInfoPage
      eyebrow="Team assessments"
      title="Measure capability before you spend on training"
      lede="Team assessments help you map existing strengths, identify gaps, and build a smarter learning plan for departments or full organizations."
      sections={sections}
      primaryHref="/corporate-training"
      primaryLabel="Corporate training"
      secondaryHref="/partner-with-us"
      secondaryLabel="Partner with us"
    />
  )
}

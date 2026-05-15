'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Custom delivery', body: 'Training can be designed for executives, technical teams, operations staff, or cross-functional departments.' },
  { title: 'Relevant skills', body: 'Programs can focus on AI adoption, data analysis, productivity workflows, automation, or digital operations.' },
  { title: 'Practical outcomes', body: 'The goal is not attendance. The goal is a team that can apply what was learned inside real workflows.' },
]

export default function CorporateTrainingPage() {
  return (
    <MarketingInfoPage
      eyebrow="Corporate training"
      title="Upskill teams with practical technical training"
      lede="TECHFRONT HUB delivers corporate learning programs for organizations that need skill adoption, better productivity, and teams that can execute."
      sections={sections}
      primaryHref="/partner-with-us"
      primaryLabel="Start a conversation"
      secondaryHref="/team-assessments"
      secondaryLabel="Team assessments"
    />
  )
}

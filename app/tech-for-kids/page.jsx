'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Beginner-friendly tracks', body: 'Children are introduced to coding, digital creativity, and problem-solving with age-appropriate guidance.' },
  { title: 'Project-based learning', body: 'Each track is centered on simple, visible projects that keep learning practical and engaging.' },
  { title: 'Parent visibility', body: 'Parents can follow progress, understand what each child is learning, and see the work being built.' },
]

export default function TechForKidsPage() {
  return (
    <MarketingInfoPage
      eyebrow="Tech for kids"
      title="A softer entry into digital skills for younger learners"
      lede="Our kids programs are designed to make technology approachable early, with structure that builds confidence before complexity."
      sections={sections}
      primaryHref="/programs"
      primaryLabel="See programs"
      secondaryHref="/courses"
      secondaryLabel="Browse all learning"
    />
  )
}

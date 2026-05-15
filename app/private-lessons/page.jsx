'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'One-on-one coaching', body: 'Work directly with an instructor on Python, data analysis, web development, design, or AI workflow skills.' },
  { title: 'Flexible scheduling', body: 'Book around work, school, or team priorities and move at the pace your goals require.' },
  { title: 'Outcome-led lessons', body: 'Sessions are shaped around a project, a skill gap, an exam target, or a transition into a new role.' },
]

export default function PrivateLessonsPage() {
  return (
    <MarketingInfoPage
      eyebrow="Private lessons"
      title="Focused coaching for learners who need direct support"
      lede="Private lessons are built for people who want tighter feedback loops, a personalized roadmap, and faster progress on a specific skill."
      sections={sections}
      primaryHref="/login"
      primaryLabel="Talk to us"
      secondaryHref="/courses"
      secondaryLabel="Browse courses"
    />
  )
}

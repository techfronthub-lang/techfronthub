'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Account help', body: 'Support for sign-in, verification, password resets, and learner dashboard issues.' },
  { title: 'Payments and access', body: 'Questions around course enrollment, payment confirmation, or access to purchased learning materials.' },
  { title: 'General guidance', body: 'If you are unsure where to start, use this route as the support landing page for the platform.' },
]

export default function HelpCenterPage() {
  return (
    <MarketingInfoPage
      eyebrow="Help center"
      title="Support for learners, teachers, and partners"
      lede="The help center is the starting point for account issues, course access questions, and general platform support."
      sections={sections}
      primaryHref="/forgot-password"
      primaryLabel="Reset password"
      secondaryHref="/login"
      secondaryLabel="Go to login"
    />
  )
}

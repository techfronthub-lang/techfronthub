'use client'

import MarketingInfoPage from '@/src/components/MarketingInfoPage'

const sections = [
  { title: 'Readable interfaces', body: 'We aim for layouts, contrast, and structure that remain usable across desktop and mobile devices.' },
  { title: 'Continuous improvement', body: 'Accessibility work is ongoing as new surfaces are added to the site and admin experience.' },
  { title: 'Feedback welcome', body: 'If a route or interaction blocks you, report it so it can be fixed directly rather than worked around.' },
]

export default function AccessibilityPage() {
  return (
    <MarketingInfoPage
      eyebrow="Accessibility"
      title="Accessibility improvements are part of the product, not an afterthought"
      lede="TECHFRONT HUB is actively improving the accessibility of its public pages, dashboards, and account flows."
      sections={sections}
      primaryHref="/help-center"
      primaryLabel="Report an issue"
      secondaryHref="/courses"
      secondaryLabel="Back to courses"
    />
  )
}

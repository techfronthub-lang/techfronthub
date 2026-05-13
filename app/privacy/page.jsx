'use client'

const sections = [
  {
    title: '1. Introduction',
    body: `Welcome to TECHFRONT HUB ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.`,
  },
  {
    title: '2. Information We Collect',
    body: 'We collect information you provide directly, such as when you create an account, enroll in courses, or contact our support team. This may include:',
    list: ['Name and email address', 'Password and authentication information', 'Course enrollment and progress data', 'Feedback and communication preferences'],
  },
  {
    title: '3. How We Use Your Information',
    body: 'We use the information we collect to:',
    list: ['Provide and improve our educational services', 'Personalize your learning experience', 'Send course updates and communications', 'Ensure platform security and prevent fraud'],
  },
  {
    title: '4. Data Security',
    body: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
  },
  {
    title: '5. Sharing Your Information',
    body: 'We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our website and conducting our business.',
  },
  {
    title: '6. Your Rights',
    body: 'You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at hello@techfronthub.ng.',
  },
  {
    title: '7. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.',
  },
  {
    title: '8. Contact Us',
    body: 'If you have questions about this Privacy Policy, please contact us at:',
    list: ['Email: hello@techfronthub.ng', 'Phone: +234 810 000 0000', 'Address: Bodija, Ibadan . Lekki, Lagos'],
  },
]

export default function PrivacyPage() {
  return (
    <div className="bg-[color:var(--bg-surface-strong)] py-12 sm:py-16">
      <div className="site-container max-w-4xl">
        <div className="rounded border border-slate-200 bg-white px-5 py-7 shadow-[0_8px_22px_rgba(15,23,42,0.06)] sm:px-8 lg:px-10 lg:py-10">
          <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Legal</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl">Privacy Policy</h1>
          <div className="mt-7 space-y-7 text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-extrabold tracking-normal text-slate-950 sm:text-2xl">{section.title}</h2>
                <p className="mt-3">{section.body}</p>
                {section.list ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
            <p className="border-t border-slate-200 pt-6 text-sm font-semibold text-slate-500">Last Updated: April 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}

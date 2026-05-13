'use client'

const sections = [
  {
    title: '1. Agreement to Terms',
    body: 'By accessing and using TECHFRONT HUB, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
  },
  {
    title: '2. Use License',
    body: 'Permission is granted to temporarily download one copy of the materials on TECHFRONT HUB for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:',
    list: [
      'Modify or copy the materials',
      'Use the materials for any commercial purpose or for any public display',
      'Attempt to decompile or reverse engineer any software contained on the platform',
      'Transfer the materials to another person or mirror the materials on any other server',
      'Attempt to gain unauthorized access to restricted portions of the website',
    ],
  },
  {
    title: '3. Disclaimer',
    body: 'The materials on TECHFRONT HUB are provided on an "as is" basis. TECHFRONT HUB makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
  },
  {
    title: '4. Limitations',
    body: 'In no event shall TECHFRONT HUB or its suppliers be liable for any damages arising out of the use or inability to use the materials on TECHFRONT HUB.',
  },
  {
    title: '5. Accuracy of Materials',
    body: 'The materials appearing on TECHFRONT HUB could include technical, typographical, or photographic errors. TECHFRONT HUB does not warrant that any of the materials on our website are accurate, complete, or current.',
  },
  {
    title: '6. User Accounts',
    body: 'If you create an account on TECHFRONT HUB, you are responsible for maintaining the confidentiality of your password and account information and for restricting access to your computer.',
  },
  {
    title: '7. Course Content and Intellectual Property',
    body: 'All course content, including videos, materials, and documentation, is the intellectual property of TECHFRONT HUB or its content providers. You may not reproduce, distribute, or transmit any course materials without explicit written permission.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'TECHFRONT HUB shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the materials or services.',
  },
  {
    title: '9. Revisions',
    body: 'TECHFRONT HUB may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.',
  },
  {
    title: '10. Governing Law',
    body: 'These terms and conditions are governed by and construed in accordance with the laws of Nigeria, and you irrevocably submit to the exclusive jurisdiction of the courts located in Nigeria.',
  },
]

export default function TermsPage() {
  return (
    <div className="bg-[color:var(--bg-surface-strong)] py-12 sm:py-16">
      <div className="site-container max-w-4xl">
        <div className="rounded border border-slate-200 bg-white px-5 py-7 shadow-[0_8px_22px_rgba(15,23,42,0.06)] sm:px-8 lg:px-10 lg:py-10">
          <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Legal</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl">Terms and Conditions</h1>
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

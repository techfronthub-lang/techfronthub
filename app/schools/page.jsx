import { I } from '@/src/components/Icons'
import { ActionLink, PageHero } from '@/src/components/public-ui'

const PROGRAMS = [
  {
    title: 'AI Literacy for Students',
    body: 'A practical introduction to AI concepts, prompt use, safe adoption, and day-to-day productivity for secondary and tertiary students.',
    points: ['Age-appropriate delivery', 'Classroom-ready exercises', 'Responsible AI usage'],
  },
  {
    title: 'Automation Skills Program',
    body: 'Students learn how to automate research, reporting, content preparation, and repetitive workflows with modern no-code and low-code tools.',
    points: ['Hands-on automation projects', 'Useful for clubs and labs', 'Focused on real output'],
  },
  {
    title: 'School Partnership Cohorts',
    body: 'A term-based or holiday-based delivery model for schools that want structured AI and automation programs under one managed solution.',
    points: ['Runs as a cohort', 'Reporting for school leadership', 'Flexible for short or extended terms'],
  },
]

const DELIVERY = [
  'On-campus workshops and bootcamps',
  'Hybrid live sessions for multiple branches',
  'Termly student programs with measurable outcomes',
  'Special tracks for clubs, labs, and innovation hubs',
]

export default function SchoolsPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="For schools"
        title="AI and automation learning solutions for schools that want students ready for what is next."
        body="This page is not tied to one institution. It is a general offer for schools that want structured AI and automation programs their students can subscribe to."
        actions={
          <>
            <ActionLink href="/partner-with-us" variant="primary" size="lg">
              Request school partnership <I.Arrow size={16} />
            </ActionLink>
            <ActionLink href="mailto:hello@techfronthub.ng" variant="ghost" size="lg">
              Talk to the team
            </ActionLink>
          </>
        }
        stats={[
          { value: '3', label: 'Program paths' },
          { value: 'Hybrid', label: 'Delivery mode' },
          { value: 'Schools', label: 'Built for institutions' },
        ]}
      />

      <section className="py-12 sm:py-14">
        <div className="site-container">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">What this page is for</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-950">A subscription-style learning solution schools can adopt.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                Schools can use this offer to bring AI and automation training to their students through a structured partnership with TECHFRONT HUB. The focus is not generic awareness alone. The goal is practical exposure, guided projects, and visible skill growth.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {DELIVERY.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700">
                    <span className="mr-2 inline-flex text-[color:var(--brand-strong)]"><I.Check size={16} /></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[28px] bg-slate-950 p-7 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#8fd0ff]">Partnership format</p>
              <h3 className="mt-3 text-2xl font-extrabold">A clean offer schools can subscribe to.</h3>
              <p className="mt-4 text-sm leading-7 text-white/75">
                This works as a school-facing solution: you define the student group, the delivery window, and the expected outcome, and TECHFRONT HUB delivers the training structure.
              </p>
              <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-white/80">
                <div>For secondary schools, colleges, and private academies</div>
                <div>Can run as a club, holiday cohort, or academic add-on</div>
                <div>Built around modern AI and automation tools students can actually use</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] py-12 sm:py-14">
        <div className="site-container">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Program options</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Different ways a school can run the offer.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {PROGRAMS.map((program) => (
              <article key={program.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.07)]">
                <h3 className="text-2xl font-extrabold text-slate-950">{program.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{program.body}</p>
                <ul className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm text-slate-700">
                  {program.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-1 text-[color:var(--brand-strong)]"><I.Check size={14} /></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14">
        <div className="site-container rounded-[32px] bg-[linear-gradient(135deg,#0b84df_0%,#062e52_100%)] px-6 py-10 text-white shadow-[0_24px_60px_rgba(11,132,223,0.24)] sm:px-10">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#d9f1ff]">Next step</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold">If a school wants this program, the next move is a partnership conversation.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">
            Use this page as the dedicated school offer, then route interested schools into a short discussion about program size, timeline, and delivery format.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ActionLink href="/partner-with-us" variant="primary" size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
              Start a school conversation <I.Arrow size={16} />
            </ActionLink>
            <ActionLink href="mailto:hello@techfronthub.ng" variant="ghost" size="lg" className="border-white/25 bg-transparent text-white hover:bg-white/10">
              hello@techfronthub.ng
            </ActionLink>
          </div>
        </div>
      </section>
    </div>
  )
}

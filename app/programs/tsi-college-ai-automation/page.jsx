'use client'

import React from 'react'
import { ActionLink, PageHero, SectionHeading } from '@/src/components/public-ui'
import { I } from '@/src/components/Icons'

const planOptions = [
  {
    key: 'one_day',
    title: 'One day per week',
    amount: '₦500,000',
    amountNaira: 500000,
    note: 'Best for schools starting with a lighter timetable.',
  },
  {
    key: 'two_day',
    title: 'Two days per week',
    amount: '₦1,000,000',
    amountNaira: 1000000,
    note: 'Best for deeper practical coverage and faster progress.',
  },
]

const learnItems = [
  'How AI and machine learning systems work in everyday life and industry',
  'Ethical use of AI tools and responsible digital practice',
  'No-code automation workflows using tools like Zapier and Make',
  'AI-powered image editing, flyer design, and social media content creation',
  'AI-powered video editing with auto-cut, subtitles, voiceovers, and translations',
]

const deliveryItems = [
  { label: 'Session format', value: '1 or 2 practical sessions per week' },
  { label: 'Class size', value: '20-30 students per cohort' },
  { label: 'Learning mode', value: 'In-school, instructor-led, hands-on practice' },
  { label: 'Assessment', value: 'Weekly mini-projects plus a final capstone' },
]

const inclusionItems = [
  'Experienced AI educator with hands-on industry background',
  'Structured lesson plans aligned to real-world application',
  'Curated free-tier AI tools for classroom use',
  'Portfolio project for every student',
  'Certificate of completion for graduating students',
  'Regular progress reports for school management and parents',
]

function formatNaira(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[color:var(--text-strong)]">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs text-[color:var(--text-muted)]">{hint}</span> : null}
    </label>
  )
}

export default function TsiCollegePromoPage() {
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [form, setForm] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    school: 'TSI College, Gowon Estate, Egbeda',
    role: 'School representative',
    cohort: 'SS1 - SS3',
    plan: 'one_day',
  })

  const selectedPlan = planOptions.find((item) => item.key === form.plan) || planOptions[0]

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      const res = await fetch('/api/paystack/promotions/tsi-college-ai-automation/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to start payment.')
      }

      if (!data?.authorization_url) {
        throw new Error('Paystack did not return a payment link.')
      }

      window.location.href = data.authorization_url
    } catch (submitError) {
      setError(submitError?.message || 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="TSI College promotion"
        title="AI & Automation Skills Program"
        body="A sales page for parents and school management that explains the program, collects the basic details, and sends payment through Paystack."
        actions={
          <>
            <ActionLink href="#enroll" variant="primary" size="lg">
              Enroll now <I.Arrow size={16} />
            </ActionLink>
            <ActionLink href="#curriculum" variant="ghost" size="lg">
              View program details
            </ActionLink>
          </>
        }
        stats={[
          { value: 'SS1-SS3', label: 'Target students' },
          { value: '1-2', label: 'Sessions per week' },
          { value: '2', label: 'Fee options' },
          { value: '1', label: 'Certificate' },
        ]}
      />

      <section className="py-10 sm:py-12">
        <div className="site-container grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
          <div className="space-y-8">
            <div className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] p-6">
              <SectionHeading
                eyebrow="Executive summary"
                title="Future-ready digital skills for students"
                body="This program equips secondary school students with practical AI, automation, and digital creativity skills they can use for academics, entrepreneurship, and global opportunities."
              />
              <p className="text-sm leading-7 text-[color:var(--text-body)]">
                Students learn how to use AI tools, automate routine workflows, and create professional images and videos. The program is built for hands-on learning, not theory alone.
              </p>
            </div>

            <div id="curriculum" className="grid gap-4 md:grid-cols-2">
              <InfoCard
                title="What students will learn"
                items={learnItems}
              />
              <InfoCard
                title="Delivery structure"
                items={deliveryItems.map((item) => `${item.label}: ${item.value}`)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                title="Why TSI College should enroll"
                items={[
                  'Stand out in Lagos as one of the schools offering certified AI education',
                  'Give students income-generating digital skills they can use immediately',
                  'Build parental confidence with globally relevant learning',
                  'Position the school as a community leader in digital transformation',
                  'Strengthen alumni pride as graduates carry the school forward',
                ]}
              />
              <InfoCard
                title="What is included"
                items={inclusionItems}
              />
            </div>

            <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <SectionHeading
                eyebrow="Investment"
                title="Simple termly pricing"
                body="Choose the schedule that fits the school timetable. Equipment support is quoted separately."
              />
              <div className="grid gap-4 md:grid-cols-2">
                {planOptions.map((plan) => (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, plan: plan.key }))}
                    className={`rounded-2xl border p-5 text-left transition ${
                      form.plan === plan.key
                        ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)]'
                        : 'border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] hover:border-[color:var(--border-strong)]'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-[color:var(--brand-strong)]">{plan.title}</div>
                    <div className="mt-2 text-2xl font-extrabold text-[color:var(--text-strong)]">{plan.amount}</div>
                    <div className="mt-2 text-sm leading-6 text-[color:var(--text-body)]">{plan.note}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--bg-soft)] p-4 text-sm text-[color:var(--text-body)]">
                Equipment support is available on request. If the school wants device sourcing or lab setup, we can quote that separately.
              </div>
            </div>
          </div>

          <aside id="enroll" className="lg:sticky lg:top-24">
            <form onSubmit={submit} className="rounded-2xl border border-[color:var(--border-soft)] bg-white p-6 shadow-[var(--shadow-card)]">
              <div>
                <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Start enrollment</p>
                <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--text-strong)]">Collect basic details and pay securely</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-body)]">
                  Submit the school contact details below. Once payment starts, Paystack will handle the checkout flow.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <Field label="Full name">
                  <input
                    value={form.fullName}
                    onChange={updateField('fullName')}
                    required
                    className="h-12 w-full rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] px-4 text-sm font-semibold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--brand)]"
                    placeholder="Name of contact person"
                  />
                </Field>
                <Field label="Email address">
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField('email')}
                    required
                    className="h-12 w-full rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] px-4 text-sm font-semibold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--brand)]"
                    placeholder="name@school.com"
                  />
                </Field>
                <Field label="Phone number">
                  <input
                    value={form.phone}
                    onChange={updateField('phone')}
                    required
                    className="h-12 w-full rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] px-4 text-sm font-semibold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--brand)]"
                    placeholder="+234..."
                  />
                </Field>
                <Field label="School name">
                  <input
                    value={form.school}
                    onChange={updateField('school')}
                    required
                    className="h-12 w-full rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] px-4 text-sm font-semibold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--brand)]"
                    placeholder="TSI College"
                  />
                </Field>
                <Field label="Role">
                  <input
                    value={form.role}
                    onChange={updateField('role')}
                    className="h-12 w-full rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] px-4 text-sm font-semibold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--brand)]"
                    placeholder="School management / parent / coordinator"
                  />
                </Field>
                <Field label="Cohort">
                  <select
                    value={form.cohort}
                    onChange={updateField('cohort')}
                    className="h-12 w-full rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] px-4 text-sm font-semibold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--brand)]"
                  >
                    <option value="SS1 - SS3">SS1 - SS3</option>
                    <option value="SS1 only">SS1 only</option>
                    <option value="SS2 only">SS2 only</option>
                    <option value="SS3 only">SS3 only</option>
                  </select>
                </Field>
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-sm font-extrabold text-[color:var(--text-strong)]">Choose payment plan</p>
                {planOptions.map((plan) => (
                  <label
                    key={plan.key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      form.plan === plan.key
                        ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)]'
                        : 'border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.key}
                      checked={form.plan === plan.key}
                      onChange={updateField('plan')}
                      className="mt-1"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold text-[color:var(--text-strong)]">{plan.title}</span>
                      <span className="block text-sm text-[color:var(--text-body)]">{plan.note}</span>
                      <span className="mt-1 block text-sm font-bold text-[color:var(--brand-strong)]">{formatNaira(plan.amountNaira)}</span>
                    </span>
                  </label>
                ))}
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[color:var(--brand)] px-5 text-sm font-extrabold text-white transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? 'Starting Paystack checkout...' : `Pay ${selectedPlan.amount}`}
              </button>

              <p className="mt-3 text-xs leading-5 text-[color:var(--text-muted)]">
                After payment, Paystack will send the buyer back to the verification page for confirmation.
              </p>
            </form>
          </aside>
        </div>
      </section>

      <section className="border-y border-[color:var(--border-soft)] bg-[color:var(--bg-soft)] py-10 sm:py-12">
        <div className="site-container grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <SectionHeading
              eyebrow="Why it matters"
              title="A program that prepares students for the digital economy"
              body="The pitch stays simple: practical AI exposure, creative tools, automation thinking, and a certificate that the school can stand behind."
            />
          </div>
          <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white p-6">
            <h3 className="text-lg font-extrabold text-[color:var(--text-strong)]">Contact</h3>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-body)]">
              TECHFRONT HUB
              <br />
              Egbeda, Alimosho, Lagos
              <br />
              +2348035005924, +2349072582688
              <br />
              www.techfronthub.com
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoCard({ title, items }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border-soft)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <h3 className="text-lg font-extrabold text-[color:var(--text-strong)]">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--text-body)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1 text-[color:var(--brand-strong)]">
              <I.Check size={14} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

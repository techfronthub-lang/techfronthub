import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { I } from '@/src/components/Icons'
import { ActionLink } from '@/src/components/public-ui'

export const dynamic = 'force-dynamic'

function formatPrice(value) {
  if (!value) return 'Price unavailable'
  return String(value).replace(/ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ¢â‚¬Å¡Ãƒâ€šÃ‚Â¦/g, 'N').replace(/ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¦/g, 'N')
}

async function findCourse(payload, idOrSlug) {
  try {
    return await payload.findByID({ collection: 'courses', id: idOrSlug })
  } catch {
    const result = await payload.find({
      collection: 'courses',
      where: { slug: { equals: idOrSlug } },
      limit: 1,
      depth: 1,
    }).catch(() => ({ docs: [] }))
    return result.docs?.[0] || null
  }
}

function Badge({ children }) {
  return <span className="rounded-sm bg-[color:var(--brand-soft)] px-2 py-1 text-xs font-extrabold text-[color:var(--brand-strong)]">{children}</span>
}

function QuickStat({ label, value }) {
  return (
    <div className="rounded border border-slate-200 bg-white px-4 py-4">
      <div className="text-xs font-extrabold uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-slate-950">{value}</div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm text-slate-600">
      <span>{label}</span>
      <span className="text-right font-extrabold text-slate-950">{value}</span>
    </div>
  )
}

function SectionCard({ eyebrow, title, body, children, action = null }) {
  return (
    <section className="rounded border border-slate-200 bg-white px-5 py-6 shadow-[0_8px_22px_rgba(15,23,42,0.06)] sm:px-8 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">{eyebrow}</p> : null}
          <h2 className="mt-1 text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">{title}</h2>
          {body ? <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{body}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children ? <div className="mt-7">{children}</div> : null}
    </section>
  )
}

function DetailCard({ title, body, icon }) {
  const Icon = I[icon]

  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-slate-950 text-white">
          {Icon ? <Icon size={18} /> : null}
        </div>
        <div className="min-w-0">
          <h3 className="font-extrabold tracking-normal text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        </div>
      </div>
    </div>
  )
}

function RelatedCourseCard({ item }) {
  const thumbnail = item.thumbnail || item.category?.thumbnail

  return (
    <Link
      href={`/courses/${item.slug || item.id}`}
      className="group block overflow-hidden rounded border border-slate-200 bg-white transition hover:shadow-[0_8px_22px_rgba(15,23,42,0.16)]"
    >
      <div className="aspect-[16/9] overflow-hidden bg-slate-200">
        {thumbnail ? (
          <img src={thumbnail} alt={item.title || 'Course thumbnail'} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-slate-900 px-6 text-center text-sm font-extrabold text-white">{item.title}</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-slate-500">{item.level || 'All levels'}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-[15px] font-extrabold leading-5 text-slate-950">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.desc || 'A practical course with guided outcomes and real project work.'}</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
          <span className="font-semibold text-slate-600">{item.duration || 'Flexible'}</span>
          <span className="font-extrabold text-slate-950">{formatPrice(item.price)}</span>
        </div>
      </div>
    </Link>
  )
}

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const payload = await getPayload({ config })
    const course = await findCourse(payload, id)
    if (!course) return { title: 'Course - TECHFRONT HUB' }
    return { title: `${course.title} - TECHFRONT HUB`, description: course.desc }
  } catch {
    return { title: 'Course - TECHFRONT HUB' }
  }
}

export default async function CoursePage({ params }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const course = await findCourse(payload, id)

  if (!course) notFound()

  const related = await payload.find({
    collection: 'courses',
    where: { and: [{ level: { equals: course.level } }, { id: { not_equals: course.id } }] },
    limit: 3,
    depth: 1,
  }).catch(() => ({ docs: [] }))

  const whatYouLearn = course.whatYouLearn?.length
    ? course.whatYouLearn.map((item) => item.benefit)
    : [
        'Build real projects you can put in your portfolio',
        'Work with industry-standard tools and workflows',
        'Understand core concepts at a transferable level',
        'Get structured feedback from working practitioners',
        'Collaborate with peers on team deliverables',
        'Leave with a verifiable certificate of completion',
      ]

  const programOverview = course.programOverview?.length
    ? course.programOverview.map((item) => ({ week: item.week, topic: item.title, desc: item.description }))
    : [
        { week: 'Week 1-2', topic: 'Foundations and environment setup', desc: 'Core concepts, tooling, and your first hands-on exercises.' },
        { week: 'Week 3-4', topic: 'Core skills, part one', desc: 'Structured learning sessions with live instructor walkthroughs.' },
        { week: 'Week 5-6', topic: 'Practical application', desc: 'Apply everything learned to a defined problem.' },
        { week: 'Week 7-8', topic: 'Capstone project and review', desc: 'Ship your final project, present it, and receive structured feedback.' },
      ]

  const whoThisIsFor = course.whoThisIsFor?.length
    ? course.whoThisIsFor.map((item) => item.audience)
    : [
        'Professionals looking to upskill or pivot into a tech-adjacent role',
        'Recent graduates who want practical, portfolio-ready experience',
        'Entrepreneurs building digital products or data-driven businesses',
        'Anyone who learns best through structured projects and feedback',
      ]

  const enrollHref = `/student/register?courseId=${course.id}`
  const thumbnail = course.thumbnail || course.category?.thumbnail

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-white">
        <div className="site-container py-4">
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--brand-strong)] transition hover:text-[color:var(--brand)]">
            <I.Chev dir="left" size={16} /> Back to courses
          </Link>
        </div>
      </div>

      <section className="border-b border-slate-200 bg-[color:var(--bg-surface-strong)]">
        <div className="site-container grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.48fr)] lg:items-start lg:py-14">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              {course.tag ? <Badge>{course.tag}</Badge> : null}
              {course.code ? <Badge>{course.code}</Badge> : null}
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">
              {course.desc}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-extrabold text-[color:var(--brand-strong)]">4.7</span>
              <span className="flex text-[color:var(--brand)]">{Array.from({ length: 5 }).map((_, index) => <I.Star key={index} size={14} />)}</span>
              <span className="font-semibold text-slate-600">(1,240 ratings)</span>
              <span className="font-semibold text-slate-600">12,000 learners</span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickStat label="Duration" value={course.duration ?? 'Flexible'} />
              <QuickStat label="Lessons" value={course.lessons ? `${course.lessons} lessons` : 'Custom track'} />
              <QuickStat label="Level" value={course.level ?? 'All levels'} />
              <QuickStat label="Delivery" value={course.format ?? 'Cohort-based'} />
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
              <div className="aspect-[16/9] bg-slate-200">
                {thumbnail ? (
                  <img src={thumbnail} alt={`${course.title} thumbnail`} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center bg-slate-950 px-6 text-center text-sm font-extrabold text-white">{course.title}</div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-end gap-2">
                  {course.old ? <span className="text-lg font-semibold text-slate-500 line-through">{formatPrice(course.old)}</span> : null}
                  <span className="text-3xl font-extrabold tracking-normal text-slate-950">{formatPrice(course.price)}</span>
                </div>

                <ActionLink href={enrollHref} variant="primary" size="lg" className="mt-5 w-full">
                  Enrol Now <I.Arrow size={16} />
                </ActionLink>
                <ActionLink href="/student/login" variant="ghost" size="lg" className="mt-3 w-full">
                  Already have an account
                </ActionLink>

                <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
                  <SummaryRow label="Duration" value={course.duration ?? '-'} />
                  <SummaryRow label="Lessons" value={course.lessons ? `${course.lessons} lessons` : '-'} />
                  <SummaryRow label="Level" value={course.level ?? '-'} />
                  <SummaryRow label="Delivery" value={course.format ?? 'Cohort-based'} />
                  <SummaryRow label="Support" value={course.support || 'Mentor feedback and office hours'} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="site-container space-y-8">
          <SectionCard
            eyebrow="Outcome"
            title="What you will learn"
            body="The course is structured around practical outputs you can show, explain, and reuse after class."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {whatYouLearn.map((item) => (
                <DetailCard
                  key={item}
                  icon="Check"
                  title={item}
                  body="Covered through guided practice and assignments that reinforce the concept."
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Structure"
            title="Program overview"
            body="A clear learning path from foundations through final delivery."
          >
            <div className="overflow-hidden rounded border border-slate-200 bg-white">
              {programOverview.map((item, index) => (
                <div
                  key={`${item.week}-${item.topic}`}
                  className={`grid gap-3 px-5 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6 sm:px-6 ${index !== 0 ? 'border-t border-slate-200' : ''}`}
                >
                  <span className="text-xs font-extrabold uppercase text-[color:var(--brand-strong)]">{item.week}</span>
                  <div>
                    <div className="text-base font-extrabold text-slate-950">{item.topic}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Who it is for"
            title="Built for learners with a clear goal"
            body="This works best when you want structure, practical output, and visible progress."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {whoThisIsFor.map((item) => (
                <div key={item} className="rounded border border-slate-200 bg-white p-5">
                  <div className="flex gap-3">
                    <span className="mt-1 text-[color:var(--brand-strong)]"><I.Arrow size={16} /></span>
                    <span className="text-sm leading-7 text-slate-700 sm:text-base">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Included"
            title="Delivery, certificate, and support"
            body="Everything below is what the learner experience is built around."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailCard icon="Users" title="Live delivery" body={course.format || 'Cohort-based online training with guided projects and instructor feedback.'} />
              <DetailCard icon="Crown" title="Certificate" body={course.certificate || 'A professional certificate is issued after successful completion.'} />
              <DetailCard icon="Briefcase" title="Learner support" body={course.support || 'Mentor feedback, downloadable templates, and community support throughout the program.'} />
            </div>
          </SectionCard>

          {related.docs.length > 0 ? (
            <SectionCard
              eyebrow="Next up"
              title="Related courses"
              body="If this course is close but not exact, these are the nearest matches in the catalog."
              action={<ActionLink href="/courses" variant="ghost">Browse all courses <I.Arrow size={14} /></ActionLink>}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.docs.map((item) => <RelatedCourseCard key={item.id} item={item} />)}
              </div>
            </SectionCard>
          ) : null}
        </div>
      </section>

      <section className="bg-[color:var(--bg-cta)] py-10 text-white">
        <div className="site-container flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#cdeaff]">Ready to decide?</p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Start with {course.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Enroll now or sign in if you already have a student account.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ActionLink href={enrollHref} variant="primary" size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
              Enrol Now <I.Arrow size={16} />
            </ActionLink>
            <ActionLink href="/student/login" variant="ghost" size="lg" className="border-white bg-transparent text-white hover:bg-white/10">
              Student Login
            </ActionLink>
          </div>
        </div>
      </section>
    </div>
  )
}

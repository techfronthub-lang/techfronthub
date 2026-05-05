import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function flyerBg(hue) {
  return {
    background: `linear-gradient(135deg, oklch(0.35 0.08 ${hue ?? 214}), oklch(0.18 0.06 ${hue ?? 214}))`,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  };
}

function Badge({ children, hot }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background: hot ? '#ef4444' : 'rgba(255,255,255,0.1)',
      color: '#fff',
      border: hot ? 'none' : '1px solid rgba(255,255,255,0.15)',
    }}>
      {children}
    </span>
  );
}

function MetaPill({ label, value }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '12px 20px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10,
      minWidth: 120,
      backdropFilter: 'blur(8px)',
    }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{value}</span>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params
  try {
    const payload = await getPayload({ config })
    const course = await payload.findByID({ collection: 'courses', id })
    return { title: `${course.title} — TECHFRONT HUB`, description: course.desc }
  } catch {
    return { title: 'Course — TECHFRONT HUB' }
  }
}

export default async function CoursePage({ params }) {
  const { id } = await params
  const payload = await getPayload({ config })

  let course
  try {
    course = await payload.findByID({ collection: 'courses', id })
  } catch {
    notFound()
  }

  // Fetch related courses (same level, excluding this one)
  const related = await payload.find({
    collection: 'courses',
    where: { and: [{ level: { equals: course.level } }, { id: { not_equals: course.id } }] },
    limit: 3,
  }).catch(() => ({ docs: [] }))

  const c = course

  const whatYouLearn = c.whatYouLearn?.length
    ? c.whatYouLearn.map(i => i.benefit)
    : [
        'Build real projects you can put in your portfolio',
        'Work with industry-standard tools and workflows',
        'Understand core concepts at a deep, transferable level',
        'Get structured feedback from working practitioners',
        'Collaborate with peers on team deliverables',
        'Leave with a verifiable certificate of completion',
      ]

  const programOverview = c.programOverview?.length
    ? c.programOverview.map(i => ({ week: i.week, topic: i.title, desc: i.description }))
    : [
        { week: 'Week 1–2',   topic: 'Foundations & environment setup',    desc: 'Core concepts, tooling, and your first hands-on exercises.' },
        { week: 'Week 3–4',   topic: 'Core skills — part one',             desc: 'Structured learning sessions with live instructor walkthroughs.' },
        { week: 'Week 5–6',   topic: 'Core skills — part two',             desc: 'Deepening knowledge with real-world data and scenarios.' },
        { week: 'Week 7–8',   topic: 'Practical application',              desc: 'Mini-project: apply everything learned to a defined problem.' },
        { week: 'Week 9–10',  topic: 'Advanced techniques',                desc: 'Edge cases, optimisation, and industry best practices.' },
        { week: 'Week 11–12', topic: 'Capstone project & peer review',     desc: 'Ship your final project, present it, and receive structured feedback.' },
      ].slice(0, Math.ceil((c.lessons ?? 60) / 10))

  const whoThisIsFor = c.whoThisIsFor?.length
    ? c.whoThisIsFor.map(i => i.audience)
    : [
        'Professionals looking to upskill or pivot into a tech-adjacent role',
        'Recent graduates who want practical, portfolio-ready experience',
        'Entrepreneurs building digital products or data-driven businesses',
        'Anyone who learns best through structured cohorts and real projects',
      ]

  return (
    <div className="course-detail-page" style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink-700)' }}>
      {/* Back nav */}
      <div style={{ borderBottom: '1px solid var(--ink-100)' }}>
        <div className="course-detail-container course-detail-backinner" style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 24px' }}>
          <Link href="/#courses" style={{ fontSize: 13, color: 'var(--ink-400)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            ← Back to courses
          </Link>
        </div>
      </div>

      {/* Hero banner */}
      <div className="course-detail-hero" style={{ ...flyerBg(c.hue), padding: '64px 24px 56px', position: 'relative', overflow: 'hidden' }}>
        {/* Supabase Thumbnail Background */}
        {c.thumbnail && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${c.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            mixBlendMode: 'overlay'
          }} />
        )}
        {/* Subtle grid pattern for hero */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="course-detail-container" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div className="course-detail-badges" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <Badge hot={c.tagHot}>{c.tag}</Badge>
            <Badge>{c.code}</Badge>
          </div>
          <h1 className="course-detail-title" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 18, maxWidth: 750, letterSpacing: '-0.02em' }}>
            {c.title}
          </h1>
          <p className="course-detail-desc" style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 640, lineHeight: 1.6, marginBottom: 36 }}>
            {c.desc}
          </p>
          <div className="course-detail-meta-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <MetaPill label="Duration"  value={c.duration ?? '—'} />
            <MetaPill label="Lessons"   value={c.lessons ? `${c.lessons} lessons` : '—'} />
            <MetaPill label="Level"     value={c.level ?? '—'} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="course-detail-container course-detail-layout" style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48, alignItems: 'start' }}>

        {/* Left: course body */}
        <div>
          {/* What you'll learn */}
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#fff', letterSpacing: '-0.01em' }}>What you'll learn</h2>
            <div className="course-detail-learn-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {whatYouLearn.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px', background: 'var(--ink-100)', borderRadius: 12, border: '1px solid var(--ink-200)', transition: 'transform 0.2s ease' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14.5, color: 'var(--ink-700)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Program overview */}
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#fff', letterSpacing: '-0.01em' }}>Program overview</h2>
            <div className="course-detail-overview-list" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {programOverview.map((m, i) => (
                <div key={i} className="course-detail-overview-item" style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr',
                  padding: '20px 24px', gap: 20,
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderTop: i === 0 ? undefined : 'none',
                  borderRadius: i === 0 ? '12px 12px 0 0' : (i === programOverview.length - 1 ? '0 0 12px 12px' : '0'),
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.week}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 4 }}>{m.topic}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink-400)', lineHeight: 1.5 }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Who this is for */}
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#fff', letterSpacing: '-0.01em' }}>Who this is for</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {whoThisIsFor.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--brand-500)', fontWeight: 700, fontSize: 18, lineHeight: 1.3 }}>→</span>
                  <span style={{ fontSize: 16, color: 'var(--ink-200)', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Related courses */}
          {related.docs.length > 0 && (
            <section>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#fff', letterSpacing: '-0.01em' }}>Related courses</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {related.docs.map(r => (
                  <Link key={r.id} href={`/courses/${r.id}`} style={{ textDecoration: 'none' }}>
                    <div className="course-detail-related-item" style={{ display: 'flex', gap: 18, padding: '18px 24px', background: 'var(--canvas)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, alignItems: 'center', transition: 'all 0.2s ease' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0, ...flyerBg(r.hue), backgroundSize: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#fff', marginBottom: 2 }}>{r.title}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--ink-300)' }}>{r.duration} · {r.level}</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--brand-500)', whiteSpace: 'nowrap' }}>{r.price}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: enrolment card */}
        <div className="course-detail-sidebar" style={{ position: 'sticky', top: 96 }}>
          <div className="course-detail-enrol-card" style={{ border: '1px solid var(--ink-200)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', background: 'var(--ink-100)' }}>
            {/* Price header */}
            <div className="course-detail-price-head" style={{ ...flyerBg(c.hue), padding: '32px 28px 28px' }}>
              <div className="course-detail-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                {c.old && (
                  <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontWeight: 500 }}>{c.old}</span>
                )}
                <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{c.price}</span>
              </div>
              {c.old && (
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Best price available
                </div>
              )}
            </div>

            <div className="course-detail-card-body" style={{ padding: '28px' }}>
              <a
                href="#"
                className="btn btn-primary course-detail-primary-btn"
                style={{
                  display: 'flex', width: '100%', padding: '16px 0', textAlign: 'center',
                  justifyContent: 'center', borderRadius: 12,
                  fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 14,
                }}
              >
                Enrol Now
              </a>
              <a
                href="#"
                className="course-detail-secondary-btn"
                style={{
                  display: 'block', width: '100%', padding: '14px 0', textAlign: 'center',
                  background: 'transparent', color: '#fff',
                  border: '1.5px solid var(--ink-200)', borderRadius: 12,
                  fontWeight: 600, fontSize: 15, textDecoration: 'none', marginBottom: 24,
                  transition: 'background 0.2s ease'
                }}
              >
                Talk to an advisor →
              </a>

              <div className="course-detail-info-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Duration',    c.duration    || '—'],
                  ['Lessons',     c.lessons     ? `${c.lessons} lessons` : '—'],
                  ['Level',       c.level       || '—'],
                  ['Delivery',    c.format      || 'Cohort-based, live online'],
                  ['Certificate', c.certificate || 'Professional Certificate'],
                  ['Support',     c.support     || 'Slack + weekly office hours'],
                ].map(([label, value]) => (
                  <div key={label} className="course-detail-info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: '#fff', textAlign: 'right', marginLeft: 20 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink-200)', fontSize: 12, color: 'var(--ink-500)', textAlign: 'center', lineHeight: 1.5 }}>
                {c.guarantee || '30-day satisfaction guarantee'}<br/>No hidden fees · Secure checkout
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

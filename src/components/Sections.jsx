'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { I } from './Icons';
import { DEFAULT_SITE_CONFIG } from './Layout';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay },
  }),
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

function flyerBg(hue) {
  return {
    background: `linear-gradient(135deg, oklch(0.96 0.03 ${hue}), oklch(0.88 0.08 ${hue}))`,
  };
}

function featureText(f) {
  return typeof f === 'string' ? f : f?.feature ?? '';
}

export function CourseCard({ c }) {
  const href = c.id ? `/courses/${c.id}` : null;
  const Wrapper = href ? Link : 'div';
  const wrapperProps = href
    ? { href, style: { textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 } }
    : {};
  const flyerStyle = c.thumbnail
    ? {
        backgroundImage: `linear-gradient(rgba(7, 10, 20, 0.18), rgba(7, 10, 20, 0.18)), url(${c.thumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : flyerBg(c.hue ?? 214);

  return (
    <Wrapper className="course-card" {...wrapperProps}>
      <div className="course-flyer" style={flyerStyle}>
        <span className={"flyer-tag" + (c.tagHot ? " hot" : "")}>{c.tag}</span>
        <span className="flyer-badge">{c.code}</span>
        <div className="flyer-title" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{c.title}</div>
      </div>
      <div className="course-body">
        <p>{c.desc}</p>
        <div className="course-meta">
          <span>{c.duration}</span><span className="sep"/>
          <span>{c.lessons} lessons</span><span className="sep"/>
          <span>{c.level}</span>
        </div>
      </div>
      <div className="course-foot">
        <div className="course-price">
          {c.old && <span className="old">{c.old}</span>}
          {c.price}
        </div>
        <span className="btn btn-dark btn-sm">
          {href ? 'View Course' : 'Enroll Now'} <I.Arrow size={12}/>
        </span>
      </div>
    </Wrapper>
  );
}

function CourseCardSkeleton() {
  const s = { background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 6 };
  return (
    <div className="course-card" style={{ minWidth: 320, pointerEvents: 'none' }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="course-flyer" style={{ background: '#e2e8f0' }} />
      <div className="course-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...s, height: 14, width: '80%' }} />
        <div style={{ ...s, height: 12, width: '60%' }} />
        <div style={{ ...s, height: 12, width: '50%' }} />
      </div>
      <div className="course-foot">
        <div style={{ ...s, height: 18, width: 80 }} />
        <div style={{ ...s, height: 30, width: 100, borderRadius: 6 }} />
      </div>
    </div>
  );
}

export function CourseSlider({ courses, loading, siteConfig }) {
  const items = Array.isArray(courses) ? courses : [];
  const hasItems = items.length > 0;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;
  const visible = 3.4;
  const maxIdx = Math.max(0, total - Math.floor(visible));
  const eyebrow = siteConfig?.featuredCoursesEyebrow || DEFAULT_SITE_CONFIG.featuredCoursesEyebrow;
  const headline = siteConfig?.featuredCoursesHeadline || DEFAULT_SITE_CONFIG.featuredCoursesHeadline;
  const body = siteConfig?.featuredCoursesBody || DEFAULT_SITE_CONFIG.featuredCoursesBody;

  useEffect(() => {
    if (paused || !hasItems) return;
    const t = setInterval(() => {
      setIdx(i => (i + 1) > maxIdx ? 0 : i + 1);
    }, 4000);
    return () => clearInterval(t);
  }, [paused, maxIdx, hasItems]);

  const step = (dir) => {
    setIdx(i => Math.max(0, Math.min(maxIdx, i + dir)));
  };

  return (
    <motion.section id="courses" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
      <div className="container">
        <motion.div className="section-head" variants={fadeUp}>
          <div>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {eyebrow}
              {hasItems && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#22c55e', color: '#fff', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.06em' }}>
                  LIVE
                </span>
              )}
            </div>
            <h2>{headline}</h2>
            <p>{body}</p>
          </div>
          <Link href="/courses" className="btn btn-ghost">View all courses <I.Arrow size={14}/></Link>
        </motion.div>
        {!loading && !hasItems ? (
          <div style={{ padding: '28px 0', color: 'var(--ink-500)' }}>
            No courses are published yet.
          </div>
        ) : null}
        {hasItems ? (
          <motion.div className="slider-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} variants={fadeUp}>
            <div className="slider-nav">
              <button onClick={() => step(-1)} aria-label="Previous"><I.Chev dir="left"/></button>
              <button onClick={() => step(1)} aria-label="Next"><I.Chev dir="right"/></button>
            </div>
            <div className="slider-viewport">
              <div className="slider-track" style={{ transform: `translateX(calc(${-idx} * (320px + 20px)))` }}>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
                  : items.map((c, i) => <CourseCard key={c.id ?? i} c={c} />)
                }
              </div>
            </div>
            <div className="slider-dots">
              {Array.from({length: maxIdx + 1}).map((_, i) => (
                <button key={i} className={i === idx ? "active" : ""} onClick={() => setIdx(i)} aria-label={`Slide ${i+1}`}/>
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.section>
  );
}

export function Catalog({ courses = [], categories = [] }) {
  const countByCategory = React.useMemo(() => {
    const map = {}
    const crs = Array.isArray(courses) ? courses : []
    crs.forEach(c => {
      const id = c.category?.id ?? c.category
      if (id != null) map[id] = (map[id] || 0) + 1
    })
    return map
  }, [courses])

  const cats = Array.isArray(categories) ? categories : []
  const crs  = Array.isArray(courses) ? courses : []

  const displayCats = cats.slice(0, 5)

  return (
    <motion.section className="catalog" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}>
      <div className="container">
        <motion.div className="catalog-card" variants={stagger}>
          <div>
            <div className="eyebrow" style={{color: "var(--brand-200)"}}>Course catalog 2026</div>
            <h2>Every course, syllabus and price in one PDF.</h2>
            <p>{crs.length} active courses across {cats.length} tracks, with outcomes, project lists, duration and pricing. Share it with your team or HR for approval.</p>
            <div style={{display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap"}}>
              <a href="#" className="btn btn-primary btn-lg"><I.Download size={16}/> Download Full Brochure (PDF)</a>
              <a href="#" className="btn btn-ghost btn-lg" style={{background: "transparent", borderColor: "rgba(255,255,255,0.18)", color: "#fff"}}>Email it to me</a>
            </div>
            <div className="catalog-meta">
              <span>42 pages</span>
              <span>3.8 MB</span>
              <span>Updated April 2026</span>
            </div>
          </div>
          <motion.div className="catalog-pdf" variants={fadeUp}>
            <span className="tag">PDF · 42 pages</span>
            <h4>TECHFRONT HUB - Course Catalog 2026</h4>
            <div style={{fontSize: 12, color: "var(--ink-400)"}}>Outcomes · Schedules · Pricing</div>
            <div className="rows">
              {displayCats.map((cat, i) => (
                <div key={cat.id ?? i} className="pdf-row">
                  <span>{String(i + 1).padStart(2, '0')} · {cat.title}</span>
                  <b>{countByCategory[cat.id] || 0} {countByCategory[cat.id] === 1 ? 'course' : 'courses'}</b>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export function UdemyGrid({ udemy, siteConfig }) {
  const items = [...(Array.isArray(udemy) ? udemy : [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const eyebrow = siteConfig?.udemyEyebrow || DEFAULT_SITE_CONFIG.udemyEyebrow;
  const headline = siteConfig?.udemyHeadline || DEFAULT_SITE_CONFIG.udemyHeadline;
  const body = siteConfig?.udemyBody || DEFAULT_SITE_CONFIG.udemyBody;

  return (
    <motion.section id="udemy" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}>
      <div className="container">
        <motion.div className="section-head" variants={fadeUp}>
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2>{headline}</h2>
            <p>{body}</p>
          </div>
          <a href="https://www.udemy.com" className="btn btn-ghost" target="_blank" rel="noopener noreferrer">Our Udemy profile <I.ArrowUpRight size={14}/></a>
        </motion.div>
        {!items.length ? (
          <div style={{ padding: '28px 0', color: 'var(--ink-500)' }}>
            No Udemy courses are published yet.
          </div>
        ) : (
          <motion.div className="udemy-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            {items.map((u, i) => (
              <motion.a
                key={u.id ?? i}
                className="u-card"
                variants={fadeUp}
                href={u.udemyUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
              >
                <div
                  className="u-thumb"
                  style={
                    u.thumbnail
                      ? {
                          backgroundImage: `linear-gradient(rgba(7, 10, 20, 0.18), rgba(7, 10, 20, 0.18)), url(${u.thumbnail})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : flyerBg(u.hue ?? 214)
                  }
                >
                  <div className="play"></div>
                  <span className="lbl">{u.hours}</span>
                </div>
                <div className="u-body">
                  <h4 style={{ color: '#111827' }}>{u.title}</h4>
                  <div className="u-author">{u.author}</div>
                  <div className="u-rating">
                    <b>{u.rating}</b>
                    <span className="u-stars">***</span>
                    <span className="count">({u.count})</span>
                  </div>
                  <div className="u-foot">
                    <span className="u-price">{u.price}</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

export function WhyUs({ siteConfig }) {
  const items = [
    { icon: 'Target', title: 'Outcome-first curriculum', desc: 'We map each track to a practical career outcome and a real project portfolio.' },
    { icon: 'Users', title: 'Live instruction', desc: 'Small cohorts, direct feedback, and hands-on support from instructors.' },
    { icon: 'Briefcase', title: 'Career support', desc: 'Learners get guidance on placement, interviews, and business use cases.' },
  ];
  const eyebrow = siteConfig?.whyUsEyebrow || DEFAULT_SITE_CONFIG.whyUsEyebrow;
  const headline = siteConfig?.whyUsHeadline || DEFAULT_SITE_CONFIG.whyUsHeadline;
  const body = siteConfig?.whyUsBody || DEFAULT_SITE_CONFIG.whyUsBody;

  return (
    <motion.section className="why" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}>
      <div className="container">
        <motion.div className="section-head" style={{textAlign: "center", flexDirection: "column", alignItems: "center"}} variants={fadeUp}>
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2 style={{textAlign: "center"}}>{headline}</h2>
            <p style={{margin: "0 auto"}}>{body}</p>
          </div>
        </motion.div>
        <motion.div className="why-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          {items.map((w, i) => {
            const Ic = I[w.icon];
            return (
              <motion.div key={i} className="why-card" variants={fadeUp}>
                <div className="why-icn">{Ic ? <Ic size={22}/> : null}</div>
                <h4>{w.title}</h4>
                <p>{w.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}

export function Categories({ categories, courses = [], siteConfig }) {
  const countByCategory = React.useMemo(() => {
    const map = {}
    const crs = Array.isArray(courses) ? courses : []
    crs.forEach(c => {
      const id = c.category?.id ?? c.category
      if (id != null) map[id] = (map[id] || 0) + 1
    })
    return map
  }, [courses])

  const items = Array.isArray(categories) ? categories : [];
  const eyebrow = siteConfig?.categoriesEyebrow || DEFAULT_SITE_CONFIG.categoriesEyebrow;
  const headline = siteConfig?.categoriesHeadline || DEFAULT_SITE_CONFIG.categoriesHeadline;
  const body = siteConfig?.categoriesBody || DEFAULT_SITE_CONFIG.categoriesBody;

  return (
    <motion.section id="categories" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}>
      <div className="container">
        <motion.div className="section-head" variants={fadeUp}>
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2>{headline}</h2>
            <p>{body}</p>
          </div>
          <a href="/courses" className="btn btn-ghost">See all tracks <I.Arrow size={14}/></a>
        </motion.div>
        {!items.length ? (
          <div style={{ padding: '28px 0', color: 'var(--ink-500)' }}>
            No course categories yet.
          </div>
        ) : (
          <motion.div className="cats-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            {items.map((c, i) => {
              const Ic = I[c.icon];
              const count = countByCategory[c.id] || 0
              const cardStyle = c.thumbnail
                ? {
                    backgroundImage: `linear-gradient(rgba(7, 10, 20, 0.18), rgba(7, 10, 20, 0.18)), url(${c.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {};
              return (
                <motion.a key={c.id ?? i} href={`/categories/${c.id}`} className="cat-card" style={{textDecoration: "none", color: "inherit"}} variants={fadeUp}>
                  <div className="top">
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        background: c.thumbnail ? 'rgba(7, 10, 20, 0.18)' : 'var(--brand-50)',
                        color: c.thumbnail ? '#fff' : 'var(--brand-600)',
                        display: 'grid',
                        placeItems: 'center',
                        border: '1px solid var(--brand-100)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        ...cardStyle,
                      }}
                    >
                      {Ic ? <Ic size={20}/> : null}
                    </div>
                    <span className="num">{c.n}</span>
                  </div>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </div>
                  <div className="bar">
                    <span>{count} {count === 1 ? 'course' : 'courses'}</span>
                    <span className="arrow"><I.Arrow size={14}/></span>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

export function Packages({ packages, siteConfig }) {
  const items = Array.isArray(packages) ? packages : [];
  const sorted = [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const eyebrow = siteConfig?.packagesEyebrow || DEFAULT_SITE_CONFIG.packagesEyebrow;
  const headline = siteConfig?.packagesHeadline || DEFAULT_SITE_CONFIG.packagesHeadline;
  const body = siteConfig?.packagesBody || DEFAULT_SITE_CONFIG.packagesBody;

  return (
    <motion.section className="packages" id="enroll" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}>
      <div className="container">
        <motion.div className="section-head" style={{flexDirection: "column", textAlign: "center", alignItems: "center"}} variants={fadeUp}>
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2 style={{textAlign: "center"}}>{headline}</h2>
            <p style={{margin: "0 auto"}}>{body}</p>
          </div>
        </motion.div>
        {!sorted.length ? (
          <div style={{ padding: '28px 0', color: 'var(--ink-500)', textAlign: 'center' }}>
            No training packages yet.
          </div>
        ) : (
          <motion.div className="pkg-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            {sorted.map((p, i) => {
              const Ic = I[p.icon];
              return (
                <motion.div key={p.id ?? i} className={"pkg" + (p.featured ? " featured" : "")} variants={fadeUp}>
                  {p.badge && <span className="pkg-badge">{p.badge}</span>}
                  <div className="pkg-ic">{Ic ? <Ic size={22}/> : null}</div>
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <div className="pkg-price">
                    <strong>{p.price}</strong>
                    <span className="per">{p.per}</span>
                  </div>
                  <ul>
                    {(p.features ?? []).map((f, j) => <li key={j}>{featureText(f)}</li>)}
                  </ul>
                  <a href="#" className={"btn " + (p.featured ? "btn-primary" : "btn-ghost")} style={{marginTop: "auto", justifyContent: "center"}}>
                    {p.featured ? "Book a session" : "Learn more"} <I.Arrow size={14}/>
                  </a>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

export function Testimonials({ testimonials, siteConfig }) {
  const items = Array.isArray(testimonials) ? testimonials : [];
  const eyebrow = siteConfig?.testimonialsEyebrow || DEFAULT_SITE_CONFIG.testimonialsEyebrow;
  const headline = siteConfig?.testimonialsHeadline || DEFAULT_SITE_CONFIG.testimonialsHeadline;
  const body = siteConfig?.testimonialsBody || DEFAULT_SITE_CONFIG.testimonialsBody;

  return (
    <motion.section className="testimonials" id="testimonials" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}>
      <div className="container">
        <motion.div className="section-head" variants={fadeUp}>
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2>{headline}</h2>
            <p>{body}</p>
          </div>
          <Link href="/reviews" className="btn btn-ghost">Read all stories <I.Arrow size={14}/></Link>
        </motion.div>
        {!items.length ? (
          <div style={{ padding: '28px 0', color: 'var(--ink-500)' }}>
            No testimonials yet.
          </div>
        ) : (
          <motion.div className="t-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            {items.map((t, i) => (
              <motion.div key={t.id ?? i} className="t-card" variants={fadeUp}>
                <div className="t-stars">***</div>
                <div className="quote">"{t.quote}"</div>
                <div className="person">
                  <div className="avatar">{t.initials}</div>
                  <div><b>{t.name}</b><span>{t.role}</span></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

export function FinalCTA({ siteConfig }) {
  const headline = siteConfig?.ctaHeadline ?? '';
  const body = siteConfig?.ctaBody ?? '';
  const eyebrow = siteConfig?.finalCtaEyebrow || DEFAULT_SITE_CONFIG.finalCtaEyebrow;
  const secondaryLabel = siteConfig?.finalCtaSecondaryLabel || DEFAULT_SITE_CONFIG.finalCtaSecondaryLabel;
  const secondaryHref = siteConfig?.finalCtaSecondaryHref || DEFAULT_SITE_CONFIG.finalCtaSecondaryHref;

  return (
    <motion.section className="final-cta" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}>
      <div className="container">
        <div className="eyebrow" style={{color: "var(--brand-200)"}}>{eyebrow}</div>
        <h2>{headline}</h2>
        <p>{body}</p>
        <div className="btns">
          <a href="#courses" className="btn btn-primary btn-lg">Enroll Now <I.Arrow size={16}/></a>
          <Link href={secondaryHref} className="btn btn-lg" style={{background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff"}}>{secondaryLabel}</Link>
        </div>
      </div>
    </motion.section>
  );
}

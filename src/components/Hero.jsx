import React from 'react'
import { I } from './Icons'
import { DEFAULT_SITE_CONFIG } from './Layout'

export function Hero({ siteConfig }) {
  const badge = siteConfig?.heroBadge ?? ''
  const headline = siteConfig?.heroHeadline ?? ''
  const lede = siteConfig?.heroLede ?? ''
  const stats = [
    { value: siteConfig?.statLearners ?? '', label: 'Learners trained' },
    { value: siteConfig?.statCourses ?? '', label: 'Active courses' },
    { value: siteConfig?.statCareerTracks ?? '', label: 'Career tracks' },
    { value: siteConfig?.statPlacement ?? '', label: 'Job placement' },
    { value: siteConfig?.statRating ?? '', label: 'Average rating' },
  ].filter((item) => item.value)

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <span className="pill"><span className="dot-live"/> {badge}</span>
            <h1>{headline}</h1>
            <p className="lede">{lede}</p>
            <div className="hero-ctas">
              <a href="#courses" className="btn btn-primary btn-lg">Explore Courses <I.Arrow size={16} /></a>
              <a href="#learning" className="btn btn-ghost btn-lg"><I.Play size={14} /> Start Learning</a>
            </div>
            <div className="hero-stats">
              {stats.map((item) => (
                <div key={item.label} className="hero-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="browser">
              <div className="browser-top">
                <span className="browser-dot r"/><span className="browser-dot y"/><span className="browser-dot g"/>
                <span className="browser-url">learn.techfronthub.ng/dashboard</span>
              </div>
              <div className="browser-body">
                <div className="lms-sidebar">
                  <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.5 }}>My Learning</div>
                  <div className="row active"><span className="icn"/> Dashboard</div>
                  <div className="row"><span className="icn"/> My Courses</div>
                  <div className="row"><span className="icn"/> Assignments</div>
                  <div className="row"><span className="icn"/> Live Sessions</div>
                  <div className="row"><span className="icn"/> Certificates</div>
                  <div style={{ flex: 1 }}/>
                  <div className="row" style={{ background: 'rgba(37,99,235,0.18)', color: '#dbeafe' }}>
                    <span className="icn" style={{ background: '#60a5fa' }}/> Upgrade
                  </div>
                </div>
                <div className="lms-main">
                  <div className="lms-card alt">
                    <h4>Data Analytics - Week 6</h4>
                    <div className="bar"><div style={{ width: '62%' }}/></div>
                    <div className="meta"><span>Power BI - Dashboards</span><span>62%</span></div>
                  </div>
                  <div className="lms-card">
                    <h4>Applied AI & Automation</h4>
                    <div className="bar"><div style={{ width: '28%' }}/></div>
                    <div className="meta"><span>Prompt engineering</span><span>28%</span></div>
                  </div>
                  <div className="lms-card">
                    <h4>Cloud Fundamentals</h4>
                    <div className="bar"><div style={{ width: '84%' }}/></div>
                    <div className="meta"><span>AWS basics</span><span>84%</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-floating cert">
              <div className="ic">V</div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-400)' }}>Certificate earned</div>
                <div>Power BI - Level 2</div>
              </div>
            </div>
            <div className="hero-floating score">
              <div className="ic">*</div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-400)' }}>Cohort average</div>
                <div>92 / 100</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Trusted({ siteConfig }) {
  const companies = siteConfig?.trustedCompanies?.length
    ? siteConfig.trustedCompanies.map((c) => c?.name).filter(Boolean)
    : []
  const label = siteConfig?.trustedLabel || DEFAULT_SITE_CONFIG.trustedLabel

  return (
    <div className="trusted">
      <div className="container">
        <div className="label">{label}</div>
        <div className="trusted-row">
          {companies.length ? companies.map((company, i) => (
            <div key={company} className="trusted-logo">
              <span
                className="sq"
                style={
                  i % 3 === 1
                    ? { borderRadius: '50%' }
                    : i % 3 === 2
                      ? { transform: 'rotate(45deg)' }
                      : undefined
                }
              />
              {company}
            </div>
          )) : (
            <div style={{ color: 'var(--ink-500)', padding: '12px 0' }}>
              No trusted companies configured.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import React from 'react'

export function AuthShowcase({ eyebrow, title, body, bullets, mode = 'login' }) {
  const stats =
    mode === 'register'
      ? [
          { label: 'Live cohorts', value: '12' },
          { label: 'Certificates issued', value: '4.8k' },
          { label: 'Completion support', value: '1:1' },
        ]
      : [
          { label: 'Active learners', value: '12.4k' },
          { label: 'Courses', value: '125+' },
          { label: 'Certificates', value: 'Verified' },
        ]

  return (
    <section style={panelStyle}>
      <div style={glowOneStyle} />
      <div style={glowTwoStyle} />

      <div style={copyStyle}>
        <div style={eyebrowStyle}>{eyebrow}</div>
        <h1 style={titleStyle}>{title}</h1>
        <p style={bodyStyle}>{body}</p>
        <div style={bulletListStyle}>
          {bullets.map((bullet) => (
            <div key={bullet} style={bulletRowStyle}>
              <span style={bulletDotStyle} />
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={mockStyle}>
        <div style={dashboardCardStyle}>
          <div style={dashboardHeaderStyle}>
            <div>
              <div style={miniLabelStyle}>Student Portal</div>
              <div style={dashboardTitleStyle}>Learning overview</div>
            </div>
            <div style={badgeStyle}>Live</div>
          </div>

          <div style={statsGridStyle}>
            {stats.map((stat) => (
              <div key={stat.label} style={statCardStyle}>
                <div style={statValueStyle}>{stat.value}</div>
                <div style={statLabelStyle}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={courseListStyle}>
            <div style={courseItemStyle}>
              <div>
                <div style={courseTitleStyle}>Frontend Engineering</div>
                <div style={courseMetaStyle}>Module 8 of 12 completed</div>
              </div>
              <div style={progressPillStyle}>67%</div>
            </div>
            <div style={courseItemStyle}>
              <div>
                <div style={courseTitleStyle}>Data Analytics with Python</div>
                <div style={courseMetaStyle}>Certificate track in progress</div>
              </div>
              <div style={progressPillStyle}>82%</div>
            </div>
          </div>
        </div>

        <div style={certificateCardStyle}>
          <div style={certificateTopStyle}>
            <div style={certificateSealStyle}>TF</div>
            <div>
              <div style={miniLabelLightStyle}>Certificate Ready</div>
              <div style={certificateTitleStyle}>Professional completion records</div>
            </div>
          </div>
          <p style={certificateBodyStyle}>
            Track your course progress, complete assessments, and receive verified certificates when you finish.
          </p>
        </div>
      </div>
    </section>
  )
}

const panelStyle = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '28px',
  background:
    'radial-gradient(circle at top right, rgba(245, 185, 75, 0.18), transparent 24%), linear-gradient(180deg, #081321 0%, #0e2342 55%, #10213a 100%)',
  color: '#f8fafc',
  minHeight: '100%',
}

const glowOneStyle = {
  position: 'absolute',
  top: '-120px',
  right: '-60px',
  width: '240px',
  height: '240px',
  borderRadius: '999px',
  background: 'rgba(37, 99, 235, 0.18)',
  filter: 'blur(18px)',
}

const glowTwoStyle = {
  position: 'absolute',
  bottom: '8%',
  left: '-80px',
  width: '220px',
  height: '220px',
  borderRadius: '999px',
  background: 'rgba(245, 185, 75, 0.16)',
  filter: 'blur(20px)',
}

const copyStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '560px',
}

const eyebrowStyle = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.08)',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
}

const titleStyle = {
  margin: '18px 0 12px',
  fontSize: '34px',
  lineHeight: 1.08,
  letterSpacing: 0,
}

const bodyStyle = {
  margin: 0,
  color: 'rgba(226, 232, 240, 0.82)',
  fontSize: '15px',
  lineHeight: 1.7,
}

const bulletListStyle = {
  display: 'grid',
  gap: '12px',
  marginTop: '24px',
}

const bulletRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '14px',
  color: 'rgba(241, 245, 249, 0.94)',
}

const bulletDotStyle = {
  width: '10px',
  height: '10px',
  flexShrink: 0,
  borderRadius: '999px',
  background: '#f2b94b',
  boxShadow: '0 0 0 6px rgba(242, 185, 75, 0.16)',
}

const mockStyle = {
  position: 'relative',
  zIndex: 1,
  marginTop: '28px',
  display: 'grid',
  gap: '14px',
}

const dashboardCardStyle = {
  borderRadius: '24px',
  padding: '20px',
  background: 'rgba(7, 16, 30, 0.46)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 24px 48px rgba(0,0,0,0.28)',
  backdropFilter: 'blur(10px)',
}

const dashboardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '16px',
  marginBottom: '18px',
}

const miniLabelStyle = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(219, 234, 254, 0.94)',
}

const dashboardTitleStyle = {
  marginTop: '8px',
  fontSize: '20px',
  fontWeight: 700,
}

const badgeStyle = {
  borderRadius: '999px',
  padding: '8px 12px',
  background: 'rgba(242, 185, 75, 0.14)',
  color: '#fde7b0',
  fontSize: '12px',
  fontWeight: 700,
}

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '12px',
}

const statCardStyle = {
  borderRadius: '18px',
  padding: '14px',
  background: 'rgba(2, 6, 23, 0.28)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const statValueStyle = {
  fontSize: '24px',
  fontWeight: 800,
  lineHeight: 1,
}

const statLabelStyle = {
  marginTop: '8px',
  fontSize: '12px',
  lineHeight: 1.5,
  color: 'rgba(226, 232, 240, 0.7)',
}

const courseListStyle = {
  display: 'grid',
  gap: '12px',
  marginTop: '18px',
}

const courseItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  borderRadius: '18px',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.06)',
}

const courseTitleStyle = {
  fontWeight: 700,
  fontSize: '14px',
}

const courseMetaStyle = {
  marginTop: '4px',
  fontSize: '12px',
  color: 'rgba(226, 232, 240, 0.68)',
}

const progressPillStyle = {
  borderRadius: '999px',
  padding: '8px 12px',
  background: 'rgba(29, 78, 216, 0.22)',
  color: '#dbeafe',
  fontSize: '12px',
  fontWeight: 700,
}

const certificateCardStyle = {
  borderRadius: '24px',
  padding: '18px 20px',
  background: 'linear-gradient(135deg, rgba(242, 185, 75, 0.18), rgba(15, 23, 42, 0.72))',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 18px 34px rgba(0,0,0,0.2)',
}

const certificateTopStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
}

const certificateSealStyle = {
  width: '52px',
  height: '52px',
  borderRadius: '16px',
  display: 'grid',
  placeItems: 'center',
  background: '#f8fafc',
  color: '#0f172a',
  fontWeight: 800,
  letterSpacing: '0.08em',
}

const miniLabelLightStyle = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(254, 229, 161, 0.96)',
}

const certificateTitleStyle = {
  marginTop: '8px',
  fontSize: '17px',
  fontWeight: 700,
}

const certificateBodyStyle = {
  margin: '14px 0 0',
  fontSize: '14px',
  lineHeight: 1.7,
  color: 'rgba(241, 245, 249, 0.84)',
}

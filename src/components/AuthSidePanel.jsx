'use client'

import React from 'react'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'

export function AuthSidePanel({
  title,
  body,
  image = DEFAULT_IMAGE,
  badge = 'TECHFRONT HUB',
}) {
  return (
    <section style={panelStyle}>
      <img src={image} alt={title} style={imageStyle} />
      <div style={overlayStyle} />
      <div style={contentStyle}>
        <div style={badgeStyle}>{badge}</div>
        {title ? <h1 style={titleStyle}>{title}</h1> : null}
        {body ? <p style={bodyStyle}>{body}</p> : null}
      </div>
    </section>
  )
}

const panelStyle = {
  position: 'relative',
  minHeight: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  overflow: 'hidden',
  background: '#0b1726',
}

const imageStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const overlayStyle = {
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(180deg, rgba(7,16,28,0.18) 0%, rgba(7,16,28,0.58) 45%, rgba(7,16,28,0.92) 100%)',
}

const contentStyle = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  padding: '24px',
  color: '#ffffff',
}

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.16)',
  border: '1px solid rgba(255,255,255,0.22)',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
}

const titleStyle = {
  margin: '18px 0 0',
  fontSize: 'clamp(28px, 3vw, 40px)',
  lineHeight: 1.08,
  maxWidth: '12ch',
}

const bodyStyle = {
  margin: '14px 0 0',
  maxWidth: '44ch',
  fontSize: '15px',
  lineHeight: 1.7,
  color: 'rgba(255,255,255,0.82)',
}

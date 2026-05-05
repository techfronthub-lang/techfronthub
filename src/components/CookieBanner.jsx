'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)',
      maxWidth: 680,
      background: '#0f172a',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      boxShadow: '0 18px 40px rgba(0,0,0,0.5)',
      zIndex: 9999,
      flexWrap: 'wrap',
    }}>
      <p style={{ flex: 1, margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.6, minWidth: 200 }}>
        We use cookies to improve your experience.{' '}
        <Link href="/privacy" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
          Privacy Policy
        </Link>
      </p>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  )
}

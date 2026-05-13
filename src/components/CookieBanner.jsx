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
    <div className="fixed inset-x-4 bottom-4 z-[9999] mx-auto flex max-w-2xl flex-wrap items-center gap-4 rounded-[24px] border border-white/15 bg-[color:var(--bg-cta)]/95 px-5 py-5 shadow-[0_24px_60px_rgba(16,35,63,0.28)] backdrop-blur sm:inset-x-0 sm:px-6">
      <p className="min-w-[220px] flex-1 text-sm leading-6 text-white/78">
        We use cookies to improve your experience.{' '}
        <Link href="/privacy" className="text-[#cdeaff] underline underline-offset-4">
          Privacy Policy
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <button onClick={decline} className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-medium text-white/78 transition hover:bg-white/8">
          Decline
        </button>
        <button onClick={accept} className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color:var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)]">
          Accept
        </button>
      </div>
    </div>
  )
}

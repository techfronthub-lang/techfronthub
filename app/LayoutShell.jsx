'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Header, Footer, DEFAULT_SITE_CONFIG, loadSiteConfig } from '@/src/components/Layout'

export function LayoutShell({ children }) {
  const pathname = usePathname()
  const isAdmin      = pathname.startsWith('/admin')
  const isInstructor = pathname.startsWith('/instructor')
  const isShell      = !isAdmin && !isInstructor
  const [siteConfig, setSiteConfig] = React.useState(DEFAULT_SITE_CONFIG)

  React.useEffect(() => {
    let active = true
    loadSiteConfig()
      .then((config) => {
        if (!active) return
        setSiteConfig({ ...DEFAULT_SITE_CONFIG, ...config })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {isShell && (
        <>
          {/*
            Top announcement bar disabled for now.
          */}
          {/* <TopBar siteConfig={siteConfig} /> */}
        </>
      )}
      {isShell && <Header siteConfig={siteConfig} />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{ minHeight: '100%' }}
        >
          {children}
          </motion.div>
      </AnimatePresence>
      {isShell && <Footer siteConfig={siteConfig} />}
    </>
  )
}

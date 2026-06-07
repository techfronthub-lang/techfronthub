import { LayoutShell } from './LayoutShell'
import { CookieBanner } from '@/src/components/CookieBanner'
import './globals.css'

export const viewport = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'

export const metadata = {
  title: 'TECHFRONT HUB - Nigeria\'s Career-Focused Tech Academy',
  description:
    'Cohort-based bootcamps, 1-on-1 coaching and corporate training in data analytics, engineering, AI, DevOps and more. Based in Ibadan & Lagos, Nigeria.',
  keywords: [
    'tech training Nigeria',
    'data analytics bootcamp',
    'coding school Nigeria',
    'DevOps training',
    'AI automation course',
    'TECHFRONT HUB',
    'Ibadan tech academy',
    'corporate training Nigeria',
    'tech for kids',
  ],
  authors: [{ name: 'TECHFRONT HUB' }],
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://techfronthub.ng',
    siteName: 'TECHFRONT HUB',
    title: 'TECHFRONT HUB - Nigeria\'s Career-Focused Tech Academy',
    description:
      'Cohort bootcamps, 1-on-1 coaching and corporate training in data, engineering and AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TECHFRONT HUB',
    description: 'Nigeria\'s career-focused tech academy.',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const stored = localStorage.getItem('techfront-theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = stored || (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  document.documentElement.dataset.theme = theme;
                } catch (_) {}
              })();
            `,
          }}
        />
        <LayoutShell>
          {children}
        </LayoutShell>
        <CookieBanner />
      </body>
    </html>
  )
}

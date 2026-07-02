import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { RolesProvider } from '@/components/roles-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'HireGenei — AI-Powered Job Matching',
  description: 'Resume analyzer, job scraper, and AI career consultant in one platform',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="grid-bg" aria-hidden="true" />
        <div className="aurora" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />
        <RolesProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <SiteHeader />
            <main className="flex-1 flex flex-col">{children}</main>
            <SiteFooter />
          </div>
        </RolesProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

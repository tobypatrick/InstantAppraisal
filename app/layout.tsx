import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'
import { MarketingTracking } from '@/components/marketing/MarketingTracking'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: {
    default: 'InstantAppraisal — Property Appraisals for Real Estate Agents',
    template: '%s | InstantAppraisal',
  },
  description: 'Generate professional property appraisals instantly. Powered by PropTrack data and AI. Built for Australian real estate agents.',
  keywords: ['property appraisal', 'real estate', 'Australia', 'PropTrack', 'instant appraisal', 'property valuation'],
  authors: [{ name: 'InstantAppraisal' }],
  creator: 'InstantAppraisal',
  metadataBase: new URL('https://instantappraisal.co'),
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://instantappraisal.co',
    siteName: 'InstantAppraisal',
    title: 'InstantAppraisal — Property Appraisals for Real Estate Agents',
    description: 'Generate professional property appraisals instantly. Powered by PropTrack data and AI.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'InstantAppraisal' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InstantAppraisal — Property Appraisals for Real Estate Agents',
    description: 'Generate professional property appraisals instantly. Powered by PropTrack data and AI.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <MarketingTracking />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

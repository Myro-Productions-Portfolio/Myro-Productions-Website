import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/ThemeContext'
import Navigation from '@/components/ui/Navigation'
import Footer from '@/components/sections/Footer'
import JsonLd from '@/components/seo/JsonLd'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text flash
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text flash
  preload: true,
  fallback: ['monospace'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://myroproductions.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Myro Productions | Rapid Prototyping & AI Development',
    template: '%s | Myro Productions',
  },
  description:
    'Myro Productions: rapid prototyping, automation, and AI-accelerated development. From concept to production, faster than you thought possible.',
  keywords: [
    'rapid prototyping',
    'AI development',
    'automation solutions',
    'web development',
    'software development',
    'AI-accelerated development',
    'full-stack development',
    'MVP development',
    'product development',
    'Nicolas Robert Myers',
    'Myro Productions',
  ],
  authors: [{ name: 'Nicolas Robert Myers', url: siteUrl }],
  creator: 'Nicolas Robert Myers',
  publisher: 'Myro Productions',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Myro Productions',
    title: 'Myro Productions | Rapid Prototyping & AI Development',
    description:
      'Myro Productions: rapid prototyping, automation, and AI-accelerated development. From concept to production, faster than you thought possible.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Myro Productions - Rapid Prototyping & AI Development',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Myro Productions | Rapid Prototyping & AI Development',
    description:
      'Myro Productions: rapid prototyping, automation, and AI-accelerated development. From concept to production, faster than you thought possible.',
    images: ['/og-image.png'],
  },
  verification: {
    // Add these after setting up Search Console and other verification tools
    // google: 'verification-token',
    // yandex: 'verification-token',
    // bing: 'verification-token',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a2e1a" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <JsonLd />
          <Navigation />
          <main>{children}</main>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}

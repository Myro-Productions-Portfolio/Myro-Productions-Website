import type { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import Process from '@/components/sections/Process'
import Portfolio from '@/components/sections/Portfolio'
import About from '@/components/sections/About'
// Testimonials hidden until client feedback is collected
// import Testimonials from '@/components/sections/Testimonials'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import Contact from '@/components/sections/Contact'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Myro Productions: rapid prototyping, automation, and AI-accelerated development. From concept to production, faster than you thought possible.',
  openGraph: {
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
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Process />
      <Portfolio />
      <About />
      {/* <Testimonials /> - Hidden until client feedback is collected */}
      <Pricing />
      <FAQ />
      <Contact />
    </main>
  )
}

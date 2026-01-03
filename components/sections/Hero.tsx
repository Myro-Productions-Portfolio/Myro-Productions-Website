'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { float as floatAnimation } from '@/lib/animations'
import Button from '@/components/ui/Button'
import BookingButton from '@/components/ui/BookingButton'
import { useTheme } from '@/lib/ThemeContext'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export default function Hero() {
  const { theme } = useTheme()
  const heroRef = useRef<HTMLElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadlineRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const decorative1Ref = useRef<HTMLDivElement>(null)
  const decorative2Ref = useRef<HTMLDivElement>(null)

  const isLightMode = theme === 'light'

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  useGSAP(() => {
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Parallax background effect
      if (backgroundRef.current) {
        gsap.to(backgroundRef.current, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      // Entrance animations
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Fade in and slide up the headline with character reveal
      if (headlineRef.current) {
        // Split text into lines for animation
        const lines = headlineRef.current.querySelectorAll('.line')
        tl.fromTo(
          lines,
          {
            opacity: 0,
            y: 60,
            rotationX: -45,
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 1.2,
            stagger: 0.15,
          },
          0.3
        )
      }

      // Subheadline animation
      if (subheadlineRef.current) {
        tl.fromTo(
          subheadlineRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.6'
        )
      }

      // Buttons animation
      if (buttonsRef.current) {
        const buttons = buttonsRef.current.querySelectorAll('button')
        tl.fromTo(
          buttons,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.4'
        )
      }

      // Floating decorative elements
      if (decorative1Ref.current) {
        floatAnimation(decorative1Ref.current, {
          distance: 20,
          duration: 4,
          repeat: -1,
        })
      }

      if (decorative2Ref.current) {
        floatAnimation(decorative2Ref.current, {
          distance: 15,
          duration: 5,
          repeat: -1,
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with hero image and parallax */}
      <div
        ref={backgroundRef}
        className="absolute inset-0"
        style={{
          willChange: 'transform',
        }}
      >
        {/* Hero background image - switches based on theme */}
        <Image
          src={isLightMode ? "/images/hero-image-2.png" : "/images/hero-image-1.png"}
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center transition-opacity duration-500"
          aria-hidden="true"
        />

        {/* Gradient overlay for depth and text readability */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isLightMode
            ? 'bg-gradient-to-br from-white/30 via-white/20 to-white/40'
            : 'bg-gradient-to-br from-carbon-dark/70 via-carbon/60 to-carbon-dark/80'
        }`} />

        {/* Accent gradient spotlight */}
        <div
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-accent/10 via-transparent to-transparent blur-3xl"
          style={{ transform: 'translate(25%, -25%)' }}
        />
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        {/* Main Headline */}
        <h1
          ref={headlineRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          style={{ perspective: '1000px' }}
        >
          <span className={`line block transition-colors duration-500 ${
            isLightMode ? 'text-accent-dark' : 'text-text-primary'
          }`}>
            One-Man
          </span>
          <span className={`line block bg-clip-text text-transparent transition-all duration-500 ${
            isLightMode
              ? 'bg-gradient-to-r from-accent-dark via-accent to-accent-dark'
              : 'bg-gradient-to-r from-accent via-accent-light to-accent'
          }`}>
            Production Powerhouse
          </span>
        </h1>

        {/* Subheadline */}
        <div
          ref={subheadlineRef}
          className={`text-xl sm:text-2xl md:text-3xl max-w-5xl mx-auto mb-12 leading-relaxed transition-colors duration-500 ${
            isLightMode ? 'text-accent-dark/80' : 'text-text-secondary'
          }`}
        >
          <p className="mb-2">
            From concept to production,{' '}
            <span className={`font-semibold transition-colors duration-500 ${
              isLightMode ? 'text-accent-dark' : 'text-accent'
            }`}>faster than you thought possible.</span>
          </p>
          <p>
            Rapid prototyping, automation solutions, and AI-accelerated development.
          </p>
        </div>

        {/* CTA Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <BookingButton
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[240px]"
          />
          <Button
            variant="secondary"
            size="lg"
            href="#portfolio"
            className="w-full sm:w-auto min-w-[200px]"
          >
            View My Work
          </Button>
          <Button
            variant="secondary"
            size="lg"
            href="#contact"
            className="w-full sm:w-auto min-w-[200px]"
          >
            Get In Touch
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <div className="w-6 h-10 border-2 border-accent/50 rounded-full flex justify-center p-2">
            <div className="w-1 h-3 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Decorative elements - hidden on mobile to prevent overflow */}
      <div ref={decorative1Ref} className="hidden md:block absolute top-1/4 left-[10%] w-64 h-64 bg-moss-700/10 rounded-full blur-3xl" aria-hidden="true" />
      <div ref={decorative2Ref} className="hidden md:block absolute bottom-1/4 right-[10%] w-96 h-96 bg-accent/5 rounded-full blur-3xl" aria-hidden="true" />
    </section>
  )
}

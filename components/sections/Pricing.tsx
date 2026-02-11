'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Button from '@/components/ui/Button'
import { DURATIONS, EASINGS, STAGGER } from '@/lib/animations'

gsap.registerPlugin(ScrollTrigger)

interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}

const packages: PricingTier[] = [
  {
    name: 'Quick Win',
    price: 'Starting at $500',
    description: 'Perfect for small fixes and quick implementations',
    features: [
      'Bug fixes & optimizations',
      'Single feature additions',
      'Code review & consultation',
      '1-2 week turnaround',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Full Project',
    price: 'Starting at $2,500',
    description: 'Complete application development from concept to launch',
    features: [
      'Full-stack development',
      'UI/UX design integration',
      'Testing & deployment',
      '2-6 week timeline',
      'Post-launch support',
    ],
    cta: "Let's Talk",
    highlighted: true,
  },
  {
    name: 'Ongoing Partnership',
    price: 'Custom',
    description: 'Long-term development partnership for evolving needs',
    features: [
      'Dedicated development hours',
      'Priority support',
      'Continuous improvement',
      'Flexible scope',
      'Strategic consulting',
    ],
    cta: 'Contact Me',
    highlighted: false,
  },
]

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const curtainLeftRef = useRef<HTMLDivElement>(null)
  const curtainRightRef = useRef<HTMLDivElement>(null)

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  // GSAP curtain reveal and card entrance animations
  useGSAP(
    () => {
      if (prefersReducedMotion || !sectionRef.current || !cardsRef.current) return

      const cards = cardsRef.current.children
      const curtainLeft = curtainLeftRef.current
      const curtainRight = curtainRightRef.current

      // Create a timeline for synchronized animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      })

      // Curtain opening animation (left panel slides left, right panel slides right)
      if (curtainLeft && curtainRight) {
        tl.to(
          [curtainLeft, curtainRight],
          {
            scaleX: 0,
            duration: DURATIONS.slow,
            ease: EASINGS.inOut,
            stagger: 0,
          },
          0
        )
      }

      // Staggered card entrance (starts 0.25s after curtains begin opening)
      tl.fromTo(
        cards,
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: DURATIONS.slow,
          stagger: STAGGER.normal,
          ease: EASINGS.snappy,
        },
        0.25
      )

      // Cleanup
      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.vars.trigger === sectionRef.current) {
            trigger.kill()
          }
        })
      }
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  )

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-16 px-6 md:py-20 bg-carbon-light overflow-hidden"
    >
      {/* Curtain Panels */}
      {!prefersReducedMotion && (
        <>
          {/* Left Curtain Panel */}
          <div
            ref={curtainLeftRef}
            className="absolute inset-y-0 left-0 w-1/2 bg-carbon-dark z-20 origin-left"
            style={{
              boxShadow: '2px 0 20px 0 rgba(79, 209, 197, 0.3)',
            }}
            aria-hidden="true"
          />
          {/* Right Curtain Panel */}
          <div
            ref={curtainRightRef}
            className="absolute inset-y-0 right-0 w-1/2 bg-carbon-dark z-20 origin-right"
            style={{
              boxShadow: '-2px 0 20px 0 rgba(79, 209, 197, 0.3)',
            }}
            aria-hidden="true"
          />
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            Choose the package that fits your needs. All projects include a free
            consultation call to discuss your requirements.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {packages.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col bg-carbon backdrop-blur-sm rounded-xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? 'border-2 border-accent shadow-xl shadow-accent/20 scale-105 md:scale-110 z-10'
                  : 'border border-carbon-lighter hover:border-moss-600/50'
              }`}
            >
              {/* Recommended Badge */}
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-accent text-carbon shadow-lg">
                    Recommended
                  </span>
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-accent">
                  {tier.price}
                </span>
              </div>

              {/* Description */}
              <p className="text-text-secondary mb-6 min-h-[3rem]">
                {tier.description}
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 text-accent flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-text-primary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={tier.highlighted ? 'primary' : 'secondary'}
                size="lg"
                href="#contact"
                className="w-full"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Free Consultation Note */}
        <div className="mt-10 text-center">
          <p className="text-text-secondary text-sm md:text-base">
            <svg
              className="inline-block h-5 w-5 text-accent mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            All projects include a free consultation call to discuss your
            requirements and ensure we&apos;re the right fit.
          </p>
        </div>
      </div>
    </section>
  )
}

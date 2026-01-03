'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ProcessStep {
  number: string
  title: string
  description: string
}

const steps: ProcessStep[] = [
  {
    number: '01',
    title: 'Discovery',
    description:
      'We discuss your goals, requirements, and timeline. I learn about your business and challenges.',
  },
  {
    number: '02',
    title: 'Planning',
    description:
      'I create a detailed project plan with milestones, tech stack recommendations, and deliverables.',
  },
  {
    number: '03',
    title: 'Development',
    description:
      'Rapid iterative development with regular check-ins. You see progress every step of the way.',
  },
  {
    number: '04',
    title: 'Review',
    description:
      "Testing, refinement, and feedback incorporation. We polish until it's exactly right.",
  },
  {
    number: '05',
    title: 'Launch',
    description:
      'Deployment, documentation, and handoff. Plus ongoing support to ensure success.',
  },
]

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  // GSAP entrance animations
  useGSAP(() => {
    if (prefersReducedMotion || !stepsRef.current) return

    const ctx = gsap.context(() => {
      const stepElements = stepsRef.current?.children
      if (!stepElements) return

      // Animate steps with stagger
      gsap.fromTo(
        stepElements,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Animate connecting lines (on desktop)
      const lines = stepsRef.current?.querySelectorAll('.process-line')
      if (lines) {
        gsap.fromTo(
          lines,
          {
            scaleX: 0,
            transformOrigin: 'left center',
          },
          {
            scaleX: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: stepsRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative py-16 px-6 md:py-20 bg-carbon"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
            How I Work
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            A streamlined, collaborative approach from concept to launch. Every
            project follows these proven steps.
          </p>
        </div>

        {/* Process Steps - Desktop: Horizontal Timeline, Mobile: Vertical */}
        <div ref={stepsRef} className="space-y-8 lg:space-y-0">
          {/* Desktop Layout (hidden on mobile) */}
          <div className="hidden lg:flex justify-between items-start relative">
            {/* Connecting line background */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-carbon-lighter z-0"></div>

            {steps.map((step, index) => (
              <div key={step.number} className="relative flex-1 px-4 z-10">
                {/* Step Container */}
                <div className="flex flex-col items-center text-center">
                  {/* Number Circle */}
                  <div className="relative mb-6">
                    {/* Connecting line (except for last step) */}
                    {index < steps.length - 1 && (
                      <div className="process-line absolute top-1/2 left-full w-full h-0.5 bg-moss-600"></div>
                    )}

                    {/* Circle with number */}
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-moss-600/20 to-moss-700/30 border-2 border-moss-600 flex items-center justify-center group hover:border-moss-500 hover:scale-110 transition-all duration-300 shadow-lg">
                      <span className="text-4xl font-bold text-moss-500 group-hover:text-moss-400 transition-colors">
                        {step.number}
                      </span>

                      {/* Glow effect on hover */}
                      <div className="absolute -inset-2 bg-moss-600/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Layout (vertical stack) */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex gap-6">
                {/* Left Side: Number + Line */}
                <div className="flex flex-col items-center">
                  {/* Number Circle */}
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-moss-600/20 to-moss-700/30 border-2 border-moss-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-bold text-moss-500">
                      {step.number}
                    </span>
                  </div>

                  {/* Connecting line (except for last step) */}
                  {index < steps.length - 1 && (
                    <div className="process-line w-0.5 flex-grow bg-moss-600/50 my-4"></div>
                  )}
                </div>

                {/* Right Side: Content */}
                <div className="flex-1 pb-8">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-text-secondary text-lg mb-6">
            Ready to get started? Let&apos;s turn your vision into reality.
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-moss-600 text-white font-semibold rounded-lg hover:bg-moss-500 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Start Your Project
          </a>
        </div>
      </div>
    </section>
  )
}

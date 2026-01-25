'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Testimonial {
  quote: string
  name: string
  company: string
  role: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Nicolas delivered our automation system ahead of schedule. The attention to detail and technical expertise was exceptional.',
    name: 'Production Manager',
    company: 'Major AV Company',
    role: 'Client Project',
  },
  {
    quote:
      'The AI Command Center transformed how we manage our daily workflows. Incredibly intuitive and powerful.',
    name: 'Tech Lead',
    company: 'Event Production Team',
    role: 'Internal Tool',
  },
  {
    quote:
      'Fast turnaround, clean code, and excellent communication throughout the project. Highly recommended.',
    name: 'Project Stakeholder',
    company: 'Enterprise Client',
    role: 'Contract Work',
  },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion || !cardsRef.current) {
      return
    }

    const cards = cardsRef.current.children
    const cardsElement = cardsRef.current

    // Staggered entrance animation
    gsap.fromTo(
      cards,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsElement,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      }
    )

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === cardsElement) {
          trigger.kill()
        }
      })
    }
  }, [])

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative py-16 px-6 md:py-20 bg-charcoal"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
            What Clients Say
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            Real feedback from production teams and project stakeholders who&apos;ve
            experienced the difference.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-carbon border border-border-subtle rounded-lg p-6 md:p-8 hover:border-moss-green/50 transition-all duration-300 group"
            >
              {/* Decorative Quote Mark */}
              <div className="absolute -top-4 -left-2 text-6xl md:text-7xl text-moss-green/20 font-serif leading-none select-none">
                &ldquo;
              </div>

              {/* Quote Text */}
              <blockquote className="relative z-10 mb-6">
                <p className="text-text-secondary text-base md:text-lg leading-relaxed italic">
                  {testimonial.quote}
                </p>
              </blockquote>

              {/* Attribution */}
              <div className="border-t border-border-subtle pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-primary font-semibold mb-1">
                      {testimonial.name}
                    </p>
                    <p className="text-text-tertiary text-sm">
                      {testimonial.company}
                    </p>
                  </div>
                  <span className="text-xs text-moss-green bg-moss-green/10 px-3 py-1 rounded-full whitespace-nowrap">
                    {testimonial.role}
                  </span>
                </div>
              </div>

              {/* Hover Effect Border Glow */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-moss-green/0 to-moss-green/0 group-hover:from-moss-green/5 group-hover:to-moss-green/10 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

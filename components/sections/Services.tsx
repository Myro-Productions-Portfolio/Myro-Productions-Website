'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ServiceCard, { type ServiceCardProps } from '@/components/ui/ServiceCard'
import RocketIcon from '@/components/icons/RocketIcon'
import GearsIcon from '@/components/icons/GearsIcon'
import BrainIcon from '@/components/icons/BrainIcon'
import BookingButton from '@/components/ui/BookingButton'

gsap.registerPlugin(ScrollTrigger)

const services: Omit<ServiceCardProps, 'index'>[] = [
  {
    icon: <RocketIcon />,
    title: 'Rapid Prototyping',
    description:
      'Transform ideas into working prototypes in days, not months. From concept sketches to functional MVPs that validate your vision.',
    benefits: [
      'Fast iteration cycles',
      'Reduced time-to-market',
      'Cost-effective validation',
    ],
  },
  {
    icon: <GearsIcon />,
    title: 'Automation Solutions',
    description:
      'Eliminate repetitive tasks and streamline workflows with custom automation scripts and integrations tailored to your needs.',
    benefits: [
      'Increased efficiency',
      'Reduced human error',
      'Scalable processes',
    ],
  },
  {
    icon: <BrainIcon />,
    title: 'AI-Accelerated Development',
    description:
      'Leverage cutting-edge AI tools to build smarter applications faster than traditional approaches, with intelligent features baked in.',
    benefits: [
      'Enhanced capabilities',
      'Intelligent features',
      'Future-proof solutions',
    ],
  },
]

export default function Services() {
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
      id="services"
      ref={sectionRef}
      className="relative py-16 px-6 md:py-20 bg-carbon"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4">
            What I Build
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            Specialized in transforming complex problems into elegant solutions
            using modern tools and proven methodologies.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <ServiceCard key={service.title} {...service} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-lg md:text-xl text-text-secondary mb-6 max-w-2xl mx-auto">
            Ready to accelerate your project? Let&apos;s discuss how these services can help you achieve your goals faster.
          </p>
          <BookingButton
            variant="primary"
            size="lg"
          />
        </div>
      </div>
    </section>
  )
}

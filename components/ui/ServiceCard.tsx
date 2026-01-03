'use client'

import { type ReactNode, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '@/lib/animations'

export interface ServiceCardProps {
  icon: ReactNode
  title: string
  description: string
  benefits: string[]
  index?: number
}

export default function ServiceCard({
  icon,
  title,
  description,
  benefits,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const reducedMotion = prefersReducedMotion()

  const handleMouseEnter = () => {
    if (reducedMotion || !cardRef.current || !iconRef.current) return

    gsap.to(cardRef.current, {
      scale: 1.02,
      y: -8,
      duration: 0.3,
      ease: 'power2.out',
    })

    gsap.to(iconRef.current, {
      scale: 1.1,
      rotation: 5,
      duration: 0.3,
      ease: 'back.out(1.7)',
    })
  }

  const handleMouseLeave = () => {
    if (reducedMotion || !cardRef.current || !iconRef.current) return

    gsap.to(cardRef.current, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
    })

    gsap.to(iconRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-carbon-texture rounded-lg p-5 md:p-6 border-2 border-carbon-lighter transition-colors duration-300 hover:border-moss-600 hover:shadow-[0_10px_40px_rgba(79,209,197,0.15)] max-w-full"
      data-testid="service-card"
      style={{ willChange: reducedMotion ? 'auto' : 'transform' }}
    >
      {/* Icon Container */}
      <div ref={iconRef} className="mb-4 text-accent group-hover:text-accent-light transition-colors duration-300">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3 group-hover:text-accent-light transition-colors duration-300 break-words">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm md:text-base text-text-secondary mb-4 leading-relaxed break-words">
        {description}
      </p>

      {/* Benefits List */}
      <ul className="space-y-2" aria-label={`${title} benefits`}>
        {benefits.map((benefit, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm md:text-base text-text-secondary"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-moss-500 flex-shrink-0 mt-0.5"
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
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/5 to-moss-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}

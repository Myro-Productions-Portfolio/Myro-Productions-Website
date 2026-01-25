'use client'

import { useRef, ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { parallaxScroll, prefersReducedMotion } from '@/lib/animations'

interface ParallaxBackgroundProps {
  children: ReactNode
  speed?: number
  className?: string
  trigger?: string
  start?: string
  end?: string
  scrub?: number | boolean
}

/**
 * ParallaxBackground component
 *
 * Creates a parallax scrolling effect on its children
 * Automatically respects prefers-reduced-motion
 *
 * @param speed - Parallax speed multiplier (0.5 = half speed, 1 = normal, 2 = double speed)
 * @param className - Additional CSS classes
 * @param trigger - Custom scroll trigger element selector
 * @param start - ScrollTrigger start position
 * @param end - ScrollTrigger end position
 * @param scrub - ScrollTrigger scrub value (true, false, or number for smoothing)
 */
export default function ParallaxBackground({
  children,
  speed = 0.5,
  className = '',
  trigger,
  start = 'top bottom',
  end = 'bottom top',
  scrub = 1,
}: ParallaxBackgroundProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const reducedMotion = prefersReducedMotion()

  useGSAP(() => {
    if (!elementRef.current || reducedMotion) return

    const triggerElement = trigger
      ? document.querySelector(trigger)
      : elementRef.current

    if (!triggerElement) return

    const animation = parallaxScroll(elementRef.current, {
      speed,
      trigger: triggerElement,
      start,
      end,
      scrub,
    })

    return () => {
      animation.kill()
    }
  }, [speed, trigger, start, end, scrub, reducedMotion])

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        willChange: reducedMotion ? 'auto' : 'transform',
      }}
    >
      {children}
    </div>
  )
}

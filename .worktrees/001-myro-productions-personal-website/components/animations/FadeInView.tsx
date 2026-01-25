'use client'

import { useRef, ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeIn,
  scaleIn,
  prefersReducedMotion,
  DURATIONS,
  EASINGS,
} from '@/lib/animations'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none'

interface FadeInViewProps {
  children: ReactNode
  direction?: FadeDirection
  distance?: number
  duration?: number
  delay?: number
  ease?: string
  className?: string
  trigger?: 'onMount' | 'onScroll'
  threshold?: number
  once?: boolean
}

/**
 * FadeInView component
 *
 * Wrapper that fades in children when they enter the viewport
 * Supports multiple animation directions
 * Automatically respects prefers-reduced-motion
 *
 * @param direction - Animation direction (up, down, left, right, scale, none)
 * @param distance - Distance to travel in pixels (for directional animations)
 * @param duration - Animation duration in seconds
 * @param delay - Delay before animation starts
 * @param ease - GSAP easing function
 * @param className - Additional CSS classes
 * @param trigger - When to trigger animation ('onMount' or 'onScroll')
 * @param threshold - Percentage of element visible before triggering (0-1)
 * @param once - Whether animation should only play once
 */
export default function FadeInView({
  children,
  direction = 'up',
  distance = 60,
  duration = DURATIONS.normal,
  delay = 0,
  ease = EASINGS.smooth,
  className = '',
  trigger = 'onScroll',
  threshold = 0.2,
  once = true,
}: FadeInViewProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const reducedMotion = prefersReducedMotion()

  useGSAP(() => {
    if (!elementRef.current) return

    // Skip animation if reduced motion preferred
    if (reducedMotion) {
      gsap.set(elementRef.current, { opacity: 1 })
      return
    }

    const element = elementRef.current

    // Select animation function based on direction
    const animationFunctions = {
      up: fadeInUp,
      down: fadeInDown,
      left: fadeInLeft,
      right: fadeInRight,
      scale: scaleIn,
      none: fadeIn,
    }

    const animateFn = animationFunctions[direction]

    // Trigger on mount
    if (trigger === 'onMount') {
      animateFn(element, { distance, duration, ease, delay })
      return
    }

    // Trigger on scroll
    const animation = animateFn(element, { distance, duration, ease, delay })

    ScrollTrigger.create({
      trigger: element,
      start: `top ${(1 - threshold) * 100}%`,
      once,
      onEnter: () => animation.play(),
      onLeaveBack: () => {
        if (!once) animation.reverse()
      },
    })

    return () => {
      animation.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === element) {
          st.kill()
        }
      })
    }
  }, [direction, distance, duration, delay, ease, trigger, threshold, once, reducedMotion])

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: reducedMotion ? 1 : 0,
      }}
    >
      {children}
    </div>
  )
}

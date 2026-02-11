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
  STAGGER,
  EASINGS,
} from '@/lib/animations'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none'
type TriggerMode = 'onMount' | 'onScroll'

interface AnimateOnScrollProps {
  children: ReactNode
  direction?: AnimationDirection
  distance?: number
  duration?: number
  delay?: number
  ease?: string
  className?: string
  trigger?: TriggerMode
  threshold?: number
  once?: boolean
  
  // Stagger-specific props
  stagger?: number | boolean  // If provided, enables stagger mode
  childSelector?: string      // CSS selector for children to stagger
}

/**
 * AnimateOnScroll - Unified animation component
 * 
 * Handles both single-element animations and staggered children animations.
 * When `stagger` prop is provided, animates children with staggered timing.
 * Otherwise, animates the container element directly.
 * 
 * @param direction - Animation direction (up, down, left, right, scale, none)
 * @param distance - Distance to travel in pixels
 * @param duration - Animation duration in seconds
 * @param delay - Delay before animation starts
 * @param ease - GSAP easing function
 * @param className - Additional CSS classes
 * @param trigger - When to trigger animation ('onMount' or 'onScroll')
 * @param threshold - Percentage of element visible before triggering (0-1)
 * @param once - Whether animation should only play once
 * @param stagger - Enable stagger mode (number = stagger delay, true = use default)
 * @param childSelector - CSS selector for children to animate (stagger mode only)
 */
export default function AnimateOnScroll({
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
  stagger,
  childSelector = '> *',
}: AnimateOnScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = prefersReducedMotion()
  
  // Determine if stagger mode is enabled
  const isStaggerMode = stagger !== undefined
  const staggerDelay = typeof stagger === 'number' ? stagger : STAGGER.normal

  useGSAP(() => {
    if (!containerRef.current) return

    // Skip animation if reduced motion preferred
    if (reducedMotion) {
      if (isStaggerMode) {
        const children = containerRef.current.querySelectorAll(childSelector)
        gsap.set(children, { opacity: 1 })
      } else {
        gsap.set(containerRef.current, { opacity: 1 })
      }
      return
    }

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

    // STAGGER MODE: Animate children with staggered timing
    if (isStaggerMode) {
      const children = containerRef.current.querySelectorAll(childSelector)
      if (children.length === 0) return

      // Create timeline for staggered animation
      const tl = gsap.timeline({ paused: true })

      children.forEach((child, index) => {
        const childAnimation = animateFn(child, { distance, duration, ease })
        childAnimation.pause()
        tl.add(childAnimation.play(), index * staggerDelay)
      })

      // Trigger on mount
      if (trigger === 'onMount') {
        tl.play()
        return
      }

      // Trigger on scroll
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: `top ${(1 - threshold) * 100}%`,
        once,
        onEnter: () => tl.play(),
        onLeaveBack: () => {
          if (!once) tl.reverse()
        },
      })

      return () => {
        tl.kill()
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === containerRef.current) {
            st.kill()
          }
        })
      }
    }

    // SINGLE MODE: Animate container element
    const element = containerRef.current
    const animation = animateFn(element, { distance, duration, ease, delay })

    // Trigger on mount
    if (trigger === 'onMount') {
      animation.play()
      return
    }

    // Trigger on scroll
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
  }, [direction, distance, duration, delay, ease, trigger, threshold, once, isStaggerMode, staggerDelay, childSelector, reducedMotion])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        opacity: reducedMotion ? 1 : 0,
      }}
    >
      {children}
    </div>
  )
}

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

type AnimationType = 'up' | 'down' | 'left' | 'right' | 'scale'

interface StaggerChildrenProps {
  children: ReactNode
  childSelector?: string
  animation?: AnimationType
  stagger?: number
  distance?: number
  duration?: number
  ease?: string
  className?: string
  trigger?: 'onMount' | 'onScroll'
  threshold?: number
  once?: boolean
}

/**
 * StaggerChildren component
 *
 * Staggers animation of child elements with customizable timing
 * Automatically respects prefers-reduced-motion
 *
 * @param childSelector - CSS selector for children to animate (default: direct children)
 * @param animation - Type of animation (up, down, left, right, scale)
 * @param stagger - Delay between each child animation in seconds
 * @param distance - Distance to travel for directional animations
 * @param duration - Animation duration for each child
 * @param ease - GSAP easing function
 * @param className - Additional CSS classes
 * @param trigger - When to trigger animation ('onMount' or 'onScroll')
 * @param threshold - Percentage of element visible before triggering (0-1)
 * @param once - Whether animation should only play once
 */
export default function StaggerChildren({
  children,
  childSelector = '> *',
  animation = 'up',
  stagger = STAGGER.normal,
  distance = 60,
  duration = DURATIONS.normal,
  ease = EASINGS.smooth,
  className = '',
  trigger = 'onScroll',
  threshold = 0.2,
  once = true,
}: StaggerChildrenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = prefersReducedMotion()

  useGSAP(() => {
    if (!containerRef.current) return

    const children = containerRef.current.querySelectorAll(childSelector)
    if (children.length === 0) return

    // Skip animation if reduced motion preferred
    if (reducedMotion) {
      gsap.set(children, { opacity: 1 })
      return
    }

    // Map animation types to their functions
    const animationMap = {
      up: (el: Element) => fadeInUp(el, { distance, duration, ease }),
      down: (el: Element) => fadeInDown(el, { distance, duration, ease }),
      left: (el: Element) => fadeInLeft(el, { distance, duration, ease }),
      right: (el: Element) => fadeInRight(el, { distance, duration, ease }),
      scale: (el: Element) => scaleIn(el, { from: 0.8, duration, ease }),
    }

    const animateFn = animationMap[animation]

    // Create timeline for staggered animation
    const tl = gsap.timeline({ paused: true })

    children.forEach((child, index) => {
      const childAnimation = animateFn(child)
      childAnimation.pause()
      tl.add(childAnimation.play(), index * stagger)
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
  }, [childSelector, animation, stagger, distance, duration, ease, trigger, threshold, once, reducedMotion])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

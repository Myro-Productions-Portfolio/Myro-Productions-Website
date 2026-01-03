'use client'

import { ReactNode, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/animations'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface SmoothScrollProps {
  children: ReactNode
  smoothness?: number
}

/**
 * SmoothScroll component
 *
 * Wrapper that adds smooth momentum scrolling to the page
 * Respects prefers-reduced-motion and falls back to native smooth scrolling
 *
 * @param smoothness - Smoothing factor (higher = smoother but more delayed)
 */
export default function SmoothScroll({
  children,
  smoothness = 1.5,
}: SmoothScrollProps) {
  const reducedMotion = prefersReducedMotion()

  useEffect(() => {
    // Skip custom smooth scroll if reduced motion preferred
    // Native CSS smooth scroll will still work
    if (reducedMotion || typeof window === 'undefined') return

    // Normalize scroll wheel speed across browsers
    const normalizeWheel = (event: WheelEvent) => {
      const { deltaY, deltaMode } = event

      // Convert different delta modes to pixels
      let delta = deltaY

      if (deltaMode === 1) {
        // DOM_DELTA_LINE
        delta *= 16
      } else if (deltaMode === 2) {
        // DOM_DELTA_PAGE
        delta *= window.innerHeight
      }

      return delta
    }

    let targetY = window.scrollY
    let currentY = window.scrollY
    let rafId: number

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const delta = normalizeWheel(event)
      targetY += delta

      // Clamp to page bounds
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      targetY = Math.max(0, Math.min(targetY, maxScroll))
    }

    const updateScroll = () => {
      // Smooth interpolation
      currentY += (targetY - currentY) / (smoothness * 10)

      // Snap to target when close enough
      if (Math.abs(targetY - currentY) < 0.5) {
        currentY = targetY
      }

      window.scrollTo(0, currentY)

      // Update ScrollTrigger
      ScrollTrigger.update()

      rafId = requestAnimationFrame(updateScroll)
    }

    // Start animation loop
    rafId = requestAnimationFrame(updateScroll)

    // Add wheel listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [smoothness, reducedMotion])

  return <>{children}</>
}

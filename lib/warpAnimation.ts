/**
 * Warp Animation Utilities
 * Creates a "warp speed" transition effect for theme switching
 */

import { gsap } from 'gsap'

// Warp animation configuration
export const WARP_CONFIG = {
  // Total duration of the warp effect
  duration: 1.3,
  // Duration of the initial acceleration phase
  accelerationDuration: 0.45,
  // Duration of the deceleration phase
  decelerationDuration: 0.45,
  // Number of speed lines to render
  lineCount: 24,
  // Maximum stretch factor for speed lines
  maxStretch: 3,
  // Easing for acceleration
  accelerationEase: 'power2.in',
  // Easing for deceleration
  decelerationEase: 'power2.out',
  // Z-index for the overlay
  zIndex: 60,
} as const

export type Theme = 'dark' | 'light'

export interface WarpTimelineOptions {
  overlay: HTMLElement
  speedLines: HTMLElement[]
  onMidpoint?: () => void
}

/**
 * Creates a GSAP timeline for the warp transition effect
 *
 * The animation has 3 phases:
 * 1. Acceleration - lines stretch and overlay fades in
 * 2. Midpoint - theme change executes
 * 3. Deceleration - lines shrink and overlay fades out
 */
export function createWarpTimeline({
  overlay,
  speedLines,
  onMidpoint,
}: WarpTimelineOptions): gsap.core.Timeline {
  const tl = gsap.timeline()

  // Set initial states
  gsap.set(overlay, { opacity: 0, visibility: 'visible' })
  gsap.set(speedLines, { scaleY: 0.1, opacity: 0 })

  // Phase 1: Acceleration - overlay fades in, lines stretch
  tl.to(overlay, {
    opacity: 1,
    duration: WARP_CONFIG.accelerationDuration,
    ease: WARP_CONFIG.accelerationEase,
  }, 0)

  tl.to(speedLines, {
    scaleY: WARP_CONFIG.maxStretch,
    opacity: 1,
    duration: WARP_CONFIG.accelerationDuration,
    ease: WARP_CONFIG.accelerationEase,
    stagger: {
      each: 0.01,
      from: 'random',
    },
  }, 0)

  // Phase 2: Midpoint - execute theme change
  tl.add(() => {
    if (onMidpoint) {
      onMidpoint()
    }
  }, WARP_CONFIG.accelerationDuration)

  // Brief hold at peak intensity
  const holdDuration = WARP_CONFIG.duration - WARP_CONFIG.accelerationDuration - WARP_CONFIG.decelerationDuration

  // Phase 3: Deceleration - lines shrink and overlay fades out
  tl.to(speedLines, {
    scaleY: 0.1,
    opacity: 0,
    duration: WARP_CONFIG.decelerationDuration,
    ease: WARP_CONFIG.decelerationEase,
    stagger: {
      each: 0.01,
      from: 'random',
    },
  }, WARP_CONFIG.accelerationDuration + holdDuration)

  tl.to(overlay, {
    opacity: 0,
    duration: WARP_CONFIG.decelerationDuration,
    ease: WARP_CONFIG.decelerationEase,
    onComplete: () => {
      gsap.set(overlay, { visibility: 'hidden' })
    },
  }, WARP_CONFIG.accelerationDuration + holdDuration)

  return tl
}

/**
 * Get the gradient colors for the warp overlay based on theme
 */
export function getWarpGradientColors(theme: Theme): {
  center: string
  mid: string
  outer: string
} {
  if (theme === 'light') {
    return {
      center: 'rgba(255, 255, 255, 1)',
      mid: 'rgba(240, 240, 245, 0.95)',
      outer: 'rgba(220, 220, 230, 0.9)',
    }
  } else {
    return {
      center: 'rgba(10, 10, 15, 1)',
      mid: 'rgba(20, 20, 30, 0.95)',
      outer: 'rgba(30, 30, 45, 0.9)',
    }
  }
}

/**
 * Get speed line color based on theme
 */
export function getSpeedLineColor(theme: Theme): string {
  if (theme === 'light') {
    return 'rgba(100, 100, 120, 0.6)'
  } else {
    return 'rgba(200, 200, 220, 0.6)'
  }
}

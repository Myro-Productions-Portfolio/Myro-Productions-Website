/**
 * GSAP Animation Utilities
 * Common animation presets and helper functions for consistent animations across the site
 */

import { gsap } from 'gsap'

// Animation duration constants
export const DURATIONS = {
  instant: 0.2,
  fast: 0.4,
  normal: 0.6,
  slow: 0.8,
  slower: 1.2,
  slowest: 1.6,
} as const

// Animation easing presets
export const EASINGS = {
  smooth: 'power2.out',
  snappy: 'power3.out',
  elastic: 'elastic.out(1, 0.5)',
  bounce: 'bounce.out',
  linear: 'none',
  inOut: 'power2.inOut',
} as const

// Stagger timing
export const STAGGER = {
  tight: 0.05,
  normal: 0.1,
  relaxed: 0.15,
  loose: 0.2,
} as const

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get safe animation duration (instant if reduced motion preferred)
 */
export const getSafeDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0.01 : duration
}

/**
 * Fade in from bottom animation
 */
export const fadeInUp = (
  element: gsap.TweenTarget,
  options: {
    distance?: number
    duration?: number
    ease?: string
    delay?: number
  } = {}
): gsap.core.Tween => {
  const {
    distance = 60,
    duration = DURATIONS.normal,
    ease = EASINGS.smooth,
    delay = 0,
  } = options

  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: distance,
    },
    {
      opacity: 1,
      y: 0,
      duration: getSafeDuration(duration),
      ease,
      delay,
    }
  )
}

/**
 * Fade in from top animation
 */
export const fadeInDown = (
  element: gsap.TweenTarget,
  options: {
    distance?: number
    duration?: number
    ease?: string
    delay?: number
  } = {}
): gsap.core.Tween => {
  const {
    distance = 60,
    duration = DURATIONS.normal,
    ease = EASINGS.smooth,
    delay = 0,
  } = options

  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: -distance,
    },
    {
      opacity: 1,
      y: 0,
      duration: getSafeDuration(duration),
      ease,
      delay,
    }
  )
}

/**
 * Fade in from left animation
 */
export const fadeInLeft = (
  element: gsap.TweenTarget,
  options: {
    distance?: number
    duration?: number
    ease?: string
    delay?: number
  } = {}
): gsap.core.Tween => {
  const {
    distance = 60,
    duration = DURATIONS.normal,
    ease = EASINGS.smooth,
    delay = 0,
  } = options

  return gsap.fromTo(
    element,
    {
      opacity: 0,
      x: -distance,
    },
    {
      opacity: 1,
      x: 0,
      duration: getSafeDuration(duration),
      ease,
      delay,
    }
  )
}

/**
 * Fade in from right animation
 */
export const fadeInRight = (
  element: gsap.TweenTarget,
  options: {
    distance?: number
    duration?: number
    ease?: string
    delay?: number
  } = {}
): gsap.core.Tween => {
  const {
    distance = 60,
    duration = DURATIONS.normal,
    ease = EASINGS.smooth,
    delay = 0,
  } = options

  return gsap.fromTo(
    element,
    {
      opacity: 0,
      x: distance,
    },
    {
      opacity: 1,
      x: 0,
      duration: getSafeDuration(duration),
      ease,
      delay,
    }
  )
}

/**
 * Scale in animation
 */
export const scaleIn = (
  element: gsap.TweenTarget,
  options: {
    from?: number
    duration?: number
    ease?: string
    delay?: number
  } = {}
): gsap.core.Tween => {
  const {
    from = 0.8,
    duration = DURATIONS.normal,
    ease = EASINGS.snappy,
    delay = 0,
  } = options

  return gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: from,
    },
    {
      opacity: 1,
      scale: 1,
      duration: getSafeDuration(duration),
      ease,
      delay,
    }
  )
}

/**
 * Fade in animation (no directional movement)
 */
export const fadeIn = (
  element: gsap.TweenTarget,
  options: {
    duration?: number
    ease?: string
    delay?: number
  } = {}
): gsap.core.Tween => {
  const {
    duration = DURATIONS.normal,
    ease = EASINGS.smooth,
    delay = 0,
  } = options

  return gsap.fromTo(
    element,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: getSafeDuration(duration),
      ease,
      delay,
    }
  )
}

/**
 * Stagger children animation helper
 */
export const staggerChildren = (
  parent: Element,
  childSelector: string,
  animationFn: (element: Element) => gsap.core.Tween,
  staggerAmount: number = STAGGER.normal
): gsap.core.Timeline => {
  const children = parent.querySelectorAll(childSelector)
  const tl = gsap.timeline()

  children.forEach((child, index) => {
    tl.add(animationFn(child), index * getSafeDuration(staggerAmount))
  })

  return tl
}

/**
 * Parallax scroll effect
 */
export const parallaxScroll = (
  element: gsap.TweenTarget,
  options: {
    speed?: number
    trigger?: gsap.DOMTarget
    start?: string
    end?: string
    scrub?: number | boolean
  } = {}
): gsap.core.Tween => {
  if (prefersReducedMotion()) {
    return gsap.to(element, {}) // Return empty tween
  }

  const {
    speed = 0.5,
    trigger = element,
    start = 'top bottom',
    end = 'bottom top',
    scrub = 1,
  } = options

  return gsap.to(element, {
    yPercent: speed * 100,
    ease: 'none',
    scrollTrigger: {
      trigger: trigger as gsap.DOMTarget,
      start,
      end,
      scrub,
    },
  })
}

/**
 * Shake animation (for error states)
 */
export const shake = (
  element: gsap.TweenTarget,
  options: {
    intensity?: number
    duration?: number
  } = {}
): gsap.core.Tween => {
  const {
    intensity = 10,
    duration = DURATIONS.fast,
  } = options

  return gsap.fromTo(
    element,
    { x: 0 },
    {
      x: intensity,
      duration: getSafeDuration(duration / 6),
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut',
    }
  )
}

/**
 * Pulse animation
 */
export const pulse = (
  element: gsap.TweenTarget,
  options: {
    scale?: number
    duration?: number
    repeat?: number
  } = {}
): gsap.core.Tween => {
  const {
    scale = 1.05,
    duration = DURATIONS.slow,
    repeat = -1, // Infinite by default
  } = options

  if (prefersReducedMotion()) {
    return gsap.to(element, {}) // Return empty tween
  }

  return gsap.to(element, {
    scale,
    duration,
    repeat,
    yoyo: true,
    ease: 'power1.inOut',
  })
}

/**
 * Float animation (subtle vertical movement)
 */
export const float = (
  element: gsap.TweenTarget,
  options: {
    distance?: number
    duration?: number
    repeat?: number
  } = {}
): gsap.core.Tween => {
  const {
    distance = 15,
    duration = DURATIONS.slower,
    repeat = -1, // Infinite by default
  } = options

  if (prefersReducedMotion()) {
    return gsap.to(element, {}) // Return empty tween
  }

  return gsap.to(element, {
    y: distance,
    duration,
    repeat,
    yoyo: true,
    ease: 'power1.inOut',
  })
}

/**
 * Rotate animation
 */
export const rotate = (
  element: gsap.TweenTarget,
  options: {
    degrees?: number
    duration?: number
    ease?: string
    delay?: number
  } = {}
): gsap.core.Tween => {
  const {
    degrees = 360,
    duration = DURATIONS.normal,
    ease = EASINGS.smooth,
    delay = 0,
  } = options

  return gsap.fromTo(
    element,
    { rotation: 0 },
    {
      rotation: degrees,
      duration: getSafeDuration(duration),
      ease,
      delay,
    }
  )
}

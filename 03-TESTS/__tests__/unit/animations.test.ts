/**
 * @jest-environment jsdom
 */

import gsap from 'gsap'
import {
  DURATIONS,
  EASINGS,
  STAGGER,
  prefersReducedMotion,
  getSafeDuration,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  fadeIn,
  scaleIn,
  shake,
  pulse,
  float,
  rotate,
  parallaxScroll,
} from '@/lib/animations'

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

describe('Animation Constants', () => {
  test('DURATIONS should have expected values', () => {
    expect(DURATIONS.instant).toBe(0.2)
    expect(DURATIONS.fast).toBe(0.4)
    expect(DURATIONS.normal).toBe(0.6)
    expect(DURATIONS.slow).toBe(0.8)
    expect(DURATIONS.slower).toBe(1.2)
    expect(DURATIONS.slowest).toBe(1.6)
  })

  test('EASINGS should have expected values', () => {
    expect(EASINGS.smooth).toBe('power2.out')
    expect(EASINGS.snappy).toBe('power3.out')
    expect(EASINGS.elastic).toBe('elastic.out(1, 0.5)')
    expect(EASINGS.bounce).toBe('bounce.out')
    expect(EASINGS.linear).toBe('none')
    expect(EASINGS.inOut).toBe('power2.inOut')
  })

  test('STAGGER should have expected values', () => {
    expect(STAGGER.tight).toBe(0.05)
    expect(STAGGER.normal).toBe(0.1)
    expect(STAGGER.relaxed).toBe(0.15)
    expect(STAGGER.loose).toBe(0.2)
  })
})

describe('prefersReducedMotion', () => {
  test('should return true when user prefers reduced motion', () => {
    mockMatchMedia(true)
    expect(prefersReducedMotion()).toBe(true)
  })

  test('should return false when user does not prefer reduced motion', () => {
    mockMatchMedia(false)
    expect(prefersReducedMotion()).toBe(false)
  })
})

describe('getSafeDuration', () => {
  test('should return 0.01 when reduced motion is preferred', () => {
    mockMatchMedia(true)
    expect(getSafeDuration(1.0)).toBe(0.01)
  })

  test('should return original duration when reduced motion is not preferred', () => {
    mockMatchMedia(false)
    expect(getSafeDuration(1.0)).toBe(1.0)
  })
})

describe('Animation Functions', () => {
  let element: HTMLDivElement

  beforeEach(() => {
    mockMatchMedia(false) // Enable animations by default
    element = document.createElement('div')
    document.body.appendChild(element)
  })

  afterEach(() => {
    document.body.removeChild(element)
    gsap.killTweensOf(element)
  })

  describe('fadeInUp', () => {
    test('should create animation from bottom with default options', () => {
      const tween = fadeInUp(element)
      expect(tween).toBeDefined()
      expect(tween.vars.duration).toBe(DURATIONS.normal)
    })

    test('should accept custom options', () => {
      const tween = fadeInUp(element, {
        distance: 100,
        duration: 1.0,
        ease: 'linear',
        delay: 0.5,
      })
      expect(tween.vars.duration).toBe(1.0)
      expect(tween.vars.delay).toBe(0.5)
    })

    test('should use reduced duration when motion is reduced', () => {
      mockMatchMedia(true)
      const tween = fadeInUp(element)
      expect(tween.vars.duration).toBe(0.01)
    })
  })

  describe('fadeInDown', () => {
    test('should create animation from top', () => {
      const tween = fadeInDown(element)
      expect(tween).toBeDefined()
    })
  })

  describe('fadeInLeft', () => {
    test('should create animation from left', () => {
      const tween = fadeInLeft(element)
      expect(tween).toBeDefined()
    })
  })

  describe('fadeInRight', () => {
    test('should create animation from right', () => {
      const tween = fadeInRight(element)
      expect(tween).toBeDefined()
    })
  })

  describe('fadeIn', () => {
    test('should create simple fade animation', () => {
      const tween = fadeIn(element)
      expect(tween).toBeDefined()
      expect(tween.vars.duration).toBe(DURATIONS.normal)
    })
  })

  describe('scaleIn', () => {
    test('should create scale animation with default from value', () => {
      const tween = scaleIn(element)
      expect(tween).toBeDefined()
    })

    test('should accept custom from value', () => {
      const tween = scaleIn(element, { from: 0.5 })
      expect(tween).toBeDefined()
    })
  })

  describe('shake', () => {
    test('should create shake animation with default intensity', () => {
      const tween = shake(element)
      expect(tween).toBeDefined()
      expect(tween.vars.repeat).toBe(5)
      expect(tween.vars.yoyo).toBe(true)
    })

    test('should accept custom intensity and duration', () => {
      const tween = shake(element, { intensity: 20, duration: 0.8 })
      expect(tween).toBeDefined()
    })
  })

  describe('pulse', () => {
    test('should create pulse animation with infinite repeat', () => {
      const tween = pulse(element)
      expect(tween).toBeDefined()
      expect(tween.vars.repeat).toBe(-1)
      expect(tween.vars.yoyo).toBe(true)
    })

    test('should return empty tween when reduced motion is preferred', () => {
      mockMatchMedia(true)
      const tween = pulse(element)
      expect(tween).toBeDefined()
      // Empty tween should have no duration or target changes
    })
  })

  describe('float', () => {
    test('should create floating animation with infinite repeat', () => {
      const tween = float(element)
      expect(tween).toBeDefined()
      expect(tween.vars.repeat).toBe(-1)
      expect(tween.vars.yoyo).toBe(true)
    })

    test('should return empty tween when reduced motion is preferred', () => {
      mockMatchMedia(true)
      const tween = float(element)
      expect(tween).toBeDefined()
    })
  })

  describe('rotate', () => {
    test('should create rotation animation with default 360 degrees', () => {
      const tween = rotate(element)
      expect(tween).toBeDefined()
    })

    test('should accept custom rotation degrees', () => {
      const tween = rotate(element, { degrees: 180 })
      expect(tween).toBeDefined()
    })
  })

  describe('parallaxScroll', () => {
    test('should create parallax scroll animation', () => {
      const tween = parallaxScroll(element)
      expect(tween).toBeDefined()
    })

    test('should return empty tween when reduced motion is preferred', () => {
      mockMatchMedia(true)
      const tween = parallaxScroll(element)
      expect(tween).toBeDefined()
    })

    test('should accept custom scroll trigger options', () => {
      const tween = parallaxScroll(element, {
        speed: 0.8,
        start: 'top center',
        end: 'bottom center',
        scrub: 2,
      })
      expect(tween).toBeDefined()
    })
  })
})

describe('Animation Performance', () => {
  test('all animation functions should return GSAP tweens', () => {
    mockMatchMedia(false)
    const element = document.createElement('div')

    const animations = [
      fadeInUp(element),
      fadeInDown(element),
      fadeInLeft(element),
      fadeInRight(element),
      fadeIn(element),
      scaleIn(element),
      shake(element),
      pulse(element),
      float(element),
      rotate(element),
    ]

    animations.forEach((animation) => {
      expect(animation).toBeDefined()
      expect(typeof animation.kill).toBe('function')
      expect(typeof animation.play).toBe('function')
      expect(typeof animation.pause).toBe('function')
    })

    // Cleanup
    animations.forEach((animation) => animation.kill())
  })

  test('animations should respect reduced motion preference', () => {
    mockMatchMedia(true)
    const element = document.createElement('div')

    const duration1 = fadeInUp(element).vars.duration
    const duration2 = scaleIn(element).vars.duration

    expect(duration1).toBe(0.01)
    expect(duration2).toBe(0.01)

    gsap.killTweensOf(element)
  })
})

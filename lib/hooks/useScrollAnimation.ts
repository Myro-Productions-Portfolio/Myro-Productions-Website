/**
 * useScrollAnimation - Reusable hook for GSAP ScrollTrigger animations
 *
 * This hook provides consistent scroll-triggered animations across the site.
 * All animations respect user's motion preferences.
 */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  /**
   * Animation direction
   */
  from?: 'top' | 'bottom' | 'left' | 'right' | 'scale';

  /**
   * Animation duration in seconds
   * @default 0.7
   */
  duration?: number;

  /**
   * GSAP easing function
   * @default 'power2.out'
   */
  ease?: string;

  /**
   * Delay before animation starts (seconds)
   * @default 0
   */
  delay?: number;

  /**
   * Distance to move (in pixels)
   * @default 50
   */
  distance?: number;

  /**
   * When to trigger the animation (ScrollTrigger start position)
   * @default 'top 80%'
   */
  start?: string;

  /**
   * Whether to stagger child elements
   * @default false
   */
  stagger?: number | false;

  /**
   * Whether to animate children instead of the element itself
   * @default false
   */
  animateChildren?: boolean;
}

/**
 * Hook that applies scroll-triggered entrance animations to a ref
 *
 * @example
 * ```tsx
 * const ref = useScrollAnimation({ from: 'bottom', duration: 0.8 });
 * return <div ref={ref}>Content</div>;
 * ```
 */
export function useScrollAnimation<T extends HTMLElement>(
  options: ScrollAnimationOptions = {}
) {
  const {
    from = 'bottom',
    duration = 0.7,
    ease = 'power2.out',
    delay = 0,
    distance = 50,
    start = 'top 80%',
    stagger = false,
    animateChildren = false,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || !ref.current) {
      return;
    }

    const element = ref.current;
    const target = animateChildren ? element.children : element;

    if (!target || (animateChildren && element.children.length === 0)) {
      return;
    }

    // Determine initial state based on direction
    const fromVars: gsap.TweenVars = { opacity: 0 };
    const toVars: gsap.TweenVars = { opacity: 1 };

    switch (from) {
      case 'top':
        fromVars.y = -distance;
        toVars.y = 0;
        break;
      case 'bottom':
        fromVars.y = distance;
        toVars.y = 0;
        break;
      case 'left':
        fromVars.x = -distance;
        toVars.x = 0;
        break;
      case 'right':
        fromVars.x = distance;
        toVars.x = 0;
        break;
      case 'scale':
        fromVars.scale = 0.9;
        toVars.scale = 1;
        break;
    }

    // Apply animation
    const animation = gsap.fromTo(target, fromVars, {
      ...toVars,
      duration,
      ease,
      delay,
      stagger: stagger || undefined,
      scrollTrigger: {
        trigger: element,
        start,
        toggleActions: 'play none none none',
      },
    });

    // Cleanup
    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [from, duration, ease, delay, distance, start, stagger, animateChildren]);

  return ref;
}

/**
 * Hook for staggered animations of child elements
 * Perfect for lists, grids, or any group of items
 *
 * @example
 * ```tsx
 * const ref = useStaggerAnimation({ stagger: 0.1, from: 'bottom' });
 * return (
 *   <div ref={ref}>
 *     <div>Item 1</div>
 *     <div>Item 2</div>
 *     <div>Item 3</div>
 *   </div>
 * );
 * ```
 */
export function useStaggerAnimation<T extends HTMLElement>(
  options: Omit<ScrollAnimationOptions, 'animateChildren'> = {}
) {
  return useScrollAnimation<T>({
    ...options,
    animateChildren: true,
    stagger: options.stagger ?? 0.1,
  });
}

/**
 * Hook for fade-in animations (no directional movement)
 *
 * @example
 * ```tsx
 * const ref = useFadeIn({ duration: 1.0 });
 * return <div ref={ref}>Fade in content</div>;
 * ```
 */
export function useFadeIn<T extends HTMLElement>(
  options: Omit<ScrollAnimationOptions, 'from' | 'distance'> = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || !ref.current) {
      return;
    }

    const element = ref.current;
    const target = options.animateChildren ? element.children : element;

    if (!target || (options.animateChildren && element.children.length === 0)) {
      return;
    }

    const animation = gsap.fromTo(
      target,
      { opacity: 0 },
      {
        opacity: 1,
        duration: options.duration ?? 0.7,
        ease: options.ease ?? 'power2.out',
        delay: options.delay ?? 0,
        stagger: options.stagger || undefined,
        scrollTrigger: {
          trigger: element,
          start: options.start ?? 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [options]);

  return ref;
}

/**
 * Dynamic Imports for Performance Optimization
 *
 * This file provides reusable dynamic imports for heavy components
 * to reduce initial bundle size and improve First Load JS metrics.
 */

import dynamic from 'next/dynamic'

/**
 * Animation Components
 * These components use GSAP and should be loaded on-demand
 */
export const DynamicSmoothScroll = dynamic(
  () => import('@/components/animations/SmoothScroll'),
  {
    ssr: false,
    loading: () => null,
  }
)

export const DynamicPageLoader = dynamic(
  () => import('@/components/animations/PageLoader'),
  {
    ssr: false,
    loading: () => null,
  }
)

export const DynamicParallaxBackground = dynamic(
  () => import('@/components/animations/ParallaxBackground'),
  {
    ssr: false,
    loading: () => null,
  }
)

export const DynamicFadeInView = dynamic(
  () => import('@/components/animations/FadeInView'),
  {
    ssr: false,
    loading: () => null,
  }
)

export const DynamicStaggerChildren = dynamic(
  () => import('@/components/animations/StaggerChildren'),
  {
    ssr: false,
    loading: () => null,
  }
)

/**
 * Section Components
 * Heavy sections can be lazy-loaded below the fold
 */
export const DynamicPortfolio = dynamic(
  () => import('@/components/sections/Portfolio'),
  {
    ssr: true, // Keep SSR for SEO
  }
)

export const DynamicContact = dynamic(
  () => import('@/components/sections/Contact'),
  {
    ssr: true, // Keep SSR for SEO
  }
)

/**
 * GSAP Utilities
 * Load GSAP plugins only when needed
 */
export const loadGSAPPlugins = async () => {
  const gsapModule = await import('gsap')
  const scrollTriggerModule = await import('gsap/ScrollTrigger')
  const gsapReactModule = await import('@gsap/react')

  const { gsap } = gsapModule
  const { ScrollTrigger } = scrollTriggerModule
  const { useGSAP } = gsapReactModule

  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, useGSAP)
  }

  return { gsap, ScrollTrigger, useGSAP }
}

/**
 * Motion Library
 * Load motion library on-demand for animations
 */
export const loadMotion = async () => {
  const motionModule = await import('motion')
  return motionModule
}

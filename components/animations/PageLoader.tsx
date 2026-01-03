'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion, DURATIONS, EASINGS } from '@/lib/animations'

interface PageLoaderProps {
  minDuration?: number
  maxDuration?: number
}

/**
 * PageLoader component
 *
 * Simple fade-out loader that reveals page content
 * Shows a minimal loading animation then smoothly fades out
 * Respects prefers-reduced-motion
 *
 * @param minDuration - Minimum time to show loader (ms)
 * @param maxDuration - Maximum time to show loader (ms)
 */
export default function PageLoader({
  minDuration = 800,
  maxDuration = 2000,
}: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)
  const reducedMotion = prefersReducedMotion()

  useEffect(() => {
    const startTime = Date.now()

    const handleLoad = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minDuration - elapsed)

      setTimeout(() => {
        if (loaderRef.current) {
          const duration = reducedMotion ? 0.01 : DURATIONS.normal

          gsap.to(loaderRef.current, {
            opacity: 0,
            duration,
            ease: EASINGS.smooth,
            onComplete: () => {
              setIsLoading(false)
            },
          })
        } else {
          setIsLoading(false)
        }
      }, remaining)
    }

    // Handle both initial load and navigations
    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    // Failsafe: always hide after maxDuration
    const failsafe = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
      }
    }, maxDuration)

    return () => {
      window.removeEventListener('load', handleLoad)
      clearTimeout(failsafe)
    }
  }, [minDuration, maxDuration, reducedMotion, isLoading])

  if (!isLoading) return null

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-carbon-dark"
      style={{
        opacity: 1,
      }}
    >
      <div className="text-center">
        {/* Logo or brand */}
        <div className="mb-8">
          <div className="text-4xl font-bold text-text-primary" role="heading" aria-level={1}>
            <span className="bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent">
              Myro Productions
            </span>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div
            className="absolute inset-0 border-4 border-accent/20 rounded-full"
            style={{
              animation: reducedMotion ? 'none' : 'spin 1.5s linear infinite',
            }}
          />
          <div
            className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full"
            style={{
              animation: reducedMotion ? 'none' : 'spin 1s linear infinite',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

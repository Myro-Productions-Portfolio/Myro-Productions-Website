'use client'

import { useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTheme } from '@/lib/ThemeContext'
import { createWarpTimeline, WARP_CONFIG, getWarpGradientColors, getSpeedLineColor } from '@/lib/warpAnimation'
import { prefersReducedMotion } from '@/lib/animations'

/**
 * WarpTransition component
 *
 * Displays a "warp speed" visual effect during theme transitions.
 * Features:
 * - Radial gradient tunnel effect
 * - Speed lines radiating from center
 * - Smooth acceleration and deceleration phases
 * - Respects prefers-reduced-motion
 */
export default function WarpTransition() {
  const { isTransitioning, pendingTheme, executeThemeChange } = useTheme()
  const overlayRef = useRef<HTMLDivElement>(null)
  const speedLinesRef = useRef<HTMLDivElement[]>([])
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  // Generate speed line angles evenly distributed around the circle
  const speedLineAngles = useMemo(() => {
    const angles: number[] = []
    for (let i = 0; i < WARP_CONFIG.lineCount; i++) {
      angles.push((360 / WARP_CONFIG.lineCount) * i)
    }
    return angles
  }, [])

  // Handle transition when isTransitioning changes
  useGSAP(() => {
    if (!isTransitioning || !pendingTheme) return

    // Check for reduced motion preference
    if (prefersReducedMotion()) {
      // Immediately execute theme change without animation
      executeThemeChange()
      return
    }

    const overlay = overlayRef.current
    const speedLines = speedLinesRef.current.filter(Boolean)

    if (!overlay || speedLines.length === 0) {
      // Fallback: execute theme change immediately if refs not ready
      executeThemeChange()
      return
    }

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    // Create and play the warp timeline
    timelineRef.current = createWarpTimeline({
      overlay,
      speedLines,
      onMidpoint: executeThemeChange,
    })

    timelineRef.current.play()

    // Cleanup on unmount
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [isTransitioning, pendingTheme, executeThemeChange])

  // Get colors based on pending theme (or default to dark)
  const themeForColors = pendingTheme || 'dark'
  const gradientColors = getWarpGradientColors(themeForColors)
  const lineColor = getSpeedLineColor(themeForColors)

  // Create radial gradient for tunnel effect
  const tunnelGradient = `radial-gradient(ellipse at center, ${gradientColors.center} 0%, ${gradientColors.mid} 40%, ${gradientColors.outer} 100%)`

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: WARP_CONFIG.zIndex,
        visibility: isTransitioning ? 'visible' : 'hidden',
        opacity: 0,
        background: tunnelGradient,
      }}
      aria-hidden="true"
    >
      {/* Speed lines container */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {speedLineAngles.map((angle, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) speedLinesRef.current[index] = el
            }}
            className="absolute origin-center"
            style={{
              width: '2px',
              height: '50vh',
              background: `linear-gradient(to top, transparent 0%, ${lineColor} 30%, ${lineColor} 70%, transparent 100%)`,
              transform: `rotate(${angle}deg) translateY(-25vh)`,
              transformOrigin: 'center bottom',
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Central glow effect */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${gradientColors.center} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* Outer vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${themeForColors === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)'} 100%)`,
        }}
      />
    </div>
  )
}

import { test, expect } from '@playwright/test'

/**
 * Performance Tests
 *
 * These tests verify that the website meets performance targets:
 * - First Load JS < 200kb (target: 150kb)
 * - Page load time < 3 seconds
 * - No layout shifts (CLS < 0.1)
 */

test.describe('Performance Metrics', () => {
  test('should load the homepage within 3 seconds', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded',
    })

    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000)
    console.log(`Page loaded in ${loadTime}ms`)
  })

  test('should have acceptable JavaScript bundle size', async ({ page }) => {
    const bundleSizes: number[] = []

    // Intercept all JavaScript requests
    page.on('response', (response) => {
      const url = response.url()
      if (url.includes('.js') && response.status() === 200) {
        response.body().then((body) => {
          const size = body.length
          bundleSizes.push(size)
        })
      }
    })

    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
    })

    // Wait for all bundle sizes to be collected
    await page.waitForTimeout(1000)

    const totalSize = bundleSizes.reduce((sum, size) => sum + size, 0)
    const totalKB = totalSize / 1024

    console.log(`Total JavaScript: ${totalKB.toFixed(2)} KB`)
    console.log(`Number of JS files: ${bundleSizes.length}`)

    // Target: under 200kb (generous, aiming for 150kb)
    expect(totalKB).toBeLessThan(200)
  })

  test('should have minimal layout shifts', async ({ page }) => {
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
    })

    // Measure Cumulative Layout Shift
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsScore = 0

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              clsScore += (entry as any).value
            }
          }
        })

        observer.observe({ type: 'layout-shift', buffered: true })

        // Wait 2 seconds to collect shifts
        setTimeout(() => {
          observer.disconnect()
          resolve(clsScore)
        }, 2000)
      })
    })

    console.log(`Cumulative Layout Shift: ${cls}`)

    // Target: CLS < 0.1 (Google's "Good" threshold)
    expect(cls).toBeLessThan(0.1)
  })

  test('should load fonts without blocking', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('http://localhost:3000')

    // Check if fonts are loaded
    const fontsLoaded = await page.evaluate(() => {
      return document.fonts.ready.then(() => true)
    })

    const fontLoadTime = Date.now() - startTime

    expect(fontsLoaded).toBe(true)
    console.log(`Fonts loaded in ${fontLoadTime}ms`)

    // Fonts should load quickly with display:swap
    expect(fontLoadTime).toBeLessThan(2000)
  })

  test('should have optimized images', async ({ page }) => {
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
    })

    // Check for next/image usage
    const images = await page.locator('img').all()

    for (const img of images) {
      const src = await img.getAttribute('src')
      const loading = await img.getAttribute('loading')

      // Images should use Next.js optimized paths or be lazy loaded
      if (src && !src.startsWith('data:')) {
        const isOptimized =
          src.includes('/_next/image') ||
          src.endsWith('.svg') ||
          loading === 'lazy'

        expect(isOptimized).toBe(true)
      }
    }
  })

  test('should have proper caching headers for static assets', async ({ page }) => {
    const cacheableResponses: string[] = []

    page.on('response', (response) => {
      const url = response.url()
      const headers = response.headers()

      // Check static assets
      if (
        url.includes('/_next/static/') ||
        /\.(jpg|jpeg|png|webp|avif|svg|gif|ico)$/.test(url)
      ) {
        const cacheControl = headers['cache-control']
        if (cacheControl && cacheControl.includes('immutable')) {
          cacheableResponses.push(url)
        }
      }
    })

    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
    })

    console.log(`Cacheable assets: ${cacheableResponses.length}`)

    // Should have at least some cacheable assets
    expect(cacheableResponses.length).toBeGreaterThan(0)
  })

  test('should measure Core Web Vitals', async ({ page }) => {
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
    })

    const vitals = await page.evaluate(() => {
      return new Promise<{
        LCP?: number
        FID?: number
        CLS?: number
        FCP?: number
        TTFB?: number
      }>((resolve) => {
        const metrics: any = {}

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          metrics.LCP = lastEntry.startTime
        }).observe({ type: 'largest-contentful-paint', buffered: true })

        // First Input Delay
        new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0] as any
          metrics.FID = firstInput.processingStart - firstInput.startTime
        }).observe({ type: 'first-input', buffered: true })

        // Cumulative Layout Shift
        let clsScore = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value
            }
          }
          metrics.CLS = clsScore
        }).observe({ type: 'layout-shift', buffered: true })

        // First Contentful Paint
        const navigation = performance.getEntriesByType('navigation')[0] as any
        metrics.FCP = navigation?.domContentLoadedEventEnd
        metrics.TTFB = navigation?.responseStart

        setTimeout(() => resolve(metrics), 3000)
      })
    })

    console.log('Core Web Vitals:')
    console.log(`  LCP: ${vitals.LCP?.toFixed(2)}ms (target: < 2500ms)`)
    console.log(`  FID: ${vitals.FID?.toFixed(2)}ms (target: < 100ms)`)
    console.log(`  CLS: ${vitals.CLS?.toFixed(3)} (target: < 0.1)`)
    console.log(`  FCP: ${vitals.FCP?.toFixed(2)}ms (target: < 1800ms)`)
    console.log(`  TTFB: ${vitals.TTFB?.toFixed(2)}ms (target: < 800ms)`)

    // Assert targets
    if (vitals.LCP) expect(vitals.LCP).toBeLessThan(2500)
    if (vitals.CLS) expect(vitals.CLS).toBeLessThan(0.1)
    if (vitals.FCP) expect(vitals.FCP).toBeLessThan(1800)
  })
})

# Performance Optimization Recipes

Quick copy-paste solutions for common performance improvements.

## Recipe 1: Lazy Load Below-Fold Sections

**Problem:** Portfolio and Contact sections load on initial page load but aren't visible.

**Solution:**
```typescript
// In app/page.tsx
import { DynamicPortfolio, DynamicContact } from '@/lib/dynamic-imports'
// Remove: import Portfolio from '@/components/sections/Portfolio'
// Remove: import Contact from '@/components/sections/Contact'

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <DynamicPortfolio />  {/* Changed */}
      <About />
      <DynamicContact />     {/* Changed */}
    </main>
  )
}
```

**Expected Gain:** -10-15kb initial bundle

---

## Recipe 2: Conditional GSAP Loading for Mobile

**Problem:** Heavy GSAP animations load on mobile where they're often disabled.

**Solution:**
```typescript
// Create: hooks/useDesktop.ts
'use client'
import { useEffect, useState } from 'react'

export function useDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isDesktop
}

// In components/sections/Hero.tsx
import { useDesktop } from '@/hooks/useDesktop'
import { loadGSAPPlugins } from '@/lib/dynamic-imports'

export default function Hero() {
  const isDesktop = useDesktop()

  useEffect(() => {
    if (!isDesktop) return // Skip GSAP on mobile

    loadGSAPPlugins().then(({ gsap, ScrollTrigger }) => {
      // Run animations
    })
  }, [isDesktop])

  // Rest of component
}
```

**Expected Gain:** -45kb on mobile devices

---

## Recipe 3: Optimize Images for Production

**Problem:** Large unoptimized images slow down page load.

**Solution:**
```typescript
// When adding images, always use next/image
import Image from 'next/image'

<Image
  src="/portfolio/project-1.jpg"
  alt="Project description"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="/placeholder-md.svg"
  quality={85}  // Lower quality for non-hero images
  priority={false}  // Only true for above-fold images
  loading="lazy"
/>
```

**Image Preparation:**
1. Resize to exact display size (don't rely on CSS)
2. Compress with ImageOptim, Squoosh, or Sharp
3. Target: < 200kb per image
4. Use WebP or AVIF format when possible

**Example Script:**
```bash
# Using Sharp CLI (install: npm i -g sharp-cli)
sharp -i original.jpg -o optimized.webp --webp quality=85
```

---

## Recipe 4: Preload Critical Assets

**Problem:** Fonts or images load late, causing layout shifts.

**Solution:**
```typescript
// In app/layout.tsx, add to <head>:
<head>
  <link rel="preload" href="/hero-background.webp" as="image" type="image/webp" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://analytics.google.com" />
</head>
```

**When to preload:**
- ✅ Hero images (above the fold)
- ✅ Custom fonts (already done with next/font)
- ❌ Below-fold images (use lazy loading instead)
- ❌ Third-party scripts (use next/script with strategy)

---

## Recipe 5: Debounce Scroll Listeners

**Problem:** Scroll handlers fire too frequently, blocking main thread.

**Solution:**
```typescript
// Create: lib/useDebounce.ts
'use client'
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage in scroll handler:
const [scrollY, setScrollY] = useState(0)
const debouncedScrollY = useDebounce(scrollY, 100)

useEffect(() => {
  const handleScroll = () => setScrollY(window.scrollY)
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

useEffect(() => {
  // Heavy computation only runs every 100ms
  updateParallax(debouncedScrollY)
}, [debouncedScrollY])
```

---

## Recipe 6: Reduce Animation Complexity

**Problem:** Too many simultaneous animations cause jank.

**Solution:**
```typescript
// Instead of animating many elements:
gsap.to('.particle', { /* ... */ }) // Animates 100 particles

// Use CSS for simple animations:
.particle {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

// Or use will-change sparingly:
.animated-element {
  will-change: transform; /* Only on elements actively animating */
}

// Remove will-change after animation:
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto'
})
```

---

## Recipe 7: Bundle Analyzer Setup

**Problem:** Don't know which dependencies are largest.

**Solution:**
```bash
npm install --save-dev @next/bundle-analyzer
```

```typescript
// Update next.config.ts:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // ... existing config
}

module.exports = withBundleAnalyzer(nextConfig)
```

```bash
# Run analyzer:
npm run analyze
# Opens interactive treemap in browser
```

**What to look for:**
- Unexpected large dependencies
- Duplicate packages
- Unused code that can be removed

---

## Recipe 8: Service Worker for Caching

**Problem:** Every visit downloads assets again.

**Solution:**
```typescript
// Install workbox:
npm install --save-dev workbox-webpack-plugin

// Create: public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/globals.css',
        // Add critical assets
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

// Register in app/layout.tsx:
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
}, [])
```

**Note:** Test thoroughly - service workers can cause caching issues in development.

---

## Recipe 9: Third-Party Script Optimization

**Problem:** Analytics/ads block page load.

**Solution:**
```typescript
// Use next/script with strategy:
import Script from 'next/script'

// In app/layout.tsx:
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
  strategy="afterInteractive"  // Loads after page is interactive
/>

// For non-critical scripts:
<Script
  src="https://widget.com/script.js"
  strategy="lazyOnload"  // Loads during idle time
/>
```

**Strategies:**
- `beforeInteractive` - Critical scripts (rare)
- `afterInteractive` - Analytics, tag managers
- `lazyOnload` - Chat widgets, social media embeds

---

## Recipe 10: Measure Performance in CI

**Problem:** Performance regressions go unnoticed.

**Solution:**
```yaml
# .github/workflows/performance.yml
name: Performance

on: [pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npm run perf
      - name: Check bundle size
        run: |
          SIZE=$(ls -lh .next/static/chunks/*.js | awk '{sum += $5} END {print sum}')
          if [ "$SIZE" -gt 200000 ]; then
            echo "Bundle too large: ${SIZE}kb"
            exit 1
          fi
```

---

## Quick Wins Checklist

Priority optimizations ranked by effort vs. impact:

**High Impact, Low Effort:**
- [ ] Lazy load Portfolio and Contact sections (Recipe 1)
- [ ] Add bundle analyzer (Recipe 7)
- [ ] Optimize any existing images (Recipe 3)

**High Impact, Medium Effort:**
- [ ] Conditional GSAP on mobile (Recipe 2)
- [ ] Add service worker (Recipe 8)

**Medium Impact, Low Effort:**
- [ ] Preload hero image (Recipe 4)
- [ ] Optimize third-party scripts (Recipe 9)

**Ongoing:**
- [ ] Monitor bundle size in CI (Recipe 10)
- [ ] Review bundle analyzer monthly

---

**Need help?** Check `docs/PERFORMANCE-OPTIMIZATION.md` for detailed explanations.

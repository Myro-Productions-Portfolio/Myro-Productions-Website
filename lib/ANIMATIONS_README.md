# Animation System Documentation

Comprehensive GSAP-based animation system for the Myro Productions website.

## Overview

This animation system provides:
- Reusable animation utility functions
- React components for common animation patterns
- Automatic `prefers-reduced-motion` support
- 60fps performance optimizations
- Type-safe TypeScript definitions

## Core Utilities (`lib/animations.ts`)

### Constants

```typescript
import { DURATIONS, EASINGS, STAGGER } from '@/lib/animations'

// Duration presets (in seconds)
DURATIONS.instant  // 0.2s
DURATIONS.fast     // 0.4s
DURATIONS.normal   // 0.6s
DURATIONS.slow     // 0.8s
DURATIONS.slower   // 1.2s
DURATIONS.slowest  // 1.6s

// Easing functions
EASINGS.smooth    // 'power2.out'
EASINGS.snappy    // 'power3.out'
EASINGS.elastic   // 'elastic.out(1, 0.5)'
EASINGS.bounce    // 'bounce.out'
EASINGS.linear    // 'none'
EASINGS.inOut     // 'power2.inOut'

// Stagger timing (in seconds)
STAGGER.tight      // 0.05s
STAGGER.normal     // 0.1s
STAGGER.relaxed    // 0.15s
STAGGER.loose      // 0.2s
```

### Entrance Animations

#### fadeInUp
Fade in from bottom with customizable distance.

```typescript
import { fadeInUp } from '@/lib/animations'

fadeInUp(element, {
  distance: 60,        // pixels to travel
  duration: 0.6,       // animation duration
  ease: 'power2.out',  // easing function
  delay: 0             // delay before start
})
```

#### fadeInDown
Fade in from top.

```typescript
fadeInDown(element, { distance: 60, duration: 0.6 })
```

#### fadeInLeft
Fade in from left.

```typescript
fadeInLeft(element, { distance: 60, duration: 0.6 })
```

#### fadeInRight
Fade in from right.

```typescript
fadeInRight(element, { distance: 60, duration: 0.6 })
```

#### fadeIn
Simple fade in (no directional movement).

```typescript
fadeIn(element, { duration: 0.6, ease: 'power2.out' })
```

#### scaleIn
Scale up from smaller size.

```typescript
scaleIn(element, {
  from: 0.8,           // starting scale
  duration: 0.6,
  ease: 'power3.out'
})
```

### Continuous Animations

#### float
Subtle vertical floating motion (infinite loop).

```typescript
import { float } from '@/lib/animations'

float(element, {
  distance: 15,     // vertical travel distance
  duration: 1.6,    // one cycle duration
  repeat: -1        // infinite (-1) or specific count
})
```

#### pulse
Gentle scale pulsing (infinite loop).

```typescript
pulse(element, {
  scale: 1.05,      // maximum scale
  duration: 0.8,
  repeat: -1
})
```

#### rotate
Rotation animation.

```typescript
rotate(element, {
  degrees: 360,     // rotation angle
  duration: 0.6,
  ease: 'power2.out'
})
```

### Special Effects

#### parallaxScroll
ScrollTrigger-based parallax effect.

```typescript
import { parallaxScroll } from '@/lib/animations'

parallaxScroll(element, {
  speed: 0.5,             // multiplier (0.5 = half scroll speed)
  trigger: element,       // scroll trigger element
  start: 'top bottom',    // when to start
  end: 'bottom top',      // when to end
  scrub: 1                // smooth scrubbing (1 second lag)
})
```

#### shake
Shake animation for error states.

```typescript
import { shake } from '@/lib/animations'

shake(element, {
  intensity: 10,    // shake distance in pixels
  duration: 0.4     // total animation time
})
```

### Utility Functions

#### prefersReducedMotion
Check if user has reduced motion enabled.

```typescript
import { prefersReducedMotion } from '@/lib/animations'

if (prefersReducedMotion()) {
  // Skip or simplify animations
}
```

#### getSafeDuration
Get animation-safe duration (returns 0.01s if reduced motion enabled).

```typescript
import { getSafeDuration } from '@/lib/animations'

const duration = getSafeDuration(0.6) // 0.6s or 0.01s if reduced motion
```

## React Components

### ParallaxBackground

Creates parallax scrolling effect on children.

```tsx
import ParallaxBackground from '@/components/animations/ParallaxBackground'

<ParallaxBackground
  speed={0.5}           // parallax speed (default: 0.5)
  className="..."       // additional classes
  trigger="#section"    // custom trigger selector
  start="top bottom"    // scroll start position
  end="bottom top"      // scroll end position
  scrub={1}             // smoothing (true, false, or number)
>
  <div>Content with parallax effect</div>
</ParallaxBackground>
```

### FadeInView

Wrapper that fades in children when they enter viewport.

```tsx
import FadeInView from '@/components/animations/FadeInView'

<FadeInView
  direction="up"        // 'up' | 'down' | 'left' | 'right' | 'scale' | 'none'
  distance={60}         // travel distance in pixels
  duration={0.6}        // animation duration
  delay={0}             // delay before animation
  ease="power2.out"     // easing function
  trigger="onScroll"    // 'onMount' | 'onScroll'
  threshold={0.2}       // viewport intersection (0-1)
  once={true}           // only animate once?
>
  <div>Content that fades in</div>
</FadeInView>
```

**Example:**
```tsx
<FadeInView direction="up" duration={0.8}>
  <h2>This heading fades in from bottom on scroll</h2>
</FadeInView>

<FadeInView direction="scale" trigger="onMount">
  <button>This button scales in immediately</button>
</FadeInView>
```

### StaggerChildren

Staggers animation of child elements.

```tsx
import StaggerChildren from '@/components/animations/StaggerChildren'

<StaggerChildren
  childSelector="> *"   // CSS selector for children
  animation="up"        // 'up' | 'down' | 'left' | 'right' | 'scale'
  stagger={0.1}         // delay between each child
  distance={60}         // travel distance for directional animations
  duration={0.6}        // each child's animation duration
  ease="power2.out"     // easing function
  trigger="onScroll"    // 'onMount' | 'onScroll'
  threshold={0.2}       // viewport intersection
  once={true}           // only animate once?
>
  <div>Child 1</div>
  <div>Child 2</div>
  <div>Child 3</div>
</StaggerChildren>
```

**Example:**
```tsx
// Stagger cards from bottom
<StaggerChildren animation="up" stagger={0.15}>
  {projects.map(project => (
    <ProjectCard key={project.id} {...project} />
  ))}
</StaggerChildren>

// Stagger list items from left
<StaggerChildren
  childSelector="li"
  animation="left"
  stagger={0.1}
  trigger="onMount"
>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
</StaggerChildren>
```

### SmoothScroll

Adds momentum-based smooth scrolling to page.

```tsx
import SmoothScroll from '@/components/animations/SmoothScroll'

// In root layout
<SmoothScroll smoothness={1.5}>
  {children}
</SmoothScroll>
```

**Note:** This component modifies scroll behavior. Only use in root layout.

### PageLoader

Simple page load transition with fade-out.

```tsx
import PageLoader from '@/components/animations/PageLoader'

// In root layout, before main content
<PageLoader
  minDuration={800}   // minimum display time (ms)
  maxDuration={2000}  // failsafe maximum (ms)
/>
```

## Component Examples

### Enhanced ServiceCard

The `ServiceCard` component uses GSAP for hover animations:

```tsx
// components/ui/ServiceCard.tsx
const handleMouseEnter = () => {
  if (reducedMotion || !cardRef.current || !iconRef.current) return

  gsap.to(cardRef.current, {
    scale: 1.02,
    y: -8,
    duration: 0.3,
    ease: 'power2.out',
  })

  gsap.to(iconRef.current, {
    scale: 1.1,
    rotation: 5,
    duration: 0.3,
    ease: 'back.out(1.7)',
  })
}
```

### About Section with Pulse

The avatar in `About.tsx` has a subtle pulse effect:

```tsx
// components/sections/About.tsx
import { pulse } from '@/lib/animations'

useGSAP(() => {
  if (prefersReducedMotion || !avatarRef.current) return

  pulse(avatarRef.current, {
    scale: 1.02,
    duration: 3,
    repeat: -1,
  })
}, [prefersReducedMotion])
```

### Contact Form with Shake

The form shakes on validation error:

```tsx
// components/sections/Contact.tsx
import { shake } from '@/lib/animations'

const validateForm = (): boolean => {
  const newErrors: FormErrors = {}
  // ...validation logic

  if (Object.keys(newErrors).length > 0 && formRef.current) {
    shake(formRef.current, { intensity: 10, duration: 0.4 })
  }

  return Object.keys(newErrors).length === 0
}
```

### Hero with Floating Elements

Decorative elements float continuously:

```tsx
// components/sections/Hero.tsx
import { float as floatAnimation } from '@/lib/animations'

useGSAP(() => {
  if (decorative1Ref.current) {
    floatAnimation(decorative1Ref.current, {
      distance: 20,
      duration: 4,
      repeat: -1,
    })
  }
}, [prefersReducedMotion])
```

## Best Practices

### Always Respect Reduced Motion

All animations automatically respect `prefers-reduced-motion`:

```typescript
// Animations automatically adjust
const duration = getSafeDuration(0.6) // 0.01s if reduced motion

// Components automatically handle it
<FadeInView direction="up">
  {/* Instantly visible if reduced motion */}
</FadeInView>
```

### Performance Optimization

Use `willChange` for animated properties:

```tsx
<div
  ref={animatedRef}
  style={{
    willChange: prefersReducedMotion() ? 'auto' : 'transform'
  }}
>
  {/* Content */}
</div>
```

### Clean Up Animations

Always clean up GSAP animations:

```typescript
useGSAP(() => {
  const ctx = gsap.context(() => {
    // Your animations here
  }, containerRef)

  return () => ctx.revert() // Important!
}, [dependencies])
```

### Avoid Animation Overuse

- Limit continuous animations (pulse, float) to 2-3 per viewport
- Use subtle movements (small distances, slow durations)
- Don't animate everything - create hierarchy

### Choose Appropriate Triggers

- **onMount**: For hero sections, modals, immediate feedback
- **onScroll**: For content that appears as user scrolls down
- **Hover**: For interactive elements (cards, buttons)

## Testing

Run animation utility tests:

```bash
npm test -- __tests__/unit/animations.test.ts
```

Tests cover:
- Constants values
- Reduced motion detection
- Safe duration calculation
- All animation functions
- Performance characteristics

## Browser Support

- Modern browsers with CSS transform support
- Graceful degradation for older browsers
- Full support for `prefers-reduced-motion`

## Dependencies

- `gsap` ^3.12.5
- `@gsap/react` ^2.1.1
- ScrollTrigger (GSAP plugin)

## File Structure

```
lib/
  animations.ts              # Core animation utilities

components/animations/
  ParallaxBackground.tsx     # Parallax scroll wrapper
  FadeInView.tsx            # Viewport fade-in wrapper
  StaggerChildren.tsx       # Stagger animation wrapper
  SmoothScroll.tsx          # Smooth page scrolling
  PageLoader.tsx            # Page load transition

__tests__/unit/
  animations.test.ts        # Unit tests for utilities
```

## Additional Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [prefers-reduced-motion MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

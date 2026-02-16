# ADR-004: GSAP for Professional Animations

## Status
Accepted

## Context
A professional portfolio website requires smooth, performant animations to create engaging user experiences and showcase technical capabilities. Key requirements included:

- Scroll-triggered animations for content reveals
- Smooth page transitions
- Complex timeline-based animations
- Performance on all devices (60fps target)
- Fine-grained control over animation timing
- Integration with React 19 lifecycle

## Decision
Implement GSAP (GreenSock Animation Platform) with ScrollTrigger plugin as the primary animation library.

Implementation includes:
- GSAP 3.12+ core library
- ScrollTrigger plugin for scroll-based animations
- @gsap/react for React integration with useGSAP hook
- Timeline-based orchestration for complex sequences
- Hardware-accelerated transforms for performance
- Accessibility considerations (respects prefers-reduced-motion)

## Consequences

### Positive
- **Professional Quality**: Industry-standard animation library used by top agencies and studios
- **Performance**: Hardware-accelerated animations maintain 60fps on most devices
- **Fine Control**: Precise timing, easing, and sequencing capabilities
- **ScrollTrigger**: Powerful scroll-based animation system with minimal configuration
- **Browser Compatibility**: Consistent behavior across all modern browsers
- **React Integration**: Official @gsap/react package with useGSAP hook for proper cleanup
- **Plugin Ecosystem**: Rich plugin system for advanced features (ScrollTrigger, ScrollSmoother, etc.)
- **Documentation**: Comprehensive documentation and large community

### Negative
- **Bundle Size**: GSAP core + ScrollTrigger adds ~50KB to JavaScript bundle
- **Learning Curve**: GSAP API requires learning new concepts (timelines, tweens, easing)
- **License Cost**: Premium plugins (ScrollSmoother, etc.) require GSAP Club membership
- **Dependency Risk**: Reliance on third-party library for critical UI functionality
- **Debug Complexity**: Complex animation timelines can be difficult to debug

### Neutral
- **Imperative API**: GSAP uses imperative rather than declarative approach (different from React patterns)
- **jQuery-like**: API style similar to jQuery (familiar to some, dated to others)
- **Global State**: Animations managed outside React state system

## Alternatives Considered

### 1. Framer Motion
**Why Not Chosen**:
- While excellent for React, less powerful for complex scroll animations
- Smaller ecosystem than GSAP
- Some performance concerns with complex animations
- Less fine-grained control over easing and timing
- Newer library with smaller community

**Trade-off**: Better React integration but less animation power

### 2. React Spring
**Why Not Chosen**:
- Physics-based animations excellent for UI interactions but overkill for portfolio
- Steeper learning curve for traditional animations
- Less intuitive for scroll-triggered effects
- Smaller ecosystem and community

### 3. CSS Animations + Intersection Observer
**Why Not Chosen**:
- Limited control over complex animation sequences
- Difficult to orchestrate multiple elements
- Scroll position tracking requires manual JavaScript
- Less powerful easing functions
- Harder to maintain complex timelines

### 4. Anime.js
**Why Not Chosen**:
- Smaller community and ecosystem
- Less powerful scroll animation capabilities
- Fewer plugins and extensions
- Less documentation and tutorials

### 5. Motion One
**Why Not Chosen**:
- Very small bundle size but limited features
- No robust scroll animation system
- Newer library with less proven track record
- Smaller ecosystem

## References
- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Documentation](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [@gsap/react Documentation](https://greensock.com/react/)
- [GSAP Performance Tips](https://greensock.com/performance/)
- [Web Animation Best Practices](https://web.dev/animations/)

## Implementation Notes

### React Integration Pattern
```typescript
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function Component() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animation code with automatic cleanup
    gsap.from('.element', {
      opacity: 0,
      y: 50,
      scrollTrigger: {
        trigger: '.element',
        start: 'top 80%',
      }
    });
  }, { scope: containerRef });

  return <div ref={containerRef}>...</div>;
}
```

### Performance Optimizations
1. **Hardware Acceleration**: Use transform and opacity properties
2. **Lazy Loading**: Register plugins only when needed
3. **Cleanup**: useGSAP hook automatically cleans up animations
4. **Reduced Motion**: Check prefers-reduced-motion media query
5. **Debouncing**: Debounce resize events for scroll triggers

### Animation Principles Applied
- **Easing**: Use appropriate easing functions (power2, power3, elastic)
- **Duration**: Keep animations between 0.3s - 0.8s for UI elements
- **Staggering**: Stagger element animations for visual interest
- **Scroll Progress**: Map scroll position to animation progress for parallax effects
- **Timeline Orchestration**: Use timelines for complex multi-step animations

### Accessibility Considerations
```typescript
// Respect user preferences
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  gsap.set('.element', { opacity: 1, y: 0 }); // Skip animation
} else {
  gsap.from('.element', { opacity: 0, y: 50, duration: 0.8 });
}
```

### Bundle Size Impact
- GSAP Core: ~30KB gzipped
- ScrollTrigger: ~15KB gzipped
- @gsap/react: ~2KB gzipped
- **Total**: ~47KB gzipped (acceptable for animation capabilities provided)

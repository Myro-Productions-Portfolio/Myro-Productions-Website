# Specification: Myro Productions Personal Portfolio Website

## Overview

Build a modern, sleek personal portfolio and company website for Myro Productions—a one-man production powerhouse owned by Nicolas Robert Myers. The site will specialize in showcasing rapid prototyping, automation solutions, and AI-accelerated development services. The design features a tactical, premium, tech-forward aesthetic with dark mossy green tones and carbon fiber textures, incorporating smooth parallax scrolling, fade-in transitions, and subtle hover effects. The site will position Nicolas as capable of taking client visions from concept to full-scale production faster than traditional approaches.

## Workflow Type

**Type**: feature

**Rationale**: This is a greenfield project requiring full website implementation from scratch. While requirements.json indicates "documentation", the actual task is building a complete 5-section portfolio website with custom animations, filtering functionality, and a distinct design system. This constitutes a major feature build requiring structured implementation phases.

## Task Scope

### Services Involved
- **nextjs-frontend** (primary) - Single-service Next.js application handling all website functionality

### This Task Will:
- [ ] Initialize Next.js 15+ project with TypeScript and Tailwind CSS v4
- [ ] Create dark mossy green + carbon fiber design system
- [ ] Build Hero section with bold intro, tagline, and CTA
- [ ] Build Services section showcasing three core offerings
- [ ] Build Portfolio section with visual project showcase and filtering/categorization
- [ ] Build About/Bio section with career history and credentials
- [ ] Build Contact section with inquiry form or direct contact info
- [ ] Implement parallax scrolling and smooth fade-in animations
- [ ] Add subtle hover effects on interactive elements

### Out of Scope:
- Backend API or database integration
- CMS integration for content management
- Authentication or user accounts
- E-commerce functionality
- LinkedIn API integration (manual content pull instead)
- Hosting/deployment configuration

## Service Context

### Next.js Frontend

**Tech Stack:**
- Language: TypeScript
- Framework: Next.js v15+ with App Router
- Styling: Tailwind CSS v4 (PostCSS plugin)
- Animation: Motion (Framer Motion) + GSAP 3.x with ScrollTrigger
- Build Tool: Turbopack (default)
- Runtime: Node.js v20.9+

**Key Directories:**
```
app/                    # App Router pages and layouts
  layout.tsx           # Root layout
  page.tsx             # Home page (single-page site)
  globals.css          # Global styles with Tailwind
components/            # React components
  sections/            # Page sections (Hero, Services, etc.)
  ui/                  # Reusable UI components
  animations/          # Animation wrapper components
lib/                   # Utilities and helpers
public/                # Static assets (images, textures)
  textures/            # Carbon fiber and texture assets
  projects/            # Portfolio project images
```

**Entry Point:** `app/page.tsx`

**How to Run:**
```bash
npm run dev
```

**Port:** 3000

## Files to Create

| File | Purpose | Priority |
|------|---------|----------|
| `app/layout.tsx` | Root layout with metadata, fonts, global providers | P0 |
| `app/page.tsx` | Main page composing all sections | P0 |
| `app/globals.css` | Tailwind imports + custom CSS variables | P0 |
| `tailwind.config.ts` | Custom theme (colors, fonts, animations) | P0 |
| `postcss.config.mjs` | PostCSS with Tailwind v4 plugin | P0 |
| `components/sections/Hero.tsx` | Hero section component | P1 |
| `components/sections/Services.tsx` | Services section component | P1 |
| `components/sections/Portfolio.tsx` | Portfolio with filtering | P1 |
| `components/sections/About.tsx` | About/Bio section | P1 |
| `components/sections/Contact.tsx` | Contact form section | P1 |
| `components/ui/Button.tsx` | Reusable button component | P2 |
| `components/ui/Card.tsx` | Reusable card component | P2 |
| `components/ui/SectionWrapper.tsx` | Consistent section styling | P2 |
| `components/animations/FadeIn.tsx` | Fade-in animation wrapper | P2 |
| `components/animations/ParallaxSection.tsx` | Parallax scroll wrapper | P2 |
| `lib/portfolio-data.ts` | Portfolio project data/types | P2 |

## Files to Reference

These files show patterns to follow (from research phase):

| Pattern Source | Pattern to Copy |
|----------------|----------------|
| Next.js 15 App Router docs | File-based routing, Server/Client Components |
| Tailwind CSS v4 docs | `@import 'tailwindcss'` syntax, theme extension |
| Motion docs | `motion.div`, `whileInView`, `useScroll` APIs |
| GSAP docs | `ScrollTrigger`, `useGSAP` hook for React cleanup |

## Patterns to Follow

### Server vs Client Components

Next.js 15 defaults to Server Components. Interactive components require explicit directive:

```tsx
// Client component for animations/interactivity
'use client'

import { motion } from 'motion/react'

export function AnimatedSection({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  )
}
```

**Key Points:**
- Static sections can remain Server Components
- Animation wrappers must be Client Components
- Keep Client Component boundaries minimal for performance

### Tailwind CSS v4 Setup

```css
/* app/globals.css */
@import 'tailwindcss';

/* Custom theme variables */
@theme {
  --color-moss-900: #1a2e1a;
  --color-moss-800: #243524;
  --color-moss-700: #2e3f2e;
  --color-moss-600: #3d503d;
  --color-moss-500: #4a5f4a;
  --color-carbon: #1c1c1c;
  --color-carbon-light: #2a2a2a;
}
```

**Key Points:**
- Use `@import 'tailwindcss'` NOT `@tailwind` directives
- Define custom colors in `@theme` block
- Carbon fiber texture via CSS background-image

### GSAP ScrollTrigger Pattern

```tsx
'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function ParallaxSection({ children }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.to(containerRef.current, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  }, { scope: containerRef })

  return <div ref={containerRef}>{children}</div>
}
```

**Key Points:**
- Always register plugins before use
- Use `useGSAP` hook for automatic cleanup
- Scope animations to container ref

### Portfolio Filtering Pattern

```tsx
'use client'

import { useState } from 'react'

type Category = 'all' | 'entertainment' | 'automation' | 'software'

interface Project {
  id: string
  title: string
  category: Category
  image: string
  description: string
}

export function Portfolio({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const filtered = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory)

  return (
    <section>
      <FilterButtons active={activeCategory} onChange={setActiveCategory} />
      <ProjectGrid projects={filtered} />
    </section>
  )
}
```

**Key Points:**
- Use state for filter management
- Define project types/categories clearly
- Smooth animation on filter change

## Requirements

### Functional Requirements

1. **Hero Section**
   - Description: Bold introduction with company name, tagline, and primary call-to-action button
   - Acceptance: Hero visible on page load with smooth fade-in animation, CTA button navigates to contact section

2. **Services Section**
   - Description: Display three core service offerings: rapid prototyping, automation solutions, AI-accelerated development
   - Acceptance: Each service displayed with icon/visual, title, and brief description

3. **Portfolio Section**
   - Description: Visual grid showcase of past projects with category filtering
   - Acceptance: Projects filterable by category (entertainment, automation, software), hover effects on cards, smooth filter transitions

4. **About/Bio Section**
   - Description: Career history, background, and credentials for Nicolas Robert Myers
   - Acceptance: Professional bio displayed with appropriate formatting and visual hierarchy

5. **Contact Section**
   - Description: Method for visitors to reach out (form or direct info)
   - Acceptance: Clear contact information or functional inquiry form visible

6. **Animations & Transitions**
   - Description: Smooth parallax scrolling, fade-in transitions, hover effects
   - Acceptance: All sections animate smoothly on scroll, no jank or performance issues

7. **Design System**
   - Description: Consistent dark mossy green palette with carbon fiber textures
   - Acceptance: Color scheme applied consistently, textures visible, tactical/premium aesthetic achieved

### Edge Cases

1. **Empty Portfolio Filter** - Show "No projects in this category" message
2. **Mobile Viewport** - Disable/reduce parallax effects on mobile for performance
3. **Reduced Motion** - Respect `prefers-reduced-motion` media query
4. **Contact Form Validation** - If using form, validate required fields client-side
5. **Image Loading** - Use placeholder/skeleton while portfolio images load

## Implementation Notes

### DO
- Use Next.js App Router file-based routing
- Keep Server Components where possible (static content)
- Use Client Components only for interactivity
- Register GSAP plugins before use
- Use `useGSAP` hook for animation cleanup
- Follow Tailwind v4 `@import` syntax
- Use semantic HTML elements (section, nav, article)
- Implement responsive design (mobile-first)
- Add proper alt text to images
- Use next/image for optimized image loading

### DON'T
- Don't use `@tailwind` directives (v4 breaking change)
- Don't forget `'use client'` on animation components
- Don't create animations without cleanup (memory leaks)
- Don't ignore `prefers-reduced-motion`
- Don't use heavy animations on mobile
- Don't hardcode content - use data structures
- Don't skip TypeScript types

## Development Environment

### Initialize Project

```bash
npx create-next-app@latest . --typescript --eslint --app --tailwind --yes
npm install motion gsap @gsap/react
```

### Start Development Server

```bash
npm run dev
```

### Service URLs
- Development: http://localhost:3000

### Required Environment Variables
- None required for base implementation

### Optional Environment Variables
```bash
# For future contact form integration
CONTACT_EMAIL=contact@myroproductions.com
```

## Success Criteria

The task is complete when:

1. [ ] Project initializes and runs without errors (`npm run dev`)
2. [ ] All 5 sections render correctly (Hero, Services, Portfolio, About, Contact)
3. [ ] Dark mossy green color scheme applied consistently
4. [ ] Carbon fiber texture visible in design
5. [ ] Parallax scrolling effects work smoothly
6. [ ] Fade-in animations trigger on scroll
7. [ ] Portfolio filtering works for all categories
8. [ ] Hover effects present on interactive elements
9. [ ] Site is responsive (mobile, tablet, desktop)
10. [ ] No console errors in browser
11. [ ] ESLint passes (`npm run lint`)
12. [ ] TypeScript compiles without errors (`npm run build`)

## QA Acceptance Criteria

**CRITICAL**: These criteria must be verified by the QA Agent before sign-off.

### Unit Tests
| Test | File | What to Verify |
|------|------|----------------|
| Portfolio filtering | `__tests__/Portfolio.test.tsx` | Filter state changes, correct projects displayed |
| Button component | `__tests__/Button.test.tsx` | Renders correctly, handles click |
| Card component | `__tests__/Card.test.tsx` | Renders with props, hover state |

### Integration Tests
| Test | Services | What to Verify |
|------|----------|----------------|
| Page composition | Layout + Sections | All sections render in correct order |
| Navigation | Hero CTA -> Contact | Smooth scroll to contact section |
| Animation hooks | GSAP + React | Animations initialize and cleanup properly |

### End-to-End Tests
| Flow | Steps | Expected Outcome |
|------|-------|------------------|
| Full page load | 1. Navigate to / 2. Wait for animations | All sections visible, no errors |
| Portfolio filter | 1. Click category button 2. Observe grid | Only matching projects shown |
| Contact CTA | 1. Click hero CTA 2. Observe scroll | Smooth scroll to contact section |
| Mobile view | 1. Resize to mobile 2. Navigate all sections | Responsive layout, readable content |

### Browser Verification
| Page/Component | URL | Checks |
|----------------|-----|--------|
| Home Page | `http://localhost:3000` | All sections render, animations work |
| Hero Section | `http://localhost:3000#hero` | Tagline visible, CTA clickable |
| Services | `http://localhost:3000#services` | 3 services displayed with icons |
| Portfolio | `http://localhost:3000#portfolio` | Grid displays, filters work |
| About | `http://localhost:3000#about` | Bio content renders |
| Contact | `http://localhost:3000#contact` | Form/info visible |

### Performance Verification
| Check | Tool/Method | Expected |
|-------|-------------|----------|
| Lighthouse Performance | Chrome DevTools | Score > 80 |
| Animation FPS | Performance tab | Consistent 60fps during scroll |
| Bundle size | `npm run build` | First load JS < 150kb |
| Image optimization | Network tab | Images served in modern format |

### Accessibility Verification
| Check | Tool/Method | Expected |
|-------|-------------|----------|
| Color contrast | Chrome DevTools | WCAG AA compliant |
| Keyboard navigation | Tab through page | All interactive elements focusable |
| Screen reader | VoiceOver/NVDA | Logical reading order |
| Reduced motion | Emulate in DevTools | Animations disabled/reduced |

### QA Sign-off Requirements
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Browser verification complete across Chrome, Firefox, Safari
- [ ] Mobile responsiveness verified (320px - 768px - 1024px+)
- [ ] No regressions in existing functionality
- [ ] Code follows established patterns
- [ ] No security vulnerabilities introduced
- [ ] Lighthouse score > 80 for Performance, Accessibility, Best Practices
- [ ] No console errors or warnings
- [ ] TypeScript strict mode passes
- [ ] ESLint passes without warnings

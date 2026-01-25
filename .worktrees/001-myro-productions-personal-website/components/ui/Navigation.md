# Navigation Component

## Overview
A fully-featured, accessible navigation component with smooth scrolling, mobile menu, scroll effects, and active section tracking.

## Features

### 1. Responsive Design
- **Desktop**: Horizontal navigation with hover effects
- **Mobile**: Hamburger menu with slide-down animation (< 768px)

### 2. Scroll Effects
- Header becomes semi-transparent with backdrop blur after scrolling 50px
- Adds bottom border with moss green accent when scrolled

### 3. Active Section Tracking
- Uses Intersection Observer API to detect which section is in viewport
- Highlights active nav link with accent color
- Animated underline indicator follows active section

### 4. Smooth Scrolling
- Clicks navigate to section IDs smoothly
- Mobile menu closes automatically after navigation
- Respects `prefers-reduced-motion` settings (via globals.css)

### 5. Accessibility Features
- Proper ARIA labels and attributes
- Keyboard navigation support (Tab, Enter, Escape)
- Focus-visible ring on interactive elements
- `aria-current="page"` for active section
- `aria-expanded` and `aria-controls` for mobile menu
- Body scroll lock when mobile menu is open

### 6. Brand Identity
- "MYRO" logo with gradient text effect
- Hover animation with color shift and bottom border growth
- Uses design system colors (moss green + accent teal)

## Usage

The component is already integrated into `app/layout.tsx`. It will automatically appear on all pages.

### Required Section IDs
Ensure your page has sections with these IDs for navigation to work:
```tsx
<section id="home">...</section>
<section id="services">...</section>
<section id="portfolio">...</section>
<section id="about">...</section>
<section id="contact">...</section>
```

## Customization

### Adding/Removing Nav Links
Edit the `navLinks` array in `Navigation.tsx`:
```typescript
const navLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  // Add more links here
];
```

### Changing Scroll Threshold
Modify the `isScrolled` trigger point:
```typescript
setIsScrolled(window.scrollY > 50); // Change 50 to desired pixel value
```

### Adjusting Intersection Observer Sensitivity
Modify the `rootMargin` in the observer options:
```typescript
rootMargin: '-50% 0px -50% 0px', // Triggers when section is centered
```

## Design Tokens Used

### Colors
- `bg-carbon` - Header background when scrolled
- `text-moss-300`, `text-accent`, `text-moss-400` - Logo gradient
- `text-accent` - Active link color
- `text-text-secondary` - Inactive link color
- `border-moss-800/30` - Bottom border when scrolled
- `bg-moss-900/30` - Hover background states
- `bg-moss-900/50` - Mobile menu active state

### Effects
- `backdrop-blur-md` - Glass morphism effect when scrolled
- `shadow-lg` - Shadow when scrolled
- Motion/Framer Motion for animations

## Performance Notes

- Intersection Observer is efficient and doesn't cause layout thrashing
- Scroll event is throttled by browser's requestAnimationFrame
- Mobile menu animations use CSS transforms (GPU-accelerated)
- Body scroll lock prevents double scrollbars on mobile

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Intersection Observer API (98%+ browser support)
- Fallback to basic navigation without active tracking in older browsers

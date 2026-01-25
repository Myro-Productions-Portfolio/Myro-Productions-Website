# Responsive Design Documentation

This document outlines the responsive design implementation for the Myro Productions website.

## Breakpoints

The website uses Tailwind CSS v4 with the following breakpoints:

| Breakpoint | Width | Prefix | Description |
|------------|-------|--------|-------------|
| Mobile Small | 320px | (default) | Smallest mobile devices |
| Mobile Medium | 375px | (default) | iPhone SE, iPhone 8 |
| Mobile Large | 414px | (default) | iPhone 11 Pro Max, Pixel 5 |
| Tablet | 768px | `md:` | iPad, tablets in portrait |
| Desktop Small | 1024px | `lg:` | Small laptops, tablets in landscape |
| Desktop Medium | 1280px | `xl:` | Standard desktop |
| Desktop Large | 1440px+ | `2xl:` | Large desktop monitors |

### Tailwind Default Breakpoints

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Component Responsive Behavior

### Navigation

**Desktop (≥768px)**
- Full horizontal navigation menu
- Logo on left, nav links on right
- Hover states with accent underline animation
- Fixed header with blur backdrop on scroll

**Mobile (<768px)**
- Hamburger menu button (44x44px touch target)
- Full-screen mobile menu overlay
- Stacked navigation links
- ESC key to close
- Body scroll lock when menu open

### Hero Section

**All Sizes**
- Full viewport height
- Centered content
- Parallax background effect (desktop only)

**Desktop (≥1024px)**
- Text: `text-7xl` to `text-8xl`
- Buttons: Side-by-side with gap
- Max width: `max-w-6xl`

**Tablet (768px-1023px)**
- Text: `text-6xl` to `text-7xl`
- Buttons: Side-by-side with `sm:flex-row`
- Max width: `max-w-6xl`

**Mobile (<768px)**
- Text: `text-5xl` to `text-6xl`
- Buttons: Stacked (`flex-col`)
- Full width buttons
- Reduced padding

### Services Section

**Desktop (≥1024px)**
- 3-column grid (`lg:grid-cols-3`)
- Cards side-by-side
- Hover effects with scale

**Tablet (768px-1023px)**
- 2-column grid (`md:grid-cols-2`)
- Third card wraps to next row

**Mobile (<768px)**
- Single column (`grid-cols-1`)
- Cards stack vertically
- Full width cards

### Portfolio Section

**Desktop (≥1024px)**
- 3-column grid (`lg:grid-cols-3`)
- Cards display in rows of 3

**Tablet (768px-1023px)**
- 2-column grid (`md:grid-cols-2`)
- Cards display in rows of 2

**Mobile (<768px)**
- Single column (`grid-cols-1`)
- Cards stack vertically
- Filter buttons wrap naturally

### About Section

**Desktop (≥1024px)**
- 2-column layout (`lg:grid-cols-2`)
- Avatar on left, content on right
- Avatar: 320px x 320px

**Mobile (<768px)**
- Single column stacked layout
- Avatar above content
- Centered alignment

### Contact Section

**Desktop (≥1024px)**
- 2-column layout (`lg:grid-cols-2`)
- Contact info on left, form on right
- Side-by-side social buttons

**Mobile (<768px)**
- Single column stacked layout
- Contact info above form
- Stacked social buttons

### Footer

**Desktop (≥768px)**
- 3-column grid (`md:grid-cols-3`)
- Brand | Quick Links | Contact
- Horizontal bottom bar

**Mobile (<768px)**
- Single column stacked
- Centered text
- Stacked bottom bar

## Mobile-Specific Considerations

### Touch Targets

All interactive elements meet WCAG 2.1 Level AAA guidelines:
- Minimum touch target size: 44x44px
- Adequate spacing between touch targets
- Mobile menu items: Full-width with 48px height

### Performance

- GSAP animations respect `prefers-reduced-motion`
- Lazy loading for images (future enhancement)
- Optimized font loading
- Minimal JavaScript for mobile

### Text Sizing

- Minimum body text: 16px (prevents iOS zoom on focus)
- Headings scale responsively with `text-{size}` utilities
- Line height adjusted for readability at each breakpoint

### Form Inputs

- 16px minimum font size (prevents zoom on iOS)
- Full-width on mobile
- Proper spacing for fat-finger taps
- Clear labels and error states

## Known Mobile Behaviors

### iOS Safari

- Fixed header uses `-webkit-backdrop-filter` for blur
- Viewport height accounts for Safari's dynamic toolbar
- Smooth scroll may be less smooth than on desktop

### Android Chrome

- Pull-to-refresh disabled in mobile menu (via body scroll lock)
- Viewport height consistent across orientations

### Landscape Mode

- Content adapts to reduced height
- Padding reduced for better space usage
- Hero section remains full viewport height

## Testing Viewport Sizes

### Recommended Test Devices

**Mobile**
- iPhone SE (375x667) - Smallest common iOS device
- iPhone 12/13 (390x844) - Current standard iOS
- Pixel 5 (393x851) - Current standard Android
- Samsung Galaxy S21 (360x800) - Common Android size

**Tablet**
- iPad (768x1024) - Standard tablet size
- iPad Pro (1024x1366) - Large tablet

**Desktop**
- MacBook Air (1440x900) - Common laptop
- Standard Desktop (1920x1080) - Most common desktop

### Manual Testing Checklist

- [ ] No horizontal scroll on any screen size
- [ ] All text is readable (not too small or truncated)
- [ ] Touch targets are ≥44x44px
- [ ] Forms are usable with touch keyboards
- [ ] Images don't overflow containers
- [ ] Navigation works at all breakpoints
- [ ] Content stacks properly on mobile
- [ ] Animations are smooth or disabled per preference

### Automated Testing

Run responsive tests:

```bash
npm run test:e2e -- responsive.spec.ts
```

This tests:
- No horizontal overflow at any viewport
- Navigation state changes correctly
- Grid layouts adapt properly
- Touch target sizes meet standards
- Content stacking behavior
- Text readability at different sizes

## Common Responsive Issues and Solutions

### Issue: Horizontal Scroll

**Causes:**
- Fixed-width elements (use `max-w-full` instead)
- Large images (add `w-full h-auto`)
- Overflowing text (add `break-words`)
- Negative margins extending beyond container

**Solution:**
```tsx
// Instead of:
<div className="w-500">

// Use:
<div className="w-full max-w-500">
```

### Issue: Text Overflow

**Causes:**
- Long words without breaks
- Fixed containers
- Missing overflow handling

**Solution:**
```tsx
<p className="break-words overflow-wrap-anywhere">
  Long text here...
</p>
```

### Issue: Touch Targets Too Small

**Causes:**
- Buttons with insufficient padding
- Icon-only buttons without proper sizing
- Links too close together

**Solution:**
```tsx
// Minimum 44x44px
<button className="min-w-[44px] min-h-[44px] p-3">
  Icon
</button>
```

### Issue: Images Breaking Layout

**Causes:**
- No size constraints
- Missing aspect ratio
- Large intrinsic dimensions

**Solution:**
```tsx
<img
  src="/image.jpg"
  alt="Description"
  className="w-full h-auto object-cover"
/>
```

## Future Enhancements

- [ ] Add responsive images with `srcset`
- [ ] Implement container queries for component-level responsiveness
- [ ] Add visual regression testing for responsive breakpoints
- [ ] Optimize font loading strategy for mobile
- [ ] Add offline support with service worker
- [ ] Implement dark mode toggle
- [ ] Add print stylesheet

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev Mobile Performance](https://web.dev/mobile/)

---

**Last Updated:** January 3, 2026
**Maintained By:** Myro Productions Development Team

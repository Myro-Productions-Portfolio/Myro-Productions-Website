# ADR-003: Tailwind CSS 4.0 for Styling

## Status
Accepted

## Context
The portfolio website requires a professional, modern design system that enables rapid UI development while maintaining consistency. Key requirements included:

- Fast iteration on design changes
- Responsive design across all device sizes
- Consistent spacing, colors, and typography
- Dark mode support
- Minimal CSS bundle size
- Good developer experience

## Decision
Adopt Tailwind CSS 4.0 as the primary styling solution with utility-first CSS methodology.

Implementation includes:
- Tailwind CSS 4.0 with @tailwindcss/postcss
- Custom color palette for brand identity
- Responsive breakpoints for mobile, tablet, and desktop
- Utility classes for rapid prototyping
- Custom component classes where appropriate
- JIT (Just-In-Time) compilation for optimal performance

## Consequences

### Positive
- **Rapid Development**: Utility classes enable quick UI implementation without context switching
- **Consistency**: Predefined scale for spacing, colors, and typography ensures visual harmony
- **Responsive Design**: Built-in responsive modifiers make mobile-first design straightforward
- **Performance**: PurgeCSS removes unused styles, resulting in tiny production CSS bundles
- **Maintainability**: Changes to design tokens propagate automatically across the application
- **No Naming Conflicts**: Utility classes eliminate CSS naming collisions and specificity wars
- **Developer Experience**: IntelliSense support in VSCode provides autocomplete for classes
- **Dark Mode**: First-class support for dark mode with `dark:` prefix

### Negative
- **HTML Verbosity**: Utility classes can make HTML markup longer and harder to read
- **Learning Curve**: New developers need to learn Tailwind's utility class system
- **Custom Designs**: Highly unique designs may require writing custom CSS
- **Refactoring**: Moving classes to components requires extracting repetitive patterns
- **IDE Dependency**: Best experience requires editor plugins for autocomplete

### Neutral
- **Opinionated Defaults**: Tailwind's default scale may not match every design system
- **Build Process**: Requires PostCSS integration in the build pipeline
- **Class Name Length**: Long class strings can impact version control diffs

## Alternatives Considered

### 1. CSS Modules
**Why Not Chosen**:
- Requires writing custom CSS for every component
- Manual management of responsive breakpoints
- No built-in design system or constraints
- Larger CSS bundles without aggressive purging
- More time spent on naming conventions

### 2. Styled Components (CSS-in-JS)
**Why Not Chosen**:
- Runtime performance overhead
- Larger JavaScript bundle size
- Server-side rendering complexity
- Lack of static extraction
- Theme provider complexity

### 3. Bootstrap
**Why Not Chosen**:
- Opinionated component library with limited customization
- Larger CSS bundle size
- jQuery dependency (in older versions)
- Generic "Bootstrap look" difficult to overcome
- Less flexible than utility-first approach

### 4. Vanilla CSS
**Why Not Chosen**:
- No design system constraints
- Manual responsive design implementation
- Naming convention management required
- No built-in optimization tools
- Slower development velocity

### 5. Material UI / Chakra UI
**Why Not Chosen**:
- Heavy component libraries with JavaScript overhead
- Opinionated design language
- Larger bundle sizes
- Less control over final HTML structure

## References
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS 4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4)
- [Utility-First CSS Philosophy](https://tailwindcss.com/docs/utility-first)
- [Tailwind CSS Performance](https://tailwindcss.com/docs/optimizing-for-production)

## Implementation Notes

### Configuration Structure
```typescript
// tailwind.config.ts
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
      },
    },
  },
}
```

### Design Tokens
- **Spacing Scale**: 4px base unit (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64)
- **Colors**: Custom brand palette with semantic naming
- **Typography**: System font stack with fallbacks
- **Breakpoints**: sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

### Best Practices
1. **Mobile-First**: Design for mobile, enhance for larger screens
2. **Component Extraction**: Extract repeated patterns into React components
3. **Semantic Classes**: Use `@apply` directive sparingly for semantic meaning
4. **Consistent Spacing**: Use spacing scale consistently across all components
5. **Dark Mode**: Design with dark mode in mind from the start

### Production Optimization
- PurgeCSS removes unused utility classes
- Minification reduces CSS file size
- Gzip compression on server
- Final CSS bundle: ~10-20KB gzipped

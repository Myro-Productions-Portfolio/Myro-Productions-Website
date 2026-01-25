# Testing Guide

This project has a comprehensive testing suite using Jest, React Testing Library, and Playwright.

## Test Structure

```
__tests__/
├── unit/              # Unit tests for individual components
│   ├── Button.test.tsx
│   └── Navigation.test.tsx
├── integration/       # Integration tests for composed components
│   └── Hero.test.tsx
└── e2e/              # End-to-end tests with Playwright
    └── homepage.spec.ts
```

## Running Tests

### Jest Tests (Unit & Integration)

```bash
# Run all Jest tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Playwright Tests (E2E)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui
```

### All Tests

```bash
# Run both Jest and Playwright tests
npm run test:all
```

## Test Coverage

Current test coverage includes:

### Button Component (`components/ui/Button.tsx`)
- ✅ Renders with children
- ✅ Variant support (primary, secondary)
- ✅ Size support (sm, md, lg)
- ✅ Click handling
- ✅ Scroll-to-section with href prop
- ✅ Disabled state
- ✅ Custom className merging
- ✅ Additional props pass-through
- ✅ Ref forwarding

### Navigation Component (`components/ui/Navigation.tsx`)
- ✅ Renders header and brand
- ✅ Desktop navigation links
- ✅ Mobile menu toggle
- ✅ Smooth scroll navigation
- ✅ Active section tracking
- ✅ Escape key to close menu
- ✅ Body scroll lock when menu open
- ✅ Scroll background change
- ✅ Accessibility (ARIA labels, keyboard nav)

### Hero Section (`components/sections/Hero.tsx`)
- ✅ Content rendering (headline, subheadline, CTAs)
- ✅ Button functionality
- ✅ Scroll-to-section on CTA click
- ✅ Visual elements (scroll indicator, background)
- ✅ GSAP animation integration
- ✅ Reduced motion respect
- ✅ Layout and styling
- ✅ Responsive design

### E2E Tests (Full User Flows)
- ✅ Page load
- ✅ Navigation between sections
- ✅ Mobile menu interaction
- ✅ CTA button clicks
- ✅ Scroll behavior
- ✅ Accessibility
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Performance (load time)

## Writing New Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText(/some text/i)).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText(/clicked/i)).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should complete user flow', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: /click me/i }).click()

  await expect(page.getByText(/success/i)).toBeVisible()
})
```

## Mocks and Setup

### Global Mocks (jest.setup.ts)
- `IntersectionObserver` - For scroll-based animations
- `window.matchMedia` - For responsive and reduced motion queries
- `Element.prototype.scrollIntoView` - For smooth scroll testing
- GSAP - Animation library
- motion/react - Framer Motion alternative

### Custom Mocks (__mocks/)
- `styleMock.js` - CSS imports
- `fileMock.js` - Image/asset imports

## Configuration Files

- `jest.config.ts` - Jest configuration
- `jest.setup.ts` - Global test setup and mocks
- `playwright.config.ts` - Playwright E2E configuration

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see and interact with
   - Use accessible queries (getByRole, getByLabelText)
   - Avoid testing internal state

2. **Keep Tests Isolated**
   - Each test should be independent
   - Clean up after tests (DOM elements, mocks)
   - Use beforeEach/afterEach for setup/teardown

3. **Use Semantic Queries**
   ```typescript
   // Good
   screen.getByRole('button', { name: /submit/i })

   // Avoid
   screen.getByTestId('submit-button')
   ```

4. **Wait for Async Changes**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText(/loaded/i)).toBeInTheDocument()
   })
   ```

5. **Test Accessibility**
   - Check for proper ARIA labels
   - Verify keyboard navigation
   - Test screen reader compatibility

## Troubleshooting

### Tests Timing Out
- Increase timeout in test file: `jest.setTimeout(10000)`
- Check for unresolved promises
- Ensure async operations complete

### Mocking Issues
- Check jest.setup.ts for global mocks
- Verify module mocks are in correct location
- Clear cache: `npm test -- --clearCache`

### Playwright Browser Issues
- Install browsers: `npx playwright install`
- Update browsers: `npx playwright install --force`
- Check browser compatibility

## CI/CD Integration

For continuous integration, add to your workflow:

```yaml
- name: Run Tests
  run: |
    npm test -- --ci --coverage
    npm run test:e2e
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

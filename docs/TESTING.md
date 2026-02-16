# Testing Guide

Comprehensive testing strategy and guidelines for the Myro Productions website.

## Overview

Testing stack:
- **Unit Tests**: Jest 30.2.0
- **E2E Tests**: Playwright 1.57.0
- **Component Tests**: React Testing Library 16.3.1

## Running Tests

```bash
# Unit tests
npm test                    # Run all unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# E2E tests
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # Interactive UI mode

# All tests
npm run test:all            # Run unit + E2E tests
```

## Unit Testing

### Example: Utility Function

```typescript
// lib/utils.ts
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// lib/utils.test.ts
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('formats cents as USD', () => {
    expect(formatCurrency(10000)).toBe('$100.00');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative amounts', () => {
    expect(formatCurrency(-5000)).toBe('-$50.00');
  });
});
```

### Example: React Component

```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Example: API Route

```typescript
// app/api/clients/route.test.ts
import { POST } from './route';
import { prisma } from '@/lib/db';

jest.mock('@/lib/db');
jest.mock('@/lib/auth', () => ({
  verifyAuth: jest.fn(() => Promise.resolve({ userId: 'admin_123' })),
}));

describe('POST /api/clients', () => {
  it('creates a new client', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      id: 'client_123',
      email: 'test@example.com',
      name: 'Test Client',
    });

    (prisma.client.create as jest.Mock) = mockCreate;

    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test Client',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.client.email).toBe('test@example.com');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('returns 400 for invalid input', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid' }), // Missing name
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

## E2E Testing

### Example: Authentication Flow

```typescript
// tests/admin-login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/admin');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toContainText('Invalid credentials');
  });
});
```

### Example: Payment Flow

```typescript
// tests/payment-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test('user can complete payment', async ({ page }) => {
    await page.goto('/services');

    // Select service
    await page.click('button:has-text("Purchase Maintenance Plan")');

    // Fill payment form
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="expiry"]', '12/26');
    await page.fill('input[name="cvc"]', '123');

    // Submit payment
    await page.click('button[type="submit"]');

    // Wait for success page
    await expect(page).toHaveURL('/payment/success');
    await expect(page.locator('h1')).toContainText('Payment Successful');
  });
});
```

## Test Coverage

Target coverage:
- **Overall**: 80%+
- **Critical paths**: 90%+ (auth, payments)
- **Utilities**: 100%

View coverage:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// BAD: Testing implementation
expect(component.state.count).toBe(0);

// GOOD: Testing behavior
expect(screen.getByText('Count: 0')).toBeInTheDocument();
```

### 2. Use Data-testid Sparingly

```typescript
// GOOD: Use accessible queries first
screen.getByRole('button', { name: 'Submit' });
screen.getByLabelText('Email');

// OK: When no better option
screen.getByTestId('complex-component');
```

### 3. Mock External Dependencies

```typescript
// Mock Stripe
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_123' }),
    },
  })),
}));
```

### 4. Clean Up After Tests

```typescript
afterEach(async () => {
  await prisma.client.deleteMany();
  jest.clearAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

## CI/CD Integration

GitHub Actions example:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

For more details, see [Development Guide](./DEVELOPMENT.md).

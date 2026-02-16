# Development Guide

Complete guide for setting up and developing the Myro Productions website locally.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Git Worktrees](#git-worktrees)
- [Code Style](#code-style)
- [Testing](#testing)
- [Debugging](#debugging)

## Prerequisites

### Required Software

- **Node.js**: v20.x or later
- **npm**: v10.x or later
- **PostgreSQL**: v14 or later
- **Git**: v2.35 or later
- **Docker**: (optional, for local containerized development)

### Development Environment

- **OS**: macOS, Linux, or WSL2 on Windows
- **IDE**: VSCode recommended (with TypeScript and ESLint extensions)
- **Terminal**: Modern shell (zsh, bash)

## Getting Started

### 1. Clone Repository

```bash
# From Gitea (homelab)
git clone http://10.0.0.223:3000/MyroProductions/myro-productions-website.git

# Or from GitHub
git clone git@github.com:Myro-Productions-Portfolio/Myro-Productions-Website.git

cd myro-productions-website
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 15 and React 19
- TypeScript and type definitions
- Tailwind CSS 4.0
- GSAP animation library
- Prisma ORM
- Stripe SDK
- Testing libraries (Jest, Playwright)

### 3. Set Up Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myro_productions_dev?schema=public"

# Authentication
JWT_SECRET="development-secret-change-in-production"

# Stripe (use test keys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Application
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Set Up Database

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb myro_productions_dev

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

#### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL container
docker run -d \
  --name postgres-dev \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=myro_productions_dev \
  -p 5432:5432 \
  postgres:14-alpine

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Verify Setup

```bash
# Check if database connection works
npm run db:studio
# Opens Prisma Studio at http://localhost:5555

# Run tests
npm test

# Run E2E tests (in separate terminal after dev server is running)
npm run test:e2e
```

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Run database migrations (if any)
npm run db:migrate

# 4. Start dev server
npm run dev

# 5. Make changes and test

# 6. Run tests before committing
npm run test
npm run lint
```

### Branch Workflow

```bash
# Create feature branch
git checkout -b feature/new-component

# Make changes and commit
git add .
git commit -m "feat: add new component"

# Push to remote
git push origin feature/new-component

# Create pull request (on GitHub or Gitea)
```

### Database Changes

```bash
# 1. Modify prisma/schema.prisma

# 2. Create migration
npm run db:migrate -- --name add_new_field

# 3. Verify migration in prisma/migrations/

# 4. Test migration
npm run db:studio

# 5. Commit schema and migration
git add prisma/
git commit -m "db: add new field to Client model"
```

## Git Worktrees

Git worktrees allow working on multiple branches simultaneously without switching.

### Create Worktree for Feature

```bash
# Create new feature branch and worktree
git worktree add .worktrees/feature-analytics -b feature-analytics

# Navigate to worktree
cd .worktrees/feature-analytics

# Install dependencies (isolated from main)
npm install

# Start dev server on different port
PORT=3001 npm run dev
```

### List Worktrees

```bash
git worktree list
```

### Remove Worktree

```bash
# When feature is complete and merged
git worktree remove .worktrees/feature-analytics

# Delete branch
git branch -d feature-analytics
```

For more details, see [ADR-009: Git Worktrees](./adr/ADR-009-git-worktrees.md).

## Code Style

### TypeScript

```typescript
// Use explicit types
function calculateTotal(amount: number, tax: number): number {
  return amount + (amount * tax);
}

// Avoid 'any'
// BAD
function process(data: any) {}

// GOOD
function process(data: ClientData) {}

// Use interfaces for objects
interface ClientData {
  id: string;
  email: string;
  name: string;
}
```

### React Components

```typescript
// Server Components (default)
async function ServerComponent() {
  const data = await prisma.client.findMany();
  return <ClientComponent data={data} />;
}

// Client Components (when needed)
'use client';
import { useState } from 'react';

function ClientComponent({ data }: { data: Client[] }) {
  const [state, setState] = useState(data);
  return <div>{/* ... */}</div>;
}
```

### Tailwind CSS

```tsx
// Use utility classes
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Click
  </button>
</div>

// Extract repeated patterns
function Button({ children, variant = 'primary' }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-medium';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}
```

### API Routes

```typescript
// app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

// Input validation schema
const createClientSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  company: z.string().optional(),
});

export async function POST(request: Request) {
  // 1. Authenticate
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate input
  const body = await request.json();
  const result = createClientSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: result.error },
      { status: 400 }
    );
  }

  // 3. Database operation
  try {
    const client = await prisma.client.create({
      data: result.data,
    });

    // 4. Return response
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Naming Conventions

- **Files**: kebab-case (`client-list.tsx`, `payment-form.tsx`)
- **Components**: PascalCase (`ClientList`, `PaymentForm`)
- **Functions**: camelCase (`calculateTotal`, `validateEmail`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Interfaces**: PascalCase with descriptive names (`ClientData`, `PaymentIntentResponse`)

## Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Example test:

```typescript
// lib/utils.test.ts
import { calculateTotal } from './utils';

describe('calculateTotal', () => {
  it('calculates total with tax', () => {
    const result = calculateTotal(100, 0.1);
    expect(result).toBe(110);
  });

  it('handles zero tax', () => {
    const result = calculateTotal(100, 0);
    expect(result).toBe(100);
  });
});
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui

# Specific test file
npx playwright test tests/admin-login.spec.ts
```

Example E2E test:

```typescript
// tests/admin-login.spec.ts
import { test, expect } from '@playwright/test';

test('admin can login', async ({ page }) => {
  await page.goto('http://localhost:3000/admin/login');

  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:3000/admin');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## Debugging

### VSCode Debug Configuration

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Console Debugging

```typescript
// Server-side (shows in terminal)
console.log('Server data:', data);

// Client-side (shows in browser console)
'use client';
console.log('Client data:', data);
```

### Prisma Studio

```bash
npm run db:studio
```

Opens GUI at http://localhost:5555 for database inspection.

### Network Debugging

Use browser DevTools:
1. Open DevTools (F12)
2. Network tab
3. Filter by XHR/Fetch
4. Inspect API requests/responses

### Docker Logs

```bash
# View logs
docker logs -f myro-website

# View specific number of lines
docker logs --tail 100 myro-website
```

## Helpful Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build                # Production build
npm run start                # Start production server
npm run lint                 # Run ESLint

# Database
npm run db:generate          # Generate Prisma Client
npm run db:push              # Push schema to database (no migration)
npm run db:migrate           # Create and apply migration
npm run db:seed              # Seed database
npm run db:studio            # Open Prisma Studio

# Testing
npm test                     # Run unit tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
npm run test:e2e             # E2E tests
npm run test:e2e:ui          # E2E tests (interactive)
npm run test:all             # All tests

# Analysis
npm run analyze              # Bundle size analysis
npm run perf                 # Performance tests
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Or for Docker
docker ps | grep postgres

# Verify DATABASE_URL in .env.local
echo $DATABASE_URL
```

### Prisma Client Out of Sync

```bash
# Regenerate Prisma Client
npm run db:generate

# If schema changed, create migration
npm run db:migrate
```

### npm Install Fails

```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

For more information, see [Architecture](./ARCHITECTURE.md) and [Testing](./TESTING.md) documentation.

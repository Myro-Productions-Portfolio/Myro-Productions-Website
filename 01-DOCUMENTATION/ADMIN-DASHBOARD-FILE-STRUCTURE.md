# Admin Dashboard File Structure

**Date:** 2026-01-24

## Complete File Tree

```
.worktrees/001-myro-productions-personal-website/
├── app/
│   └── admin/
│       ├── layout.tsx                 ✅ NEW - Admin layout with sidebar/header
│       ├── page.tsx                   ✅ UPDATED - Dashboard overview with stats
│       ├── login/
│       │   └── page.tsx               (existing - auth complete)
│       ├── clients/
│       │   └── page.tsx               ✅ NEW - Placeholder
│       ├── subscriptions/
│       │   └── page.tsx               ✅ NEW - Placeholder
│       ├── projects/
│       │   └── page.tsx               ✅ NEW - Placeholder
│       ├── payments/
│       │   └── page.tsx               ✅ NEW - Placeholder
│       └── settings/
│           └── page.tsx               ✅ NEW - Placeholder
│
├── components/
│   └── admin/
│       ├── Sidebar.tsx                ✅ NEW - Navigation sidebar
│       ├── Header.tsx                 ✅ NEW - Top header with user info
│       └── DashboardStats.tsx         ✅ NEW - Stats card components
│
├── lib/
│   ├── auth/
│   │   └── session.ts                 (existing - auth system)
│   └── prisma.ts                      (existing - database client)
│
└── prisma/
    └── schema.prisma                  (existing - database schema)
```

## Component Hierarchy

```
AdminLayout (layout.tsx)
├── Sidebar
│   └── Navigation Links
│       ├── Dashboard
│       ├── Clients
│       ├── Subscriptions
│       ├── Projects
│       ├── Payments
│       └── Settings
│
├── Header
│   ├── User Info (name, email)
│   ├── Theme Toggle (dark/light)
│   └── Logout Button
│
└── Page Content (children)
    └── Dashboard (page.tsx)
        ├── Page Header
        ├── DashboardStats
        │   ├── Active Clients Card
        │   ├── Active Subscriptions Card
        │   ├── Monthly Revenue Card
        │   └── Pending Payments Card
        ├── Recent Payments Section
        ├── Upcoming Renewals Section
        └── Quick Actions Section
```

## Route Structure

| Route | Page | Status | Description |
|-------|------|--------|-------------|
| `/admin` | `page.tsx` | Complete | Dashboard overview with stats |
| `/admin/clients` | `clients/page.tsx` | Placeholder | Client management (future) |
| `/admin/subscriptions` | `subscriptions/page.tsx` | Placeholder | Subscription management (future) |
| `/admin/projects` | `projects/page.tsx` | Placeholder | Project management (future) |
| `/admin/payments` | `payments/page.tsx` | Placeholder | Payment history (future) |
| `/admin/settings` | `settings/page.tsx` | Placeholder | Admin settings (future) |
| `/admin/login` | `login/page.tsx` | Complete | Authentication page |

## Data Flow

```
User Request
    ↓
app/admin/layout.tsx
    ↓
verifySessionFromCookies() ← lib/auth/session.ts
    ↓
    ├─→ [Not Authenticated] → redirect('/admin/login')
    └─→ [Authenticated] → Continue
            ↓
        Render Layout
            ├── <Sidebar />
            ├── <Header userName={user.name} userEmail={user.email} />
            └── {children} ← Page content
                    ↓
                app/admin/page.tsx
                    ↓
                getDashboardData()
                    ↓
                Prisma Queries (parallel)
                    ├── prisma.client.count()
                    ├── prisma.subscription.count()
                    ├── prisma.subscription.aggregate()
                    ├── prisma.payment.count()
                    ├── prisma.payment.findMany()
                    └── prisma.subscription.findMany()
                        ↓
                    Return stats, payments, renewals
                        ↓
                    Render Dashboard
                        ├── <DashboardStats stats={...} />
                        ├── Recent Payments List
                        ├── Upcoming Renewals List
                        └── Quick Actions
```

## Responsive Behavior

### Desktop (>= 1024px)
```
┌────────────────────────────────────────────┐
│  Header (sticky)                           │
│  [User Info] [Theme] [Logout]              │
├──────────┬─────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Page Content                   │
│ (fixed)  │  - Stats Cards (4 columns)      │
│          │  - Recent Payments              │
│  Nav     │  - Upcoming Renewals            │
│  Links   │  - Quick Actions                │
│          │                                  │
│          │                                  │
└──────────┴─────────────────────────────────┘
```

### Mobile (< 1024px)
```
┌─────────────────────────────────────────┐
│  Header (sticky)                        │
│  [Theme] [Logout]                       │
├─────────────────────────────────────────┤
│                                         │
│  Page Content                           │
│  - Stats Cards (1 column)               │
│  - Recent Payments                      │
│  - Upcoming Renewals                    │
│  - Quick Actions                        │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  Bottom Navigation (fixed)              │
│  [Dash] [Clients] [Subs] [Proj] [Pay]  │
└─────────────────────────────────────────┘
```

## Component Props

### Sidebar
```typescript
// No props - uses usePathname() for active link
```

### Header
```typescript
interface HeaderProps {
  userName: string;    // From session
  userEmail: string;   // From session
}
```

### DashboardStats
```typescript
interface DashboardStatsProps {
  stats: {
    activeClients: number;
    activeSubscriptions: number;
    monthlyRevenue: number;      // in cents
    pendingPayments: number;
  };
}
```

### StatCard (internal)
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}
```

## State Management

### Client-Side State
- **Theme:** `localStorage.theme` (persisted)
- **Sidebar Collapse:** Component state (not persisted)
- **Logout Loading:** Component state

### Server-Side State
- **Session:** HTTP-only cookie (`admin_session`)
- **Dashboard Data:** Fetched on each page load (fresh data)

## Security Layers

1. **Middleware:** (existing) - Initial route protection
2. **Layout:** `verifySessionFromCookies()` - Secondary check
3. **Page:** (optional) - Tertiary verification
4. **API Routes:** (future) - Endpoint-level auth

## Summary

The admin dashboard UI is organized into:

- **8 route pages** (1 complete, 5 placeholders, 1 login)
- **3 reusable components** (Sidebar, Header, DashboardStats)
- **1 shared layout** (authentication wrapper)
- **Full responsive design** (desktop + mobile)
- **Theme support** (dark + light mode)
- **Real-time data** (Prisma queries)

All files follow Next.js 15 App Router conventions and TypeScript best practices.

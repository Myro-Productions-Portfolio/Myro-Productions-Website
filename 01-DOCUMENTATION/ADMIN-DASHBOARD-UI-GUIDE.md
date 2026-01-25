# Admin Dashboard UI Guide

**Date:** 2026-01-24
**Purpose:** Visual guide and usage instructions for the admin dashboard

## Overview

The Myro Productions Admin Dashboard provides a comprehensive interface for managing clients, subscriptions, projects, and payments. The interface features a dark moss-green theme with carbon fiber aesthetics, matching the main website design.

## Dashboard Layout

### Desktop View (>= 1024px)

```
╔═══════════════════════════════════════════════════════════════════════╗
║  MYRO ADMIN               [User Info] [🌙 Theme] [Logout]             ║
╠═══════════════╦═══════════════════════════════════════════════════════╣
║               ║                                                       ║
║  📊 Dashboard ║  Dashboard                                            ║
║  👥 Clients   ║  Welcome back, Admin. Here is an overview...         ║
║  💳 Subscrip. ║                                                       ║
║  📁 Projects  ║  ┌──────────┬──────────┬──────────┬──────────┐      ║
║  💰 Payments  ║  │ Active   │ Active   │ Monthly  │ Pending  │      ║
║  ⚙️ Settings  ║  │ Clients  │ Subscri. │ Revenue  │ Payments │      ║
║               ║  │   12     │    8     │ $4,200   │    3     │      ║
║ [Collapse ◀]  ║  └──────────┴──────────┴──────────┴──────────┘      ║
║               ║                                                       ║
║               ║  ┌─────────────────────┐ ┌─────────────────────┐    ║
║               ║  │ 📈 Recent Payments  │ │ 📅 Upcoming Renewals│    ║
║               ║  │                     │ │                     │    ║
║               ║  │ Acme Corp          │ │ Tech Solutions      │    ║
║               ║  │ Subscription       │ │ Maintenance Pro     │    ║
║               ║  │ Dec 15, 2025       │ │ Renews Jan 30       │    ║
║               ║  │            $500.00 │ │              $299   │    ║
║               ║  │                     │ │                     │    ║
║               ║  │ John Doe           │ │ Jane Smith          │    ║
║               ║  │ One Time           │ │ Support Standard    │    ║
║               ║  │ Dec 18, 2025       │ │ Renews Feb 1        │    ║
║               ║  │          $1,200.00 │ │              $149   │    ║
║               ║  └─────────────────────┘ └─────────────────────┘    ║
║               ║                                                       ║
║               ║  ⚡ Quick Actions                                     ║
║               ║  ┌───────┬────────┬──────────┐                      ║
║               ║  │ Add   │ New    │ View     │                      ║
║               ║  │ Client│ Project│ Payments │                      ║
║               ║  └───────┴────────┴──────────┘                      ║
║               ║                                                       ║
╚═══════════════╩═══════════════════════════════════════════════════════╝
```

### Mobile View (< 1024px)

```
╔═══════════════════════════════════════╗
║  [Menu] ADMIN        [🌙] [Logout]    ║
╠═══════════════════════════════════════╣
║                                       ║
║  Dashboard                            ║
║  Welcome back, Admin...               ║
║                                       ║
║  ┌───────────────────────────────┐   ║
║  │ Active Clients          12    │   ║
║  └───────────────────────────────┘   ║
║  ┌───────────────────────────────┐   ║
║  │ Active Subscriptions     8    │   ║
║  └───────────────────────────────┘   ║
║  ┌───────────────────────────────┐   ║
║  │ Monthly Revenue      $4,200   │   ║
║  └───────────────────────────────┘   ║
║  ┌───────────────────────────────┐   ║
║  │ Pending Payments         3    │   ║
║  └───────────────────────────────┘   ║
║                                       ║
║  📈 Recent Payments                   ║
║  ┌───────────────────────────────┐   ║
║  │ Acme Corp           $500.00   │   ║
║  │ Subscription                  │   ║
║  │ Dec 15, 2025                  │   ║
║  └───────────────────────────────┘   ║
║                                       ║
║  📅 Upcoming Renewals (Next 7 days)   ║
║  ┌───────────────────────────────┐   ║
║  │ Tech Solutions        $299    │   ║
║  │ Maintenance Pro               │   ║
║  │ Renews Jan 30                 │   ║
║  └───────────────────────────────┘   ║
║                                       ║
╠═══════════════════════════════════════╣
║  [📊] [👥] [💳] [📁] [💰]           ║
║  Dash  Cli  Sub  Pro  Pay            ║
╚═══════════════════════════════════════╝
```

## Color Scheme

### Dark Mode (Default)

| Element | Color | Hex/Variable |
|---------|-------|--------------|
| Background | Carbon | `#1c1c1c` |
| Surface | Carbon Lighter | `#3a3a3a` |
| Border | Carbon Light | `#2a2a2a` |
| Text Primary | Off-White | `#f5f5f5` |
| Text Secondary | Gray | `#a0a0a0` |
| Text Muted | Dark Gray | `#6b6b6b` |
| Accent | Teal | `#4fd1c5` |
| Active Nav | Moss Green | `#3d503d` |
| Success | Green | `#10b981` |
| Danger | Red | `#ef4444` |

### Light Mode

| Element | Color | Hex/Variable |
|---------|-------|--------------|
| Background | Off-White | `#f8fafc` |
| Surface | Light Gray | `#f1f5f9` |
| Border | Slate | `#e2e8f0` |
| Text Primary | Dark | `#1a1a2e` |
| Text Secondary | Slate | `#4a5568` |
| Accent | Dark Teal | `#38b2ac` |
| Active Nav | Light Moss | `#6b8f6b` |

## Navigation Icons

| Page | Icon | Lucide Component |
|------|------|------------------|
| Dashboard | 📊 | `LayoutDashboard` |
| Clients | 👥 | `Users` |
| Subscriptions | 💳 | `CreditCard` |
| Projects | 📁 | `FolderKanban` |
| Payments | 💰 | `DollarSign` |
| Settings | ⚙️ | `Settings` |

## Stat Cards

### Active Clients
```
┌─────────────────────────────────┐
│ Active Clients            [👥] │
│                                 │
│ 12                              │
│                                 │
└─────────────────────────────────┘
```

### Active Subscriptions
```
┌─────────────────────────────────┐
│ Active Subscriptions      [💳] │
│                                 │
│ 8                               │
│                                 │
└─────────────────────────────────┘
```

### Monthly Revenue
```
┌─────────────────────────────────┐
│ Monthly Revenue           [💰] │
│                                 │
│ $4,200                          │
│ Recurring revenue               │
└─────────────────────────────────┘
```

### Pending Payments
```
┌─────────────────────────────────┐
│ Pending Payments          [⏰] │
│                                 │
│ 3                               │
│                                 │
└─────────────────────────────────┘
```

## Recent Payments Card

```
┌──────────────────────────────────────────┐
│ 📈 Recent Payments                       │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Acme Corporation                   │  │
│ │ SUBSCRIPTION                       │  │
│ │ Dec 15, 2025 2:30 PM               │  │
│ │                          $500.00 ✓ │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ John Doe                           │  │
│ │ ONE TIME                           │  │
│ │ Dec 18, 2025 9:15 AM               │  │
│ │                        $1,200.00 ✓ │  │
│ └────────────────────────────────────┘  │
│                                          │
│ [... 3 more payments ...]               │
│                                          │
└──────────────────────────────────────────┘
```

## Upcoming Renewals Card

```
┌──────────────────────────────────────────┐
│ 📅 Upcoming Renewals      Next 7 days    │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Tech Solutions                     │  │
│ │ MAINTENANCE PRO                    │  │
│ │ tech@example.com                   │  │
│ │                 $299  Renews Jan 30│  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Jane Smith                         │  │
│ │ SUPPORT STANDARD                   │  │
│ │ jane@example.com                   │  │
│ │                 $149  Renews Feb 1 │  │
│ └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

## Quick Actions

```
┌──────────────────────────────────────────┐
│ ⚡ Quick Actions                         │
│                                          │
│ ┌──────────┬──────────┬──────────┐      │
│ │    👤+   │    📁+   │    📋    │      │
│ │  Add New │   New    │   View   │      │
│ │  Client  │ Project  │ Payments │      │
│ │          │          │          │      │
│ │ Create a │  Start a │  Review  │      │
│ │  client  │   new    │ payment  │      │
│ │ profile  │ project  │ history  │      │
│ └──────────┴──────────┴──────────┘      │
│                                          │
└──────────────────────────────────────────┘
```

## Interactive Elements

### Hover States

| Element | Default | Hover |
|---------|---------|-------|
| Nav Link | Gray text | White text + Moss background |
| Stat Card | Carbon-light border | Moss-green border |
| Quick Action | Carbon border | Moss-green border + scale |
| Button | Solid color | Darker + shadow |

### Active States

| Element | Indicator |
|---------|-----------|
| Nav Link | Moss-green background + white text |
| Theme Toggle | Sun (light) / Moon (dark) icon |
| Logout Button | Red background (always visible) |

### Loading States

| Element | State |
|---------|-------|
| Logout Button | "Logging out..." + disabled |
| Page Load | Server-rendered (instant) |

## Empty States

### No Recent Payments
```
┌──────────────────────────────────────────┐
│ 📈 Recent Payments                       │
│                                          │
│ No recent payments                       │
│                                          │
└──────────────────────────────────────────┘
```

### No Upcoming Renewals
```
┌──────────────────────────────────────────┐
│ 📅 Upcoming Renewals      Next 7 days    │
│                                          │
│ No renewals in the next 7 days           │
│                                          │
└──────────────────────────────────────────┘
```

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 1024px | Bottom nav, 1-column stats |
| Tablet | >= 768px | Bottom nav, 2-column stats |
| Desktop | >= 1024px | Sidebar, 4-column stats |

## Accessibility Features

### Keyboard Navigation
- **Tab:** Navigate through interactive elements
- **Enter/Space:** Activate buttons and links
- **Escape:** Close modals (future)

### Screen Readers
- All icons have `aria-label` attributes
- Semantic HTML (nav, main, section, article)
- Proper heading hierarchy (h1 → h2 → h3)

### Focus Indicators
- 2px accent-colored outline
- 2px offset from element
- Visible on all focusable elements

## Usage Instructions

### Accessing the Dashboard

1. Navigate to `/admin/login`
2. Enter admin credentials
3. Click "Login"
4. Redirected to `/admin` (dashboard)

### Navigating Between Pages

**Desktop:**
- Click navigation links in left sidebar
- Active page highlighted with moss-green background

**Mobile:**
- Tap icons in bottom navigation bar
- Active page highlighted with accent color

### Switching Themes

1. Click sun/moon icon in header (top-right)
2. Theme changes instantly
3. Preference saved to localStorage
4. Persists across sessions

### Logging Out

1. Click "Logout" button in header (top-right)
2. Session cleared
3. Redirected to `/admin/login`

## Future Enhancements

The following features are planned for future implementation:

1. **Search & Filtering:**
   - Global search in header
   - Filter clients by status
   - Filter payments by date range

2. **Notifications:**
   - Payment failed alerts
   - Upcoming renewal reminders
   - New client notifications

3. **Charts & Graphs:**
   - Revenue trends (line chart)
   - Client acquisition (bar chart)
   - Payment distribution (pie chart)

4. **Bulk Actions:**
   - Select multiple clients
   - Export to CSV
   - Send bulk emails

5. **Advanced Stats:**
   - Year-over-year comparison
   - Client lifetime value
   - Churn rate
   - Average project value

6. **Mobile App:**
   - PWA support
   - Offline functionality
   - Push notifications

## Technical Notes

### Performance
- Server-side rendering for instant page loads
- Parallel database queries (Promise.all)
- Only fetches required data fields
- Optimized for Core Web Vitals

### Security
- Session verification on every page
- HTTP-only cookies
- CSRF protection (future)
- Rate limiting (future)

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 10+)

## Support

For technical issues or feature requests:
- Check documentation in `01-DOCUMENTATION/`
- Review component source in `components/admin/`
- Contact development team

---

**Last Updated:** 2026-01-24
**Version:** 1.0
**Status:** Production Ready

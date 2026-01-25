# CLAUDE.md - Myro Productions Website

This file provides guidance to Claude Code when working in this repository.

## Project Overview

Official website for Myro Productions - a professional AV event production company. The site showcases services, portfolio, and facilitates client inquiries.

## Important: Git Worktree Setup

This project uses git worktrees. The main source code lives in:
```
.worktrees/001-myro-productions-personal-website/
```

**To work on the code:**
```bash
cd .worktrees/001-myro-productions-personal-website/
npm run dev
```

## Technology Stack

- **Framework**: Next.js 15.1.0 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.0
- **Animation**: GSAP 3.12, Motion 11.15
- **React**: 19.0.0

## Design Guidelines

### Brand Colors (TBD)
```css
:root {
  --primary: #000000;      /* TBD */
  --secondary: #ffffff;    /* TBD */
  --accent: #ff6600;       /* TBD - typical AV orange */
}
```

### Typography
- Professional, modern sans-serif fonts
- High contrast for readability

### Imagery
- High-quality event photos
- Equipment showcase
- Team/production shots

## Key Pages

1. **Home** - Hero, services overview, featured work
2. **Services** - Detailed service offerings
3. **Portfolio** - Past events and case studies
4. **About** - Company story, team
5. **Contact** - Contact form, location, phone

## Development Commands

```bash
# Navigate to worktree first
cd .worktrees/001-myro-productions-personal-website/

# Development
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## AI Command Center Integration

This project is tracked in AI Command Center:
- **Status**: on_deck
- **Progress**: Auto-calculated based on milestones
- **API**: http://localhost:3939

### Milestones for Progress
- README.md (+10%)
- package.json (+10%)
- src/ directory (+15%)
- tests/ directory (+10%)
- build/ directory (+15%)
- .git/ directory (+10%)
- Recent file activity (+0-30%)

## Development Workflow

1. Update task status in ACC when starting work
2. Commit changes with descriptive messages
3. Update progress when completing milestones
4. Log important decisions to ACC memories

## Notes

- Focus on mobile-first responsive design
- Optimize images for fast loading
- Implement SEO best practices
- Ensure accessibility (WCAG 2.1 AA)

# Myro Productions Website

Official website for Myro Productions - Cloud, AI & Web Development Services.

## Overview

This project contains the source code and assets for the Myro Productions website, showcasing AWS cloud services, AI development, home lab consulting, and web solutions.

## Tech Stack

- **Framework**: Next.js 15.1 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.0
- **Animation**: GSAP 3.12, Motion 11.15
- **React**: 19.0.0

## Project Structure

```
Myro_Productions_Website/
├── README.md                    # This file
├── CLAUDE.md                    # Claude Code context
├── CLAUDELONGTERM.md            # Long-term patterns
├── .gitignore                   # Git ignore rules
├── .claude/                     # Claude Code config
│   ├── agents/                  # Custom agents
│   └── commands/                # Custom commands
├── .worktrees/
│   └── 001-myro-productions-personal-website/  # <-- Source code lives here!
│       ├── app/                 # Next.js App Router pages
│       ├── package.json
│       └── ...
├── src/                         # (Reserved for future use)
└── docs/                        # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Development

```bash
# Navigate to the worktree containing the source code
cd .worktrees/001-myro-productions-personal-website/

# Install dependencies
npm install

# Start development server
npm run dev      # Runs at http://localhost:3000

# Build for production
npm run build

# Run production server
npm run start
```

## Status

**ACC Status**: on_deck
**Progress**: 35%

## Current State

The project scaffold has been created with:
- Next.js 15 with App Router
- Tailwind CSS 4.0 for styling
- GSAP and Motion for animations
- Basic page structure (layout.tsx, page.tsx, globals.css)

## Next Steps

1. Design homepage hero section
2. Create navigation component
3. Build services page
4. Add portfolio gallery
5. Implement contact form

## Contact

Myro Productions - Cloud, AI & Web Solutions

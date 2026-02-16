# Myro Productions Portfolio Website

> Professional portfolio and client management platform showcasing cloud, AI, and web development services.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

## Overview

A modern, full-stack web application serving as both a professional portfolio and comprehensive client management system. Built with Next.js 15, React 19, and cutting-edge web technologies, this platform demonstrates expertise in cloud architecture, web development, and DevOps practices.

### Key Features

- **Professional Portfolio**: Showcase of projects, services, and technical capabilities
- **Client Management**: Complete CRM system for managing clients, projects, and subscriptions
- **Payment Processing**: Integrated Stripe payment system for one-time and recurring billing
- **Admin Dashboard**: Secure admin interface with role-based access control
- **Self-Hosted**: Deployed on homelab infrastructure with Cloudflare Tunnel
- **Type-Safe**: Full TypeScript implementation with Prisma ORM
- **Animated**: Professional GSAP animations with scroll triggers
- **Tested**: Comprehensive test coverage with Jest and Playwright

## Live Demo

**Production**: [https://myroproductions.com](https://myroproductions.com) (Coming Soon)

**Tech Showcase**:
- Next.js 15 App Router with React Server Components
- Self-hosted Docker deployment on Apple Silicon (M4)
- Cloudflare Tunnel for secure public access
- PostgreSQL database with Prisma ORM
- Stripe payment integration
- JWT authentication with httpOnly cookies

## Technology Stack

### Frontend
- **Framework**: Next.js 15.1.0 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 4.0.0
- **Animations**: GSAP 3.12.5 + ScrollTrigger
- **Icons**: Lucide React 0.562.0
- **Motion**: Motion 11.15.0

### Backend
- **Runtime**: Node.js 20
- **API**: Next.js API Routes
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 6.2.0
- **Authentication**: JWT (jose 6.1.3)
- **Password**: bcrypt 5.1.1
- **Validation**: Zod 4.3.4

### Payments
- **Provider**: Stripe 18.3.0
- **Client SDK**: @stripe/stripe-js 5.3.0
- **React Integration**: @stripe/react-stripe-js 3.2.0

### Infrastructure
- **Container**: Docker (multi-stage builds)
- **Base Image**: Node.js 20 Alpine
- **Hosting**: Self-hosted (Docker on Mac Mini M4)
- **CDN/Tunnel**: Cloudflare
- **SSL**: Cloudflare SSL (TLS 1.3)

### Development
- **Testing**: Jest 30.2.0 + Playwright 1.57.0
- **Linting**: ESLint 9.17.0
- **Version Control**: Git (with worktrees)
- **Package Manager**: npm

## Quick Start

### Prerequisites

- Node.js 20.x or later
- PostgreSQL 14 or later
- npm 10.x or later
- Git 2.35 or later

### Installation

```bash
# Clone repository
git clone git@github.com:Myro-Productions-Portfolio/Myro-Productions-Website.git
cd Myro-Productions-Website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myro_productions?schema=public"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-at-least-32-bytes"

# Stripe (use test keys for development)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Application
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NODE_ENV="development"
```

## Documentation

Comprehensive documentation is available in the [`/docs`](./docs) directory:

- **[Architecture](./docs/ARCHITECTURE.md)** - Complete system architecture and design patterns
- **[Development](./docs/DEVELOPMENT.md)** - Development setup and workflow guide
- **[Deployment](./docs/DEPLOYMENT.md)** - Production deployment with Docker and Cloudflare Tunnel
- **[API](./docs/API.md)** - REST API documentation
- **[Testing](./docs/TESTING.md)** - Testing strategy and guidelines
- **[Contributing](./docs/CONTRIBUTING.md)** - Contribution guidelines
- **[Security](./docs/SECURITY.md)** - Security policy and best practices

### Architecture Decision Records (ADRs)

Major architectural decisions are documented in [`/docs/adr`](./docs/adr):

1. [Next.js 15 with App Router](./docs/adr/ADR-001-nextjs-15-app-router.md)
2. [TypeScript for Type Safety](./docs/adr/ADR-002-typescript-type-safety.md)
3. [Tailwind CSS 4.0 for Styling](./docs/adr/ADR-003-tailwind-css-4.md)
4. [GSAP for Animations](./docs/adr/ADR-004-gsap-animations.md)
5. [Prisma ORM with PostgreSQL](./docs/adr/ADR-005-prisma-postgresql.md)
6. [Stripe for Payments](./docs/adr/ADR-006-stripe-payments.md)
7. [Docker Deployment Strategy](./docs/adr/ADR-007-docker-deployment.md)
8. [Cloudflare Tunnel for Self-Hosting](./docs/adr/ADR-008-cloudflare-tunnel.md)
9. [Git Worktree Development](./docs/adr/ADR-009-git-worktrees.md)
10. [JWT Authentication](./docs/adr/ADR-010-jwt-authentication.md)

## Project Structure

```
myro-productions-website/
├── app/                        # Next.js App Router
│   ├── (public)/              # Public pages
│   │   ├── page.tsx           # Homepage
│   │   ├── about/
│   │   ├── services/
│   │   ├── portfolio/
│   │   └── contact/
│   ├── admin/                 # Protected admin area
│   │   ├── login/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── payments/
│   │   └── subscriptions/
│   ├── api/                   # API routes
│   │   ├── contact/
│   │   ├── webhooks/
│   │   └── admin/
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/                # React components
│   ├── ui/                    # UI primitives
│   ├── layout/                # Layout components
│   └── features/              # Feature components
├── lib/                       # Utility libraries
│   ├── db.ts                  # Prisma client
│   ├── auth.ts                # Authentication
│   └── utils.ts               # Utilities
├── prisma/                    # Database schema
│   ├── schema.prisma          # Prisma schema
│   ├── migrations/            # Migrations
│   └── seed.ts                # Seed data
├── public/                    # Static assets
├── docs/                      # Documentation
│   ├── adr/                   # Architecture Decision Records
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   ├── API.md
│   ├── TESTING.md
│   ├── CONTRIBUTING.md
│   └── SECURITY.md
├── tests/                     # E2E tests
├── middleware.ts              # Auth middleware
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── Dockerfile                 # Production Docker image
└── package.json               # Dependencies
```

## Available Scripts

```bash
# Development
npm run dev                  # Start dev server (http://localhost:3000)
npm run build                # Production build
npm run start                # Start production server
npm run lint                 # Run ESLint

# Database
npm run db:generate          # Generate Prisma Client
npm run db:push              # Push schema (no migration)
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
```

## Features

### Portfolio Website
- Responsive design with Tailwind CSS
- Smooth GSAP animations with scroll triggers
- Services showcase
- Project portfolio with details
- Contact form integration

### Admin Dashboard
- Secure JWT authentication
- Client management (CRUD operations)
- Project tracking
- Payment history
- Subscription management
- Activity logging

### Payment System
- Stripe integration for payments
- One-time payments
- Recurring subscriptions
- Webhook handling
- Refund processing

### Infrastructure
- Docker containerization
- Cloudflare Tunnel for secure access
- PostgreSQL database
- Automated deployments
- Health monitoring

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t myro-productions-website:latest .

# Run container
docker run -d \
  --name myro-website \
  -p 3000:3000 \
  --env-file .env.production \
  myro-productions-website:latest
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

For detailed deployment instructions, see [Deployment Guide](./docs/DEPLOYMENT.md).

## Testing

```bash
# Run all tests
npm run test:all

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Interactive E2E tests
npm run test:e2e:ui
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:all`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Security

Security is a top priority. Please see our [Security Policy](./docs/SECURITY.md) for:
- Reporting vulnerabilities
- Security best practices
- Authentication & authorization
- Data protection
- Compliance

**Report security issues to**: security@myroproductions.com

## Roadmap

### Current Status
- [x] Core website structure
- [x] Admin dashboard
- [x] Payment integration
- [x] Docker deployment
- [x] Cloudflare Tunnel setup
- [x] Comprehensive documentation

### Upcoming Features
- [ ] Blog system
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] API rate limiting dashboard
- [ ] Enhanced monitoring (DataDog/New Relic)

## Performance

Target metrics (Lighthouse):
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

Optimizations:
- Server-side rendering
- Image optimization
- Code splitting
- CDN caching (Cloudflare)
- Database query optimization

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

This project is proprietary and confidential.

Copyright © 2026 Myro Productions. All rights reserved.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - For excellent tooling and analytics
- [Stripe](https://stripe.com/) - Payment infrastructure
- [Cloudflare](https://cloudflare.com/) - CDN and security
- [Prisma](https://prisma.io/) - Next-generation ORM

## Contact

**Myro Productions**
- Website: [https://myroproductions.com](https://myroproductions.com)
- Email: contact@myroproductions.com
- GitHub: [@Myro-Productions-Portfolio](https://github.com/Myro-Productions-Portfolio)

---

**Built with** ❤️ **by Myro Productions** | Cloud, AI & Web Solutions

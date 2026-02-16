# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) documenting significant architectural and technical decisions made during the development of the Myro Productions Portfolio website.

## What are ADRs?

Architecture Decision Records are documents that capture important architectural decisions made along with their context and consequences. They serve as:

- Historical record of technical decisions
- Onboarding material for new team members
- Reference for understanding system architecture
- Documentation of alternatives considered

## ADR Format

Each ADR follows a consistent format:

1. **Status**: Current state (Proposed, Accepted, Deprecated, Superseded)
2. **Context**: Problem statement and background
3. **Decision**: The architectural decision made
4. **Consequences**: Positive, negative, and neutral impacts
5. **Alternatives Considered**: Other options and why they weren't chosen
6. **References**: Links to documentation and resources
7. **Implementation Notes**: Technical details and code examples

## Index of ADRs

### Core Framework & Language

- [ADR-001: Next.js 15 with App Router](./ADR-001-nextjs-15-app-router.md)
  - **Decision**: Use Next.js 15 with App Router for full-stack React application
  - **Key Benefits**: SSR, API routes, React Server Components, excellent DX
  - **Status**: Accepted

- [ADR-002: TypeScript for Type Safety](./ADR-002-typescript-type-safety.md)
  - **Decision**: Full TypeScript implementation with strict mode
  - **Key Benefits**: Compile-time safety, better IDE support, self-documenting code
  - **Status**: Accepted

### Styling & Animation

- [ADR-003: Tailwind CSS 4.0 for Styling](./ADR-003-tailwind-css-4.md)
  - **Decision**: Utility-first CSS with Tailwind CSS 4.0
  - **Key Benefits**: Rapid development, consistency, minimal bundle size
  - **Status**: Accepted

- [ADR-004: GSAP for Professional Animations](./ADR-004-gsap-animations.md)
  - **Decision**: GSAP with ScrollTrigger for animations
  - **Key Benefits**: Professional quality, 60fps performance, powerful scroll effects
  - **Status**: Accepted

### Data & Backend

- [ADR-005: Prisma ORM with PostgreSQL](./ADR-005-prisma-postgresql.md)
  - **Decision**: Prisma ORM for type-safe database access with PostgreSQL
  - **Key Benefits**: Type safety, excellent DX, migration management
  - **Status**: Accepted

- [ADR-006: Stripe for Payment Processing](./ADR-006-stripe-payments.md)
  - **Decision**: Stripe for payment processing and subscriptions
  - **Key Benefits**: Security, developer experience, comprehensive features
  - **Status**: Accepted

### Infrastructure & Deployment

- [ADR-007: Docker Deployment Strategy](./ADR-007-docker-deployment.md)
  - **Decision**: Multi-stage Docker builds with standalone output
  - **Key Benefits**: Reproducibility, isolation, fast rebuilds
  - **Status**: Accepted

- [ADR-008: Cloudflare Tunnel for Self-Hosting](./ADR-008-cloudflare-tunnel.md)
  - **Decision**: Cloudflare Tunnel for secure homelab access
  - **Key Benefits**: Security, DDoS protection, no exposed ports, free CDN
  - **Status**: Accepted

### Development Workflow

- [ADR-009: Git Worktree-Based Development](./ADR-009-git-worktrees.md)
  - **Decision**: Git worktrees for parallel feature development
  - **Key Benefits**: No context switching, side-by-side comparison, clean environments
  - **Status**: Accepted

### Security

- [ADR-010: JWT-Based Authentication](./ADR-010-jwt-authentication.md)
  - **Decision**: JWT with httpOnly cookies for admin authentication
  - **Key Benefits**: Stateless, XSS/CSRF protection, scalability
  - **Status**: Accepted

## Technology Stack Summary

Based on the ADRs above, the complete technology stack is:

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS 4.0
- **Animations**: GSAP 3.12+ with ScrollTrigger
- **UI Library**: React 19

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 6.2+
- **Authentication**: JWT with jose library
- **Password Hashing**: bcrypt

### Payment Processing
- **Provider**: Stripe
- **Integration**: Stripe.js + React Stripe.js
- **Webhooks**: Stripe webhook handlers

### Infrastructure
- **Containerization**: Docker (multi-stage builds)
- **Hosting**: Self-hosted (Mac Mini M4 - nicolasmac)
- **Public Access**: Cloudflare Tunnel
- **Database Hosting**: PostgreSQL in Docker container
- **SSL/TLS**: Cloudflare SSL

### Development
- **Version Control**: Git with worktrees
- **Package Manager**: npm
- **Testing**: Jest + Playwright
- **Linting**: ESLint
- **Code Formatting**: Prettier (implicit)

## How to Use This Directory

### For New Team Members

1. Start with [ADR-001](./ADR-001-nextjs-15-app-router.md) to understand the core framework
2. Read [ADR-002](./ADR-002-typescript-type-safety.md) for type safety approach
3. Review frontend ADRs (003-004) for styling and animations
4. Study backend ADRs (005-006) for data and payments
5. Understand infrastructure ADRs (007-008) for deployment
6. Learn workflow ADRs (009-010) for development practices

### For Architectural Decisions

When making a new architectural decision:

1. Create a new ADR file following the template
2. Number it sequentially (ADR-011, ADR-012, etc.)
3. Document context, decision, and consequences
4. List alternatives considered
5. Update this README with a link to the new ADR
6. Commit the ADR with the related code changes

### For Questioning Decisions

If you disagree with a decision:

1. Read the ADR to understand the context
2. Review alternatives considered
3. If circumstances have changed, propose a new ADR
4. New ADRs can supersede old ones with proper justification

## ADR Template

When creating a new ADR, use this template:

```markdown
# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-YYY]

## Context
[Describe the context and problem statement. What forces are at play?]

## Decision
[Describe the decision that was made. What is the change that we're proposing?]

## Consequences

### Positive
- [List positive consequences]

### Negative
- [List negative consequences]

### Neutral
- [List neutral consequences]

## Alternatives Considered

### 1. [Alternative Name]
**Why Not Chosen**: [Explanation]

### 2. [Alternative Name]
**Why Not Chosen**: [Explanation]

## References
- [Link to documentation]
- [Link to related resources]

## Implementation Notes
[Technical details, code examples, configuration]
```

## Maintenance

ADRs should be:
- **Immutable**: Don't modify accepted ADRs (create new ones to supersede)
- **Clear**: Write for someone unfamiliar with the decision
- **Concise**: Focus on the decision, not implementation details
- **Current**: Update status if decisions change

## Questions?

For questions about any architectural decision, please:
1. Read the relevant ADR thoroughly
2. Check implementation notes in the ADR
3. Review referenced documentation
4. Ask in team discussions if still unclear

---

**Last Updated**: 2026-02-16
**Total ADRs**: 10
**Active ADRs**: 10

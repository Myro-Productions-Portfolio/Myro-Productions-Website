# ADR-001: Next.js 15 with App Router

## Status
Accepted

## Context
The project required a modern React framework capable of delivering high-performance web applications with excellent developer experience. Key requirements included:

- Server-side rendering (SSR) and static site generation (SSG) capabilities
- Built-in API routes for backend functionality
- File-based routing system for intuitive project organization
- Support for React Server Components
- Excellent TypeScript integration
- Production-ready performance optimizations
- Strong ecosystem and community support

## Decision
Adopt Next.js 15 with the App Router architecture as the primary web framework for the Myro Productions portfolio website.

The implementation includes:
- App Router for file-based routing (`/app` directory structure)
- React Server Components for optimal performance
- Server Actions for simplified data mutations
- Streaming and Suspense for progressive loading
- Middleware for authentication and request handling
- API routes for backend services (admin, payments, webhooks)

## Consequences

### Positive
- **Performance**: Automatic code splitting, optimized bundle sizes, and edge runtime support deliver exceptional load times
- **Developer Experience**: File-based routing, hot module replacement, and TypeScript integration provide smooth development workflow
- **SEO**: Server-side rendering ensures excellent search engine optimization out of the box
- **Full-Stack Capability**: Unified frontend and API routes in a single codebase simplifies architecture
- **React 19 Support**: First-class support for the latest React features including Server Components
- **Deployment Flexibility**: Can deploy to Vercel, Docker containers, or any Node.js environment
- **Built-in Optimizations**: Image optimization, font optimization, and automatic static optimization

### Negative
- **Learning Curve**: App Router introduces new patterns (Server Components, Server Actions) that differ from traditional React
- **Build Complexity**: Some configuration required for advanced features (standalone output, environment variables)
- **Migration Path**: Future breaking changes in major versions may require refactoring
- **Bundle Size**: Next.js framework itself adds some overhead compared to minimal React setups

### Neutral
- **Opinionated Structure**: The framework enforces certain patterns, which provides consistency but limits some architectural freedom
- **Ecosystem Lock-in**: While portable, the codebase is optimized for Next.js-specific features

## Alternatives Considered

### 1. Vite + React Router
**Why Not Chosen**:
- Requires more manual configuration for SSR
- No built-in API routes
- Less opinionated structure requires more architectural decisions
- Smaller ecosystem for production features

### 2. Remix
**Why Not Chosen**:
- Smaller community and ecosystem
- Less mature tooling and documentation
- Different mental model for data loading
- Fewer deployment options at the time of decision

### 3. Gatsby
**Why Not Chosen**:
- Primarily focused on static sites
- Complex plugin ecosystem
- Slower build times for large sites
- Less flexible for dynamic content

### 4. Create React App (CRA)
**Why Not Chosen**:
- No SSR capabilities
- No built-in API routes
- Poor performance for SEO-critical sites
- Project is no longer actively maintained

## References
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

## Implementation Notes
- Project uses standalone output mode for Docker deployment
- Custom middleware.ts for authentication and request handling
- API routes organized under `/app/api/` directory
- Environment variables configured for public and server-side access
- Build optimized with Vercel Analytics and Speed Insights integration

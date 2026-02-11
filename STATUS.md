# Myro Productions Website - Status (2026-02-10)

## Current State: DEPLOYED

Site is live on Mac Mini Docker, served through Cloudflare.
- Container: `myroproductions-website` on port 3001
- Compose: `/Volumes/DevDrive/Data/docker/myroproductions-deployment/`
- Remotes: GitHub (origin) + Gitea (homelab) both at `e1f4a1d`

## What Was Done Tonight

### Kiro Refactoring (reviewed + deployed)
- Contact.tsx split into `useContactForm` hook, `ContactInfo`, `ContactFormFields`
- FadeInView + StaggerChildren replaced by unified `AnimateOnScroll`
- portfolio-data-extended consolidated into portfolio-data
- New `FormField` component + `lib/validation/contactValidation`
- Removed unused `dynamic-imports.ts`

### Synced Worktree to Root
- Admin dashboard, Stripe payment system, Prisma schema all synced from worktree to root (Docker builds from root)

### Bug Fixes
- ZodError `.errors` -> `.issues` across 12 API routes
- Button named export for payment pages
- Lazy Stripe client init (no build-time env crash)
- Prisma generate added to Dockerfile
- Build args for NEXT_PUBLIC vars in Dockerfile
- Docker deployment .env created with all keys

### Cleanup
- Removed dev artifacts (test outputs, setup scripts, bat files, nul)
- Added .kiro/ and .code-workspace to .gitignore

## Open Items

### Must Fix (next session)
- **Stripe SDK type mismatches** - `typescript.ignoreBuildErrors` is ON as a workaround. The installed Stripe SDK is newer than what the code was written for. Properties like `current_period_start`, `Invoice.subscription`, `Invoice.charge` have moved in the newer API.
- **Stripe webhook secret** - empty. Need to set up webhook endpoint in Stripe Dashboard pointing to `https://myroproductions.com/api/stripe/webhooks`, then copy the signing secret to the Mac Mini `.env`.

### Should Do
- Switch Stripe from test keys to live keys when ready
- Remove `eslint.ignoreDuringBuilds` from next.config once lint errors are cleaned up
- Database: verify PostgreSQL on Mac Mini is accessible from Docker container via `host.docker.internal:5433`

### Nice to Have
- Adopt `FormField` component in other forms
- Integrate `AnimateOnScroll` into actual page sections
- Add proper Prisma types to replace `any` in admin API where clauses

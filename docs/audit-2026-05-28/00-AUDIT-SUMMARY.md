# Audit Summary — myro-productions-website

**Date:** 2026-05-28
**Posture:** External developer auditor handing off to a new dev team
**Current state of the site:** Not live. Host (Mac Mini) recommissioned. Code at commit `f1c176b` on `master`.

This document is the executive synthesis. The four detailed lenses live next to it:

- `01-structure.md` — directory layout, dead code, doc accuracy
- `02-code-quality.md` — TS/ESLint suppressions, Stripe drift, `any` usage, tests
- `03-security.md` — CSP conflict, seeded password, webhook secret, rate limiting, npm audit
- `04-hosting.md` — Cloudflare vs AWS vs hybrid, with cited pricing

---

## TL;DR

**Refactor, don't rebuild.** All four lenses independently arrived at the same conclusion. The foundations are sound — App Router structure is correct, auth pattern is sound (JWT + bcrypt + httpOnly cookies + per-route guards), Prisma is used safely (no raw unsafe queries), Stripe webhook verification is wired up correctly. The problems are surgical: build flags hiding type errors, a seed file with a hardcoded password, a CSP defined twice with the wrong one winning, a stale committed `.worktrees/` clone, and a README that describes a fictional structure. Estimated cleanup: roughly one focused week of work before re-hosting.

**Hosting verdict: Hybrid (Cloudflare DNS + AWS ECS Fargate), ~$28–$32/month.** This is not really "AWS-only vs Cloudflare-only" — the domain is already on Cloudflare and there's no reason to move it. Cloudflare-only would force rewriting bcrypt and the Prisma connection layer because Workers don't run native Node modules. That's real code surgery for ~$20/month in savings, and it contradicts the stated goal of learning AWS. ECS Fargate uses the existing Dockerfile as-is.

---

## Verdict by Lens

| Lens | Grade | Single biggest issue |
|---|---|---|
| Structure | Mixed | `.worktrees/` is a full second copy of the repo, tracked in git |
| Code quality | C+ | TypeScript and ESLint both turned off at build time |
| Security | Acceptable, not production-ready | CSP defined in two places; the wrong (incomplete) one wins |
| Hosting fit | — | Cloudflare-only requires nontrivial rewrites for this stack |

---

## The Six Must-Fix Items Before Re-Hosting

Ordered by what would actually block a clean deployment, not by abstract severity.

1. **Fix Stripe SDK type mismatches and remove the build suppression flags** (`next.config.ts:9-11, 15-17`). The current build only succeeds because TS and ESLint are turned off. `lib/stripe/webhook-handlers.ts` accesses fields that moved in Stripe SDK 18.x (`subscription.current_period_start`, `invoice.subscription`, `invoice.charge`). This is documented in STATUS.md and is the root cause of the suppression flags. Until this is fixed, the build provides no type safety. — *Code-quality Findings 1 & 2.*

2. **Set `STRIPE_WEBHOOK_SECRET`**. STATUS.md flagged this as open. The webhook handler returns 500 when the secret is unset. Every Stripe event (payment confirmations, subscription updates, invoice events) silently drops until this is resolved. Create the endpoint in Stripe Dashboard pointed at `https://myroproductions.com/api/stripe/webhooks`, copy the `whsec_`. — *Security Finding 3.*

3. **Consolidate the CSP**. `middleware.ts` and `next.config.ts` both define a Content Security Policy. Middleware wins at runtime and its version is missing `frame-src https://calendly.com`, `connect-src https://api.web3forms.com`, and `upgrade-insecure-requests`. Calendly embed and contact form submissions will silently fail in production. Delete the CSP block from `middleware.ts` lines 26-36, keep only the one in `next.config.ts`. — *Security Finding 1.*

4. **Remove the hardcoded admin password from `prisma/seed.ts:11`** (`ChangeMe123!`, committed in `b38b853`). It is in the permanent git history. Replace with `process.env.ADMIN_SEED_PASSWORD` and throw if unset. Also raise the seed's bcrypt rounds from 10 to 12 to match the rest of the app. — *Security Finding 2.*

5. **Add rate limiting to the admin login route** (`app/api/admin/auth/login/route.ts`). Currently zero. The contact form has it; the higher-value login endpoint does not. The middleware `checkRateLimit` stub is commented out. — *Security Finding 4 / Code-quality Finding 8.*

6. **Address the `npm audit` findings**: 1 critical (`handlebars` AST type confusion) and 10 high (including a `next` HIGH affecting the self-hosted Image Optimizer, which this project uses via `output: 'standalone'`). Run `npm audit fix`, review the diff. — *Security Finding 7.*

---

## The Cleanup Sprint (Beyond the Must-Fixes)

These are non-blocking but high value, ordered by how much confusion they eliminate.

- **Delete `.worktrees/` from git tracking**. Add `.worktrees/`, `.claude/`, `.auto-claude-status`, `.claude_settings.json` to `.gitignore`. ADR-009 incorrectly claims this is already done. — *Structure Finding 1 & 7.*
- **Rewrite the README's project structure section**. The current one (lines 162–208) describes route groups, `components/layout/`, `components/features/`, `lib/db.ts`, `lib/auth.ts` — none of which exist. Document what actually exists. — *Structure Finding 2.*
- **Fix `playwright.config.ts:8`** — `testDir: './__tests__/e2e'` points at a path that doesn't exist. Tests live at `03-TESTS/__tests__/e2e/`. Either move tests or fix the config. — *Structure Finding 3.*
- **Verify Jest test discovery on resurrected host**. The structure agent says Jest's `**/__tests__/**` glob will find `03-TESTS/__tests__/`; the code-quality agent says it won't. Run `npm test` and confirm one way or the other. — *Cross-reference: Structure Finding 3 vs Code-quality Finding (in 02 doc).*
- **Update the E2E homepage test** (`03-TESTS/__tests__/e2e/homepage.spec.ts:23-29`) — asserts 5 sections, actual page has 8 (`app/page.tsx:39-53`). Missing: Process, Pricing, FAQ. — *Structure Finding 4.*
- **Replace `: any` Prisma where-clauses** in 4 admin API files with the proper `Prisma.*WhereInput` types. — *Code-quality Finding 3.*
- **Consolidate animation libraries** — either GSAP or `motion`, not both. ~75KB+ bundle bloat. — *Code-quality Finding 7.*
- **Replace in-memory rate limiting** in `app/api/contact/route.ts` with a Redis-backed solution (Upstash). Module-memory limits do not survive container restarts. — *Code-quality Finding 4 / Security Finding 10.*
- **Remove the Calendly webhook GET handler** (`app/api/webhooks/calendly/route.ts:593-604`) — leaks integration configuration status to unauthenticated callers. — *Security Finding 9.*
- **Add `.env.example`** — the README tells the developer to copy it and it doesn't exist. — *Structure Finding 10.*
- **Decide on `01-DOCUMENTATION/` vs `docs/`**. Two doc trees with overlapping topics. Pick one, archive the other. — *Structure Finding 5.*
- **Generate a baseline Prisma migration**. `prisma/migrations/` is empty; README's `npm run db:migrate` does not work as documented. — *Structure Finding 8.*

---

## Refactor-vs-Rebuild — All Lenses Agree

Every lens independently lands on **refactor**:

- **Structure:** "Refactor. The core source is cleanly organized... The problems are all additive debt, not architectural rot."
- **Code quality:** "Refactor. The foundational decisions are sound... The codebase is verbose but not deeply entangled — a new developer can read any single API route in isolation and understand it completely."
- **Security:** "Refactor. Every security finding here is surface-level and surgical... Nothing in this audit suggests structural rot."
- **Hosting:** The Dockerfile and `output: 'standalone'` config work as-is for the recommended hosting target. Zero code changes required for hybrid hosting.

The pattern choices were good. The execution is incomplete. That's a much better problem than the inverse.

---

## Hosting Decision

The full reasoning is in `04-hosting.md` with cited pricing. The short version:

| Option | Monthly | Code changes | AWS learning | Verdict |
|---|---|---|---|---|
| A: Cloudflare-only | $7–$12 | **Major** (bcrypt, Prisma adapter, Neon migration) | None | Wrong path given your stated AWS-learning goal |
| B1: AWS ECS Fargate | $28–$30 | **None** | Strong | **Recommended.** Existing Docker image runs as-is. |
| B2: AWS Amplify | $5–$10 | Minor | Low | Eliminated — can't connect to RDS in private VPC |
| B3: AWS Lambda/OpenNext | $3–$6 | None | Moderate | Valid alternative if you specifically want serverless; doesn't teach ECS/VPC/containers |
| C: Hybrid (Cloudflare + ECS) | $28–$32 | **None** | Strong | **Recommended.** This is what B1 actually looks like when your DNS is already on Cloudflare. |

**Recommendation: Option C.** Keep Cloudflare as DNS/CDN/WAF (free, and the domain is already there). Run the existing Docker container on ECS Fargate. Use RDS db.t4g.micro Single-AZ for Postgres. Use API Gateway HTTP API + VPC Link for ingress (saves $9/month over ALB). Leaves $68–$72/month of headroom against your $100 budget.

**One pushback on your original framing:** the "Cloudflare vs AWS" binary was incomplete. The two are not mutually exclusive — most production stacks in 2026 use both, with Cloudflare absorbing edge traffic and AWS running compute. You don't have to pick a side; you already use Cloudflare and that's fine. The decision is really "where does the *compute* live" — and for this app, that's ECS Fargate on AWS.

---

## What I Would Tell the New Dev Team

> The app is healthy below the surface. The auth pattern is right, the data model is reasonable, the Stripe integration is correctly structured. What you're inheriting is a project that was 90% built by an automated workflow and never got the human polish pass. The README lies about the directory structure. There's a stale clone of the entire repo committed in `.worktrees/`. The build only passes because TS and ESLint are turned off. The CSP is defined twice. There's a hardcoded admin password in `prisma/seed.ts`. The Stripe SDK was upgraded without updating the code that uses it.
>
> Spend a week fixing those things in the order listed above and you'll have a project that's actually ready to redeploy. Don't be tempted to rewrite — the code is fine. It just needs an editor.

---

## Open Questions for the Owner

These are decisions the audit cannot make. Three at most so I'm not interrupting unnecessarily.

1. **Are you keeping Stripe payments + admin dashboard, or is this becoming a static portfolio site?** This materially changes everything downstream. If you don't actually want the CRM + payment infrastructure, the right move is to delete `app/admin/`, `app/api/admin/`, `app/api/stripe/`, `prisma/`, and `middleware.ts`'s auth logic — and then Cloudflare-only becomes a real option because there's no database left to migrate. The current code is sized for a real business platform; a portfolio doesn't need it.

2. **Are the admin email and the seed admin user still relevant?** `prisma/seed.ts` hardcodes `pmnicolasm@gmail.com`. Confirm before redeploying so this isn't accidentally provisioned.

3. **What are "the features and services you want to use" inside the $100/mo budget?** The audit reserved roughly $70/mo of headroom on the recommended hosting. Naming the actual planned features (analytics? email? CMS? blog? AI integrations?) lets us validate the budget against reality rather than against a placeholder.

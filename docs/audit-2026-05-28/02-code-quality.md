# Code Quality Audit

**Date:** 2026-05-28
**Lens:** Code quality and staleness

## Verdict

**Grade: C+.** The codebase is structurally coherent — Zod validation on inputs, consistent auth middleware, proper cookie flags on the JWT session, timing-safe CSRF comparison — but it is held together by two suppression flags (`typescript.ignoreBuildErrors: true`, `eslint.ignoreDuringBuilds: true`) that mask an unknown number of live type errors. The single biggest code-quality problem is that the **build passes only because TypeScript and ESLint checks are turned off**. STATUS.md confirms live Stripe SDK type mismatches as the proximate cause. The test situation is also degraded — Playwright's `testDir` points at a path that doesn't exist (see structure audit Finding 3), and the Jest tests in `03-TESTS/__tests__/` need verification on the resurrected host that the glob `**/__tests__/**` actually picks them up.

## Quantitative Summary

| Metric | Count |
|---|---|
| TS errors (real count) | Unknown — `ignoreBuildErrors: true` masks all |
| ESLint errors (real count) | Unknown — `ignoreDuringBuilds: true` masks all |
| `any` suppressions (`eslint-disable @typescript-eslint/no-explicit-any`) | 12 (8 in `app/api/`, 4 in `lib/stripe/`) |
| `any`-typed variables in production code | ~12 actual `: any` declarations |
| `console.*` calls in `app/` | 51 across 20 files |
| `console.*` calls in `lib/` | 29 across 4 files |
| TODO/FIXME comments | 3 in source (`next.config.ts` ×2, `components/sections/Footer.tsx` ×1) |
| Test files that exist | 15 unit + 4 integration + 4 e2e = 23 files in `03-TESTS/__tests__/` |

## Findings

### 1. TypeScript and ESLint both suppressed at build time (Severity: High, Confidence: 100)

`next.config.ts` lines 9–11 and 15–17 disable both checks for all builds. The TODO comments acknowledge these as temporary, but they've been in place since at least the STATUS.md date of 2026-02-10. The actual error count is unknown — STATUS.md explicitly documents live Stripe SDK type mismatches as unresolved.

```ts
typescript: {
  ignoreBuildErrors: true,
},
eslint: {
  ignoreDuringBuilds: true,
},
```

**Fix:** Address the Stripe SDK type mismatches first (Finding 2), then restore both to `false`.

### 2. Stripe SDK `any` workarounds are pervasive and document live type errors (Severity: High, Confidence: 100)

`lib/stripe/config.ts` line 5: `let _stripe: any = null;` bypasses the type check entirely.

`lib/stripe/webhook-handlers.ts` directly accesses moved fields:
- Lines 195–196, 207–208: `subscription.current_period_start` — moved in Stripe SDK 18.x
- Line 252: `invoice.subscription` — moved
- Line 277: `invoice.charge` — moved

These compile only because the build flag suppresses errors.

**Fix:** Restore `_stripe: Stripe | null`. Consult Stripe SDK 18.x changelog and update accessors. Then remove `ignoreBuildErrors`.

### 3. Admin API `where` clauses typed as `any` in 4 files (Severity: Medium, Confidence: 100)

- `app/api/admin/clients/route.ts:50`: `const where: any = {};`
- `app/api/admin/payments/route.ts:54`: `const where: any = {};`
- `app/api/admin/subscriptions/route.ts:40`: `const where: any = {};`
- `app/api/admin/projects/[id]/route.ts:129`: `const updateData: any = {};`

**Fix:** Replace with `Prisma.ClientWhereInput`, `Prisma.PaymentWhereInput`, etc.

### 4. In-memory rate limiting and deduplication will not work in Docker/serverless (Severity: Medium, Confidence: 95)

`app/api/contact/route.ts` lines 76–84: module-level `Map` for rate limiting. `app/api/webhooks/calendly/route.ts` lines 35–37: module-level `Map` for dedup. Module memory resets on every process restart and is not shared across replicas. The contact rate limiter is reset-on-restart bypassable.

**Fix:** Move to Redis-backed (Upstash) for rate limiting. Dedup is acceptable to leave with a comment.

### 5. Stripe error detection uses `(error as any).type` instead of typed error classes (Severity: Medium, Confidence: 95)

- `app/api/admin/payments/[id]/refund/route.ts:196`: `if ((error as any).type === 'StripeInvalidRequestError')`
- `app/api/admin/subscriptions/create/route.ts:152`: same pattern

**Fix:** `if (error instanceof Stripe.errors.StripeInvalidRequestError)`.

### 6. Test files are duplicated across `03-TESTS/` and `.worktrees/` (Severity: Medium, Confidence: 100)

Identical test files exist in `03-TESTS/__tests__/` AND `.worktrees/001-myro-productions-personal-website/__tests__/`. Maintaining duplicates guarantees divergence. (Cross-references structure audit Finding 1.)

**Fix:** Delete `.worktrees/` from git tracking. Decide on canonical test location.

### 7. Two overlapping animation libraries: GSAP + motion (Severity: Low, Confidence: 85)

`gsap@3.12.5` AND `motion@11.15.0` both as deps. GSAP used in `lib/animations.ts`, `lib/warpAnimation.ts`. `motion/react` imported in `Navigation.tsx`, `Portfolio.tsx`, `PortfolioCard.tsx`. Two animation libraries adds ~75KB+ to the bundle.

**Fix:** Consolidate to one library. GSAP is the heavier investment — remove `motion` and migrate the 3 files.

### 8. Login route has no brute-force protection (Severity: Medium, Confidence: 85)

`app/api/admin/auth/login/route.ts` has no rate limit. The contact route has in-memory rate limiting; the higher-value admin login does not. **Cross-references the security audit, which flags this as a CRITICAL finding.**

**Fix:** Apply rate limiting (preferably Redis-backed).

### 9. Webhook handler silences all errors and returns 200 regardless (Severity: Medium, Confidence: 80)

`app/api/stripe/webhooks/route.ts` lines 103–113 catch any handler error and return `{ received: true }` with HTTP 200. Transient DB errors permanently lose the event with no Stripe retry.

**Fix:** Return HTTP 500 for transient errors so Stripe retries. Reserve 200-regardless for idempotency errors only.

## Build Status Assessment

The build will structurally succeed given the flags. `output: 'standalone'` is set correctly. The Dockerfile is well-structured (multi-stage, non-root user, Prisma generate before build). The reason it succeeds is entirely `ignoreBuildErrors: true` — without it, the Stripe SDK type mismatches in `webhook-handlers.ts` would fail the build.

## Refactor-vs-Rebuild Lean

**Refactor.** The foundational decisions are sound: Zod on all inputs, auth middleware applied consistently, cookie security flags correct, webhook signature verification present in both Stripe and Calendly handlers, proper Prisma upsert patterns. The problems are concentrated in three fixable areas: (1) fix the 12 Stripe type errors and remove the build suppressions, (2) verify/fix the test discovery paths, (3) replace in-memory rate limiting with something persistent. None of these require architectural change.

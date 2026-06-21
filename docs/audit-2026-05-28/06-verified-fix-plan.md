# Verified Fix Plan — 2026-05-28

_Produced by the audit-verify-and-plan workflow. All 18 findings re-verified against the live running container (tsc, jest, npm audit, curl). Read-only — nothing applied._

## Summary

All 17 findings were live-verified by the upstream verifier. Result: 15 confirmed, 2 partially-true (SEC2-seed-pw, SEC6-calendly-get-leak), 0 refuted. One finding (SEC2) is already half-fixed: the env-driven seed rewrite exists in the working tree but is uncommitted, and the plaintext credential is still permanently in git history (commit b38b853). The Jest contradiction (STRUCT4) is definitively resolved in favor of the structure audit — Jest does discover and run 03-TESTS. No finding requires code changes to "make Jest find tests"; the only real Jest defect is the worktree double-counting. The plan below is ordered: Batch 1 zero-risk mechanical cleanup (gitignore, deletions, doc fixes, config paths, npm audit fix, commit the existing seed fix), Batch 2 pure-code security must-fixes (CSP consolidation, login rate-limit, Calendly GET disclosure, Stripe webhook 200-on-error), Batch 3 type-safety (Stripe SDK fields, Prisma types) culminating in the build-suppression flag removal which MUST be last because flipping the flags before the 13 TS / 21 lint errors are fixed breaks the production `next build`. Items needing an owner decision (Upstash/Redis dependency, motion-vs-GSAP, webhook secret ops, git-history scrub, credential rotation) are pulled out separately.

## Jest Contradiction — RESOLVED

DEFINITIVELY RESOLVED — the structure audit was correct, the code-quality audit was wrong. Proof is the actual jest run captured in STRUCT4: `npx jest --listTests` returns 32 test files, ALL under either 03-TESTS/__tests__/ or .worktrees/.../__tests__/ (zero at repo root). `npx jest` summary: "Test Suites: 8 failed, 24 passed, 32 total / Tests: 42 failed, 458 passed, 500 total / Time: 7.306 s". A failing stack trace points directly into the suite: "at Object.getByLabelText (03-TESTS/__tests__/integration/Contact.test.tsx:396:35)". So Jest unambiguously finds, executes, and reports on 03-TESTS. The mechanism is jest.config.ts lines 32-35: testMatch = ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)test.[jt]s?(x)']; the leading '**/' is rootDir-relative and recursive, so it matches '03-TESTS/__tests__/...' exactly as it matches a top-level '__tests__/'. The code-quality audit's claim that testMatch returns 0 tests is flatly refuted by the run output. SECONDARY REAL DEFECT (not the contradiction, but surfaced by it): the .worktrees/ copy is NOT in testPathIgnorePatterns, so Jest loads every test twice (~16 real + ~16 stale duplicates) and emits haste-map collisions ("duplicate manual mock found: fileMock/styleMock", "Haste module naming collision: myro-productions-website"). The 500-tests/42-failures counts are inflated by this double-run. Fix is in STRUCT4 proposed_fix Batch-1 (add '<rootDir>/.worktrees/' to testPathIgnorePatterns + modulePathIgnorePatterns). The 42 underlying failures (e.g. Contact.test.tsx:396 getByLabelText('LinkedIn Profile')) are real test-vs-component drift to triage AFTER de-duplication gives true counts — flagged as follow-up, out of scope for this fix-plan.

## Already Fixed This Session

- SEC2-seed-pw (CODE ONLY, uncommitted): the working-tree prisma/seed.ts is already the correct env-driven version (process.env.ADMIN_SEED_PASSWORD + refusal guard if unset + bcrypt rounds 12). It just needs committing (Batch 1 #7) — no further code edit. The residual git-history exposure and credential rotation remain open (see human_decisions). HEAD still ships plaintext until the commit lands.
- STRUCT4-jest-contradiction (DOCUMENTATION resolution): no code change is needed to make Jest discover the 03-TESTS suite — it already does (proven by the live run). Only the worktree de-duplication cleanup (Batch 1 #3) remains as an actual change.

## Needs Owner Decision

- CQ4-ratelimit-memory (and the same limitation in SEC4 login limiter): the in-memory Map rate-limit + Calendly 24h dedup do not survive container restarts or multiple replicas. Fixing properly adds a dependency + external service. Owner must choose: (A) Upstash Redis (@upstash/ratelimit + @upstash/redis, paid SaaS REST clients, adds UPSTASH_REDIS_REST_URL/TOKEN secrets); (B) self-hosted Redis container in the existing docker-compose with ioredis (keeps everything on the homelab — likely the better fit for a single-host deploy); or (C) accept the limitation for now (single-replica, low traffic) and just document it — the only live risk is duplicate emails/ACC POST on a restart-coincident Calendly retry, since markEventProcessed runs before the work.
- CQ6-anim-libs: both gsap (~20 files, load-bearing site-wide) and motion (only 3 files: PortfolioCard, Navigation, Portfolio — all relying on AnimatePresence exit-on-unmount) are deps. Consolidating to GSAP removes motion + transitive framer-motion but requires re-implementing exit/unmount animations (GSAP timeline + Flip plugin), 2-4h of work and added complexity. Trade-off: ~few-hundred-KB JS saving vs AnimatePresence ergonomics. Owner decides whether the bundle saving is worth it; keep motion if not.
- SEC3-webhook-secret: STRIPE_WEBHOOK_SECRET is empty (.env.local:12), so every Stripe event returns 500 and is dropped. The route CODE is correct and must NOT be changed — this is pure ops: create the endpoint in Stripe Dashboard, copy the whsec_ signing secret into the deployment env (and .env.local for local), restart the container, verify with `stripe trigger`. For local dev use `stripe listen` which prints its own whsec_. Owner/operator must perform the secret provisioning; it cannot be done from code.
- SEC2-seed-pw history/rotation: after committing the seed fix (Batch 1 #7), the plaintext (pmnicolasm@gmail.com / ChangeMe123!) is still permanently retrievable from history (commit b38b853). Owner must (a) rotate/reset that AdminUser password anywhere it was ever seeded — treat ChangeMe123! as compromised; and (b) decide whether to scrub history via `git filter-repo --replace-text` + force-push (rewrites SHAs, requires all clones to re-clone — coordinate first). Both are out-of-band of the code fix.
- STRUCT1-worktree history bloat: untracking + gitignoring .worktrees (Batch 1 #4) stops future tracking but leaves ~7.6MB of blobs in history. Removing them needs `git filter-repo --path .worktrees --invert-paths` (or BFG) — a history rewrite + force-push. Separate higher-risk decision; only pursue if history size matters.
- STRUCT5-prisma-migrations: prisma/migrations/ is absent so the documented `npm run db:migrate` / `prisma migrate deploy` flow cannot work (this session's DB was set up via `prisma db push`). Generating a committed baseline migration is low-risk BUT the choice of method needs a decision: generate `migrate dev --name init` against a FRESH/empty DB (cleanest), or baseline the existing populated DB via `migrate diff --from-empty ... > 0_init/migration.sql` + `migrate resolve --applied 0_init` (avoids drift errors). Owner should confirm which DB to baseline against before this is run.

## Ordered Fix Plan

### Batch 1: zero-risk mechanical cleanup

**[1] SEC5-npm-audit** — risk: low, effort: 15 min

Run `npm audit fix` (NO --force). All 17 vulns (1 critical handlebars, 10 high incl. direct-dep next 15.5.9->15.5.18) report fixAvailable=true and NONE are flagged isSemVerMajor; dry-run shows only in-range patch/minor bumps (next->15.5.18, @prisma/*->6.19.3, eslint/ts-jest sub-deps, tar via @mapbox/node-pre-gyp). Do NOT use --force (would risk semver-major churn, not needed here). Note package-lock.json already has uncommitted churn from this session — review the diff before committing so unrelated lock changes are not bundled.

Files: `package-lock.json`, `package.json`

**[2] STRUCT3-playwright-testdir** — risk: low, effort: 2 min

Fix the dead Playwright testDir. playwright.config.ts line 7: change `testDir: './__tests__/e2e'` to `testDir: './03-TESTS/__tests__/e2e'` (the 4 spec files homepage/performance/responsive/seo resolve there; `./__tests__` does not exist so `npm run test:e2e` currently discovers zero tests). Verify with `npx playwright test --list`.

Files: `playwright.config.ts`

**[3] STRUCT4-jest-contradiction** — risk: low, effort: 5 min

Stop Jest double-running the worktree copy. In jest.config.ts add '<rootDir>/.worktrees/' to testPathIgnorePatterns (lines 27-31, alongside node_modules/.next/e2e) AND add modulePathIgnorePatterns: ['<rootDir>/.worktrees/'] to silence the haste/package.json collision. After: `npx jest --listTests | grep -c '^/Volumes'` should drop to ~16 and the duplicate-mock/haste warnings disappear, giving true pass/fail counts. (No code change is needed to 'make Jest discover tests' — it already does; see jest_contradiction_resolution.) The 42 underlying real failures are a SEPARATE follow-up to triage after de-dup.

Files: `jest.config.ts`

**[4] STRUCT1-worktree** — risk: low, effort: 5 min

Untrack the committed 7.6MB full repo copy. `git rm -r --cached .worktrees` (keeps it on disk), append '.worktrees/' to .gitignore, commit. Confirm the on-disk copy is genuinely stale before any disk deletion (out of scope here). NOTE history-bloat residue: the ~7.6MB of blobs remain in git history; a `git filter-repo --path .worktrees --invert-paths` is a separate higher-risk history-rewrite decision (see human_decisions).

Files: `.gitignore`

**[5] STRUCT6-stray-files** — risk: low, effort: 10 min

Remove tracked stray files and add ignore rules. `git rm components/ui/Navigation.md`; `git rm -r .claude`; `git rm .auto-claude-status`; `git rm -r 04-ASSETS` (3 files: Hero-Image-1.png and Nic-Myers-Profile-Pic.png are byte-identical dupes of public assets, zero source references; Hero-Image-2.png is the higher-res un-optimized original 2.1MB vs public 1.76MB — if wanted as a source master, move to an ignored assets dir rather than delete). src/.gitkeep deletion is OPTIONAL (harmless empty placeholder) — skip if any build step expects src/. Append to .gitignore: '.auto-claude-status', '04-ASSETS/', '.claude/'. Recommend NOT adding the aggressive 'components/ui/*.md' glob (would mask intentional docs) — rely on review.

Files: `.gitignore`, `components/ui/Navigation.md`, `04-ASSETS/`, `.claude/`, `.auto-claude-status`

**[6] STRUCT2-readme-fiction** — risk: none, effort: 10 min

Replace the fictional Project Structure block in README.md lines 161-187 (documents non-existent app/(public)/, components/layout/, components/features/, lib/db.ts, lib/auth.ts, lib/utils.ts) with the verified tree from STRUCT2 proposed_fix (actual: app/page.tsx, app/admin/{login,clients,projects,payments,subscriptions,settings}, app/api/{admin,contact,stripe,webhooks}, components/{ui,sections,admin,animations,icons,seo,stripe}, lib/prisma.ts, lib/auth/ as a directory, lib/{validation,stripe,hooks}, csrf.ts). Confirm docs/ subtree detail with maintainer if that granularity is wanted.

Files: `README.md`

**[7] SEC2-seed-pw** — risk: low, effort: 10 min

PARTIALLY-FIXED: commit the existing working-tree seed fix only. The working tree prisma/seed.ts is ALREADY the correct env-driven version (process.env.ADMIN_SEED_PASSWORD, refusal guard, bcrypt rounds 12) but is uncommitted (`git status` => ' M prisma/seed.ts'); HEAD still ships plaintext `ChangeMe123!`. No edit needed — stage and commit prisma/seed.ts as-is so HEAD stops shipping the default. NOTE: this does NOT remove the residual risk — the plaintext (pmnicolasm@gmail.com / ChangeMe123!) is permanently in history at commit b38b853. Credential rotation + optional history scrub are owner decisions (see human_decisions), NOT a code edit.

Files: `prisma/seed.ts`

### Batch 2: security must-fixes (pure code)

**[8] SEC1-csp-split** — risk: medium, effort: 15 min

Consolidate CSP to a single source. The SERVED policy is middleware.ts's (verified by byte-for-byte curl match), which omits everything next.config.ts adds: frame-src calendly, connect-src/form-action api.web3forms.com, object-src 'none', upgrade-insecure-requests, calendly script/style hosts. CRITICAL PRE-STEP: the two CSPs are NOT supersets — middleware uniquely allows the Vercel hosts (vercel.live, *.vercel-scripts.com, *.vercel-insights.com, *.vercel-analytics.com) that next.config.ts lacks. BEFORE deleting, merge any genuinely-needed Vercel hosts into next.config.ts's script-src/connect-src, THEN delete only the 'Content-Security-Policy' key from middleware.ts securityHeaders (lines 25-36). End state: one merged CSP in next.config.ts with both Calendly/web3forms AND needed Vercel hosts. Leave the other duplicated headers (X-Frame-Options, HSTS, etc.) as-is — identical and harmless.

Files: `middleware.ts`, `next.config.ts`

**[9] SEC4-login-ratelimit** — risk: low, effort: 20 min

Add rate limiting to the unprotected admin login route (live test confirmed 10 bad-password POSTs all returned 401, never 429). Apply the same in-memory pattern the contact route already uses (no new dependency) to app/api/admin/auth/login/route.ts: add loginRateLimitStore Map + getClientIP + checkLoginRateLimit (15-min window, 5 attempts) per SEC4 proposed_fix, and at the start of POST return 429 with Retry-After when blocked. Hardening: only increment on FAILED attempts and reset the IP entry on successful auth so legit logins don't burn quota. Caveat: in-memory is per-instance and resets on restart (same class of limitation as CQ4) — acceptable for the current single-replica deploy; swap to Upstash/Redis only if multi-instance (owner decision).

Files: `app/api/admin/auth/login/route.ts`

**[10] SEC6-calendly-get-leak** — risk: low, effort: 5 min

PARTIALLY-TRUE (low severity, NOT credential disclosure): the unauthenticated GET at app/api/webhooks/calendly/route.ts lines 593-605 returns config STATE only (signingKey/web3forms wrapped in `!!` booleans), not the key values — the audit overstated impact. Recommend Option A: strip the `configured` object so it stays a bare liveness probe ({success, message}). Option B (delete the GET handler entirely, Next.js then returns 405) is fine if no external health check depends on GET. Do not gate behind admin auth.

Files: `app/api/webhooks/calendly/route.ts`

**[11] CQ5-webhook-200** — risk: medium, effort: 45 min

Make Stripe webhook retry on transient failures. TWO coordinated edits (route alone is insufficient — verifier found handlers swallow their own errors so the route catch is effectively dead). STEP 1: in lib/stripe/webhook-handlers.ts, change the DB-mutating handlers' swallowing catch blocks to re-throw (`throw error;`) for handleCheckoutCompleted (81-84), handlePaymentSucceeded (116-118), handlePaymentFailed (156-158), handleSubscriptionUpdate (219-221), handleSubscriptionCancelled (240-242), handleInvoicePaymentSucceeded (298-300), handleInvoicePaymentFailed (328-330); keep intentional no-op early `return;` branches (no email / no client) as-is. STEP 2: in app/api/stripe/webhooks/route.ts replace the catch (103-114) so Prisma P2002 (already-processed) returns 200 idempotent, but any other/transient error returns HTTP 500 so Stripe retries; update the misleading 'always return 200' comment (50-51). FOLLOW-UP (flag, not in scope): handlers like handleInvoicePaymentSucceeded prisma.payment.create are not idempotent and could create duplicate rows on retry — add a processed-events table keyed by event.id later.

Files: `lib/stripe/webhook-handlers.ts`, `app/api/stripe/webhooks/route.ts`

### Batch 3: type-safety (unblocks build-flag removal)

**[12] CQ3-prisma-any** — risk: low, effort: 15 min

Replace the four `any`-typed Prisma clauses with generated types (lowest-risk type fix, do first in this batch). Add `import { Prisma } from '@prisma/client'` and replace + delete the eslint-disable above each: app/api/admin/clients/route.ts:50 -> Prisma.ClientWhereInput; app/api/admin/subscriptions/route.ts:40 -> Prisma.SubscriptionWhereInput; app/api/admin/payments/route.ts:54 -> Prisma.PaymentWhereInput (watch the nested .paid_at {gte,lte} mutation pattern at 78-86 — if tsc complains build the date filter once and assign); app/api/admin/projects/[id]/route.ts:129 -> Prisma.ProjectUpdateInput. Re-run `npx tsc --noEmit` to confirm.

Files: `app/api/admin/clients/route.ts`, `app/api/admin/subscriptions/route.ts`, `app/api/admin/payments/route.ts`, `app/api/admin/projects/[id]/route.ts`

**[13] CQ2-stripe-types** — risk: low, effort: 30 min

Fix the 8 Stripe SDK 18.5.0 type errors in lib/stripe/webhook-handlers.ts (verifier found 8, not the 4 the audit reported). Per SDK 18.x type shapes: (1) period fields moved from Subscription to SubscriptionItem — capture `const item = subscription.items.data[0]` and use item.current_period_start/end at L195/196/207/208; (2) invoice.subscription (L252,L310) -> invoice.parent?.subscription_details?.subscription (string|Subscription, normalize to id); (3) invoice.charge/payment_intent (L277,L282) moved onto invoice.payments.data[].payment — read invPayment?.charge / Boolean(invPayment?.payment_intent), with the caveat that payments is only populated when expanded (expand:['payments']), else may need a separate retrieve. Also drop the `let _stripe: any` -> `Stripe | null` in lib/stripe/config.ts:5 (cosmetic). Confirm with `npx tsc --noEmit 2>&1 | grep webhook-handlers` = empty.

Files: `lib/stripe/webhook-handlers.ts`, `lib/stripe/config.ts`

**[14] CQ1-build-flags** — risk: high, effort: 3-4 hours

Resolve remaining errors then remove the build-suppression flags — THIS MUST BE LAST. (a) Fix the remaining TS errors not covered by CQ2/CQ3: app/api/stripe/checkout/route.ts:45 (TS2769 PaymentMetadata->MetadataParam), lib/stripe/config.ts:19 (TS2352 Proxy cast), lib/admin/activity-logger.ts:40 (TS2322 -> type metadata as Prisma.InputJsonValue), app/api/admin/subscriptions/create/route.ts (Stripe fields). (b) Fix the canonical lint errors (almost all in 03-TESTS/ and jest.setup.ts: no-explicit-any/no-require-imports/no-unused-vars; the unused getSessionCookieName import in middleware.ts; add next-env.d.ts to eslint ignores since triple-slash is auto-generated). (c) Add `{ ignores: ['.worktrees/**', '.next/**'] }` to eslint.config.mjs so lint stops double-counting the worktree (inflates 29->59 problems). (d) ONLY after `npx tsc --noEmit` exits 0 AND `npx eslint .` reports 0 errors, delete next.config.ts lines 7-17 (typescript.ignoreBuildErrors + eslint.ignoreDuringBuilds + TODO comments). Then run `npm run build` to confirm the production Docker build path still passes. DEPENDENCY: flipping these flags before the errors are gone WILL break `next build`.

Files: `next.config.ts`, `eslint.config.mjs`, `app/api/stripe/checkout/route.ts`, `lib/stripe/config.ts`, `lib/admin/activity-logger.ts`, `app/api/admin/subscriptions/create/route.ts`, `middleware.ts`


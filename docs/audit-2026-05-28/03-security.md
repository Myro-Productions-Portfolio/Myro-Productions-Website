# Security Audit — 2026-05-28

**Auditor lens:** External developer auditor, handoff to new team.
**Scope:** Next.js 15.1 App Router portfolio site with Stripe payments and admin dashboard.
**Site status:** Not currently live — slated for re-hosting. Audit targets pre-launch hardening.

---

## Verdict

The overall posture is **acceptable but not yet production-ready**. The auth layer (JWT + bcrypt + httpOnly cookies) is correctly assembled, all admin API routes have individual auth guards, the contact form has genuine CSRF and rate limiting, and the Stripe webhook handler correctly uses `constructEvent` with the raw body. None of the foundations need to be torn out. The single biggest issue is a split-brain CSP: `middleware.ts` emits one Content Security Policy and `next.config.ts` emits a different, more complete one, and the middleware version wins at runtime (per Next.js header precedence), meaning the production CSP is missing `frame-src`, `upgrade-insecure-requests`, and Calendly allowances. Beyond that, the seed file hardcodes a default admin password in version control, the login route has no rate limiting, the `STRIPE_WEBHOOK_SECRET` is still empty (documented in STATUS.md), and one `npm audit` finds 1 critical + 10 high vulnerabilities. These are all fixable without structural changes.

---

## Critical Findings

**1. CSP conflict — middleware wins with an incomplete policy**

- `middleware.ts` lines 26–36 and `next.config.ts` lines 43–56 both set `Content-Security-Policy`.
- In Next.js, middleware headers are set on the response object and take precedence over `headers()` config (which only applies before routing). The middleware CSP is what browsers actually receive.
- **Middleware CSP (what actually runs):**
  ```
  default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://vercel.live https://*.vercel-insights.com https://*.vercel-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  ```
- **What it is missing vs. the config CSP:**
  - No `frame-src https://calendly.com` — Calendly embed will be blocked silently
  - No `connect-src https://api.web3forms.com` — contact form submission will fail
  - No `object-src 'none'` — minor gap
  - No `upgrade-insecure-requests`
  - Missing Vercel analytics domains differ between the two
- **Fix:** Delete the CSP from `middleware.ts` lines 26–36 and consolidate everything in `next.config.ts`. Middleware should only do auth + non-CSP security headers.

---

**2. Default admin password committed to git**

- `prisma/seed.ts` line 11: `const adminPassword = 'ChangeMe123!';` — plain text, committed in git.
- Confirmed present in `git log -p` output from commit `b38b853` (2026-02-10).
- If the seed is ever run against a production database without immediately changing the password, this is a known-credential attack waiting to happen. The password is also only 10 bcrypt rounds at seed time (`prisma/seed.ts` line 14: `bcrypt.hash(adminPassword, 10)`) versus the 12 rounds used at normal registration (`lib/auth/password.ts` line 15: `const SALT_ROUNDS = 12`).
- The admin email `pmnicolasm@gmail.com` is also hardcoded at `prisma/seed.ts` line 10.
- **Fix:** Remove the hardcoded password from the seed file. Use an environment variable (`process.env.ADMIN_SEED_PASSWORD`) with a build-time guard that throws if unset. Rotate the rounds to match the 12 used everywhere else.

---

**3. STRIPE_WEBHOOK_SECRET is unset — webhook endpoint is broken in production**

- `app/api/stripe/webhooks/route.ts` lines 25–31 explicitly check for `STRIPE_WEBHOOK_SECRET` and return a 500 if missing.
- STATUS.md (2026-02-10) confirms: *"Stripe webhook secret - empty."*
- Without this, every Stripe webhook hits the 500 path — subscription events, payment confirmations, and invoice updates are all silently dropped.
- **Fix:** Create the webhook endpoint in the Stripe Dashboard pointed at `https://myroproductions.com/api/stripe/webhooks`, copy the `whsec_` signing secret to the production `.env`, and verify with `stripe listen --forward-to`.

---

**4. Login endpoint has no rate limiting**

- `app/api/admin/auth/login/route.ts` — no rate limiting whatsoever. The `checkRateLimit` stub in `middleware.ts` (lines 45–51) is commented out and always returns `true`.
- The login route is excluded from middleware auth (`isAuthAPI` check at line 65 of `middleware.ts`), so even a future middleware rate limit would need to carve out an exception, making this easy to miss.
- The contact form at `app/api/contact/route.ts` has in-process rate limiting (5 req/min/IP). The login route has nothing.
- **Fix:** Apply the same in-process rate limit pattern used in `app/api/contact/route.ts` to the login route, or implement edge-rate-limiting via Upstash Redis as already noted in the middleware comment.

---

## Important Findings

**5. Stripe error messages forwarded raw to the client**

- `app/api/admin/payments/[id]/refund/route.ts` lines 196–200: raw `(error as Error).message` from a `StripeInvalidRequestError` is sent directly in the JSON response.
- Same pattern in `app/api/admin/subscriptions/[id]/cancel/route.ts` and `app/api/admin/subscriptions/create/route.ts`.
- Stripe error messages can include customer names, IDs, and internal API parameter names. This leaks to whoever holds an authenticated admin session — acceptable risk, but worth noting for an auditor because it can assist an insider threat or a stolen session.
- **Fix:** Map `StripeInvalidRequestError` to a fixed message like `"Stripe rejected this request"` and log the raw message server-side only.

---

**6. JWT uses HS256 with a shared secret — no minimum entropy check**

- `lib/auth/session.ts` line 77: `.setProtectedHeader({ alg: 'HS256' })`.
- `getJwtSecret()` at lines 46–55 throws if `JWT_SECRET` is unset, which is correct. It does not enforce a minimum length or entropy check. A developer who sets `JWT_SECRET=dev` in a `.env` would get valid tokens.
- Token expiry is 24 hours (line 40: `SESSION_DURATION = 24 * 60 * 60`), no refresh mechanism exists. A stolen token is valid for up to 24 hours with no revocation path.
- **Fix:** Add a minimum length check (`secret.length < 32` → throw). Document minimum recommended entropy in the `.env.example`. Consider short-lived tokens (1 hour) with a sliding refresh if sessions are expected to persist.

---

**7. 1 critical + 10 high vulnerabilities in npm audit**

- `npm audit` output as of 2026-05-28:
  - **CRITICAL:** `handlebars` — JavaScript injection via AST type confusion (`@partial-block` tamper)
  - **HIGH (10):** `@mapbox/node-pre-gyp` (tar path traversal), `@prisma/config` (effect context contamination), `defu` (prototype pollution), `effect` (AsyncLocalStorage corruption), `flatted` (ReDoS), `minimatch` (ReDoS), `next` (DoS via Image Optimizer `remotePatterns`), `picomatch` (method injection), `prisma` (config chain), `tar` (hardlink path traversal)
- The `next` HIGH is notable — it affects self-hosted Image Optimizer configurations, which this project uses (standalone Docker output, `next.config.ts` images block).
- **Fix:** Run `npm audit fix` and review the diff. The `handlebars` critical is likely a transitive dep — identify which package pulls it in and update or replace it. Address the `next` HIGH by upgrading to the patched Next.js version.

---

**8. Admin UI pages lack server-side auth — rely solely on middleware**

- `app/admin/layout.tsx` and individual admin page components appear to rely on the middleware redirect for protection. If Next.js edge runtime changes, a middleware bug, or a deployment misconfiguration bypass occurs, admin pages would render without a server-side auth check.
- All admin API routes do have `requireAuthFromCookies()` per-route (confirmed in finding), so the data plane is safe. The UI plane is not independently verified.
- **Fix:** Add `verifySessionFromCookies()` calls inside admin Server Component page handlers (the `page.tsx` files), returning a redirect if null, as a defense-in-depth layer.

---

**9. Calendly webhook GET handler leaks configuration status**

- `app/api/webhooks/calendly/route.ts` lines 593–604: the GET handler returns `{ configured: { signingKey: boolean, web3forms: boolean } }` — a public unauthenticated endpoint that tells an attacker exactly which integrations are active or missing.
- **Fix:** Remove the GET handler entirely, or put it behind admin auth. Liveness checks belong in a private `/api/admin/health` endpoint.

---

**10. In-process rate limiting does not survive serverless restarts**

- `app/api/contact/route.ts` lines 76–84 uses a `Map` stored in module scope for rate limiting.
- In serverless or containerized deployments (Vercel, Docker with multiple replicas), this state is per-process and per-cold-start. A flood of requests across function instances bypasses the limit entirely.
- **Fix:** Replace with a Redis-backed counter (Upstash is already mentioned in `middleware.ts` comments). For single-container Docker deployment this is less critical but still a known limitation to document.

---

## Nice-to-Have Hardening

- Add `X-Robots-Tag: noindex` to all `/admin/*` responses to keep admin routes out of search indexes.
- Set `cookie.path` on the session cookie to `/admin` instead of `/` — it has no reason to be sent with every request to the public site.
- Add a `Permissions-Policy` expansion to block `payment` and `usb` APIs: `payment=(), usb=()`.
- Add `subresource integrity` (SRI) hashes to any externally loaded scripts (Calendly embed script).
- Create a `.env.example` file listing every required env var with descriptions and minimum requirements — currently there is none in the root (only referenced in docs/ADRs).
- Consider adding a `lib/env.ts` module using `zod` to validate all required env vars at startup, rather than scattered `process.env.X || ''` fallbacks that silently pass with empty strings.
- Add `audit:ci` script to `package.json` that runs `npm audit --audit-level=high` and fails CI.
- The `typescript.ignoreBuildErrors: true` in `next.config.ts` line 10 masks type errors. Remove it as soon as the Stripe SDK type mismatches are fixed — running with type errors suppressed in production builds removes a safety net.

---

## Refactor-vs-Rebuild Lean from This Lens

**Refactor.** Every security finding here is surface-level and surgical:

- The CSP conflict is a deletion + consolidation, not an architectural rethink.
- The default password is a seed file change.
- The missing webhook secret is an ops task.
- The rate-limiting gap is a copy-paste from the contact route plus a Redis dependency.
- The JWT entropy check is four lines.
- The npm vulnerabilities are package updates.

Nothing in this audit suggests structural rot. The auth pattern is sound (middleware + per-route guards + httpOnly cookies + bcrypt 12 rounds), Prisma is used safely (no raw unsafe queries found), CORS is correctly origin-whitelisted, and error responses consistently hide internal detail in the public surface. The issues are the kind that emerge from a solo developer building fast — not from a flawed architecture. A new team picking this up should fix the critical four before deploying and can treat the rest as a hardening sprint.

# AWS Migration Options — myroproductions.com

**Status:** Research / decision document. Nothing built, no AWS resources created.
**Date:** 2026-09-14
**Target account:** `973793972036` (Nick's, currently dormant/empty)
**Author:** researcher agent (read-only investigation)

---

## 0. Why this document exists

The site was down for ~7 weeks because the Docker containers stopped on the Mac Mini and
nobody found out. Two separate problems are bundled together here, and it is worth naming
them apart up front:

1. **The host is fragile.** A laptop-class machine under a desk, with containers that do not
   come back on their own after certain failure modes.
2. **Nothing was watching.** This is the bigger of the two. A migration that lands perfectly
   on AWS and *still* fails silently has not fixed the actual problem.

Problem 2 is cheaper to fix than problem 1 and delivers more value. See §7, which the owner
promoted to a first-class requirement of this migration.

---

## 1. Ground truth — what this app actually is

Read directly from the repo on 2026-09-14. This section is fact, not research.

### Versions (installed, from `node_modules`, not the caret ranges in package.json)

| Package | Declared | **Installed** |
|---|---|---|
| next | `^15.1.0` | **15.5.18** |
| react / react-dom | `^19.0.0` | **19.2.3** |
| prisma | `^6.2.0` | **6.19.3** |
| @prisma/client | `^6.2.0` | **6.19.2** |
| stripe | `^18.3.0` | **18.5.0** |
| jose | `^6.1.3` | **6.1.3** |
| tailwindcss | `^4.0.0` | 4.x |

Node base image: `node:20-alpine`. Postgres: **16.12** (`postgres:16-alpine`).

### Build and runtime shape

- `next.config.ts` sets **`output: 'standalone'`** — already container-optimized. Good for
  ECS/Fargate; this is the mode OpenNext replaces rather than consumes.
- **`typescript.ignoreBuildErrors: true`** and **`eslint.ignoreDuringBuilds: true`** are both on,
  with TODO comments about Stripe SDK type mismatches. **This is a trap.** The build currently
  succeeds by ignoring type errors. Any platform change that alters the build (Amplify's managed
  build, OpenNext's transform) will not surface these, but they are latent.
- `next.config.ts` defines security headers via `async headers()`, including a CSP that still
  references `va.vercel-scripts.com` and Calendly.
- Image optimization is configured (`avif`/`webp`, custom deviceSizes, 1-year cache TTL) —
  meaning `next/image` **is** in use and the hosting target must provide an image optimizer.

### Backend surface

19 API route handlers under `app/api/`:

```
admin/auth/{login,logout,verify}      admin/clients[/id]
admin/dashboard/stats                 admin/payments[/id][/id/refund]
admin/projects[/id]                   admin/subscriptions[/id][/id/cancel][/create]
contact                               stripe/checkout   stripe/webhooks
webhooks/calendly
```

**No route declares `export const runtime`.** All 19 default to the **Node.js runtime** — none
are Edge. This matters: it means nothing in the app is written against the Edge runtime's
restricted API surface, so any Node-based host works, and there is no Edge-runtime constraint
to preserve.

### Auth — JWT, custom, `jose`

`lib/auth/session.ts`: HS256 JWT signed with `JWT_SECRET`, 24h expiry, stored in an
`admin_session` httpOnly cookie (`sameSite: 'strict'`). No NextAuth, no Cognito, no external IdP.
Password hashing is `bcrypt` (a **native module** — see §6 migration notes).

**`middleware.ts` calls `verifySession()` → `jose.jwtVerify()` on every non-static request.**
This is the single most hosting-constraining fact in the repo. It runs in Next's middleware slot.
`jose` is pure-JS/WebCrypto so it works in both Node and Edge runtimes, but the middleware's
*placement* is what restricts options (§4).

### Stripe — wired, not stubbed, but not live

Stripe is **really implemented**, not a placeholder: `lib/stripe/config.ts` lazily constructs a
real `Stripe` client; `app/api/stripe/checkout/route.ts` creates genuine Checkout Sessions;
`lib/stripe/webhook-handlers.ts` plus `app/api/stripe/webhooks/route.ts` handle events; refund
and subscription-cancel routes call the API.

**However** — `docker-compose.local.yml` passes `STRIPE_SECRET_KEY: "${STRIPE_SECRET_KEY:-}"`,
i.e. it defaults to **empty**, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is built in as `""`.
The `getStripe()` function throws if the key is missing. So: **the code path is complete but is
almost certainly not active in the running deployment.** Treat Stripe as "implemented, dormant."
Verify with the owner before assuming payments must keep working through the cutover.

The webhook endpoint is a real constraint regardless: `/api/stripe/webhooks` must be publicly
reachable and must receive the **raw** request body for signature verification.

### Database — this is the easy part

```
6 models: Client, Subscription, Project, Payment, AdminUser, ActivityLog
```

Measured live in the running container on 2026-09-14:

```
pg_database_size('myro_dev') = 7943 kB   (essentially all catalog overhead)
clients 0 | subscriptions 0 | projects 0 | payments 0 | admin_users 0 | activity_log 0
extensions: plpgsql only  (the default; nothing to port)
```

**The database is completely empty. Zero rows in all six tables.** There is no data migration
problem — there is no data. The "migration" is `prisma db push` against a new empty database
plus re-running the seed.

Postgres-specific features in the schema: `@db.Text`, `Json?` columns, `cuid()` ids, enums,
`@@index`. All bog-standard; all portable to any Postgres 16. Nothing exotic.

**`prisma/migrations/` does not exist.** The schema has been managed with `prisma db push`, not
`prisma migrate`. See §6 — this should be fixed as part of the migration.

### Config / secrets (names only, per instruction — no values read)

```
DATABASE_URL  JWT_SECRET  ADMIN_SEED_EMAIL  ADMIN_SEED_PASSWORD  ADMIN_SEED_NAME
STRIPE_SECRET_KEY  STRIPE_WEBHOOK_SECRET  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL  NODE_ENV  WEB3FORMS_ACCESS_KEY  CALENDLY_WEBHOOK_SIGNING_KEY
```

Twelve variables, of which two are `NEXT_PUBLIC_*` (baked into the client bundle at build time —
they are **build args**, not runtime secrets, and the Dockerfile already treats them that way).
Genuine runtime secrets: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `WEB3FORMS_ACCESS_KEY`, `CALENDLY_WEBHOOK_SIGNING_KEY`,
plus the three `ADMIN_SEED_*` (seed-time only).

### Assets

`public/` is 5.5 MB, `04-ASSETS/` another 5.7 MB. Small. No CDN-scale media problem.

---

## 2. Options at a glance

Costs are **us-east-1, monthly, at portfolio traffic** (assumptions in §3.0). All figures are
fetched-and-cited (§9) or computed from fetched rates; anything unverified is labeled.

| Option | Est. $/mo | Effort | Cold start | Reliability | Verdict |
|---|---|---|---|---|---|
| **1. Amplify Hosting** | ~$0–5 | Low | ~7 s (unofficial) | Good | **Disqualified — cannot reach a private RDS** |
| **2. SST v3 / OpenNext on Lambda** | ~$3–12 | **High** | 1–3 s + 15 s DB wake | Good | Viable, but most moving parts and reintroduces Prisma/Lambda pooling |
| **3. ECS Fargate + Postgres** | **~$11–24** | **Low** | **None (always warm)** | **Best** | **Recommended** |
| **4. App Runner + RDS** | n/a | n/a | n/a | n/a | **Disqualified — closed to new customers** |
| **5. ECS Express Mode** (honorable mention) | ~$28–40 | Lowest | None | Best | Same as #3 but forces an ALB; see §4.5 |

**Two of the four requested options are dead on arrival.** That is not a hedge — both are
confirmed from AWS's own documentation, and the reasons are specific to this app:

- **App Runner is closed to new customers.** A dormant account with no App Runner resources
  counts as a new customer. It cannot be used at all.
- **Amplify Hosting cannot connect to a database in a VPC.** For an app whose entire admin
  surface is Prisma-over-Postgres, that is fatal unless you expose Postgres to the public
  internet, which violates the stated security constraints.

---

## 3. Cost model assumptions

**§3.0 — traffic assumptions, stated explicitly:**

- **< 10,000 requests/month** total (the brief's figure). That is ~330/day, ~14/hour.
- Of those, the overwhelming majority are anonymous visitors hitting static/SSR marketing pages.
- **Admin routes (the only DB-touching paths) get a handful of hits per day at most** — this is
  one person's portfolio backoffice with zero clients in the database.
- Data transfer out: well under 10 GB/month (5.5 MB of assets, cached hard at 1 year).
- No background jobs, no cron, no queue workers.

**Free tier:** the target account was created long ago. AWS's legacy 12-month free tier starts
at **account creation**, not first use, so it has **already expired**. The new (July 2025)
credit-based free tier applies only to accounts created after 2025-07-15, so this account gets
neither. **Assume zero free tier and budget accordingly.** (Worth 10 minutes to check the
Billing console's Free Tier page before finalizing — the downside is only that it is cheaper
than modeled.)

**One genuine freebie that does apply regardless of account age:** CloudFront's new flat-rate
**Free plan — $0/month, 100 GB transfer + 1M requests, includes Route 53 DNS, always-on DDoS
protection and TLS** (no WAF at this tier). Announced 2025-11-18. At < 10k req/month this app
fits inside it with three orders of magnitude to spare. This is a real and significant saving —
it covers CDN *and* DNS for free.

---

## 4. Per-option detail

### 4.1 AWS Amplify Hosting — **disqualified**

**Next.js 15 + middleware: supported.** AWS's docs explicitly list Next.js 12–15 support and
name **Middleware** as a supported feature. Unsupported: Edge middleware, Edge API routes,
On-Demand ISR, streaming, `unstable_after`. **None of those are used by this app** — all 19
routes are Node runtime and the middleware is standard. On the Next.js axis alone, Amplify
would fit fine.

**The disqualifier: no VPC access.** Amplify Hosting's SSR compute has no VPC configuration.
The feature request (`aws-amplify/amplify-hosting#3362`, "VPC Access for SSR Compute Runtime")
has been **open since March 2023 and remains open as of 2026-09-14** with no AWS commitment.
Amplify added IAM roles for SSR apps in Feb 2025, which helps reach IAM-authenticated AWS
services — but RDS/Aurora over a private subnet is not one of them.

The only ways around it are all bad:
- Make RDS publicly accessible → violates the encryption/least-privilege constraints and puts
  Postgres on the open internet. **No.**
- Put an API Gateway + VPC-attached Lambda in front of the DB and have Amplify call it over
  HTTP → you have now built a second backend to avoid using the first one. Absurd for this app.
- Use Aurora DSQL / Data API → a datastore change, explicitly out of scope.

**Cost** (if it were viable): build $0.01/min with 1,000 min/mo free; hosting storage $0.023/GB-mo
(5 GB free); transfer $0.15/GB (15 GB free); SSR requests $0.30/1M (500k/mo free); SSR duration
$0.20/GB-hour (100 GB-hr/mo free). At this traffic it would land in the free allowances —
roughly **$0–5/month**. Genuinely the cheapest option, and it does not matter, because it
cannot talk to the database.

**Verdict: do not pursue.** Cheap and simple is worthless if the admin dashboard 500s on every
request.

---

### 4.2 SST v3 / OpenNext on Lambda + CloudFront — viable, but the most work

**Next.js 15 support:** OpenNext states it "aims to support all Next.js 15 features and is widely
deployed in production." However, its published compatibility matrix tops out around **15.3.2**,
and this app runs **15.5.18**. That gap is probably fine — but it is unverified for this exact
patch, and **a throwaway build is mandatory before committing to this path.**

**Middleware — good news.** By default OpenNext runs `middleware.ts` **inside the main server
Lambda on the full Node runtime**, not Lambda@Edge. External/Edge middleware is opt-in via
`middleware.external: true`. Since this middleware uses `jose` (Node-compatible) and does a
`jwtVerify`, **the default behavior should work unmodified.** Do not enable the external flag.

**SST project health — the honest read.** SST v3 (ion) is **not abandoned**: releases continued
through v4.17.1 (2026-07-12) on a roughly biweekly cadence, and there is no deprecation notice.
But multiple independent 2026 sources consistently report the team's primary focus has shifted to
OpenCode (their AI coding agent), with SST effectively in maintenance mode for non-critical work.
OpenNext AWS itself is "maintained by the SST community" and its docs openly ask for help keeping
it "up to date and feature complete." **Translation: it works today, but you are betting a
client-facing portfolio site on a community-maintained compatibility shim that is chasing a
fast-moving upstream framework.** For a site whose whole purpose is to look competent, an
OpenNext version-skew breakage during a Next.js upgrade is exactly the wrong kind of surprise.

**The Prisma-on-Lambda problem (this is the real cost of this option).** See §5 for the full
treatment. Summary: Lambda's execution model fights Prisma's connection handling, and every
mitigation has a catch:
- **RDS Proxy** — Prisma uses prepared statements for every query, which causes RDS Proxy to
  **pin** connections, eliminating the pooling benefit. Also ~$22/mo minimum. Also (critically)
  **attaching RDS Proxy to an Aurora cluster prevents it from ever auto-pausing**, killing the
  scale-to-zero saving.
- **Aurora Data API** — no first-party Prisma adapter; community tooling only.
- **Prisma Accelerate** — a real product (free tier 60k ops/mo; Starter $10/mo) but architected
  around Prisma's own managed Postgres; using it purely as a pooler in front of your own RDS is
  not the documented happy path.
- **Bundle size** — Prisma 6.19 still ships the Rust query engine by default. The WASM/no-Rust
  path exists as an opt-in preview (`previewFeatures = ["queryCompiler","driverAdapters"]`,
  available since 6.7.0) and became default only in **Prisma 7** (GA 2025-11-19). You are on 6.19,
  so you would be enabling a *preview feature* on a client-facing site, or doing a major-version
  Prisma upgrade as part of a hosting migration. Neither is appealing.

**Cold start:** Lambda cold start 1–3 s for a Next.js server bundle, **plus** up to 15 s if the
Aurora cluster is paused (30 s+ if paused > 24 h). For a portfolio site where the first
impression is the product, **a visitor can wait ~18 s for the first page load.** That is
materially worse than the current homelab site when it is up.

**Cost:** genuinely low — Lambda at < 10k req/mo sits inside the always-free 1M requests /
400k GB-s allowance, so ~$0 compute; CloudFront free plan $0; Aurora scale-to-zero ~$3–11.
**Realistically $3–12/month.** Cheapest *working* option.

**Migration effort: high.** Abandon `output: 'standalone'`, adopt OpenNext's build, learn
SST/CDK-for-OpenNext, solve Prisma bundling and pooling, re-verify middleware, re-verify the
Stripe webhook raw-body handling through API Gateway/Function URL, and re-test image
optimization. This is the "rewrite the deployment" option.

**Verdict: viable, and the right answer if the monthly bill must be minimal. Not the right
answer here**, because it trades operational simplicity and first-impression latency — the two
things this site actually needs — for ~$10/month.

---

### 4.3 ECS Fargate + Postgres — **recommended**

**Compatibility: total.** This is the same container the app already runs. `output: 'standalone'`
is exactly what Fargate wants. Middleware, all 19 Node-runtime routes, `next/image`, `bcrypt`
native module, Stripe raw-body webhooks, `jose` — all behave identically to today because it *is*
today's runtime. **There is no Next.js compatibility question to answer**, which is itself the
argument for this option.

**Prisma: no pooling problem at all.** A long-lived container holds a normal connection pool
exactly as it does now. The entire §5 minefield simply does not apply. `lib/prisma.ts` works
unchanged.

**Cold start: none.** The task runs 24/7. First-byte latency is whatever the app does, with no
Lambda init and no database wake. For a site whose job is to impress prospective clients, this
is the single strongest argument for this option.

**Verified costs** (rates fetched 2026-09-14; arithmetic mine):

| Line item | Rate | $/mo |
|---|---|---|
| Fargate **ARM64** 0.25 vCPU / 0.5 GB | $0.03238/vCPU-hr, $0.00356/GB-hr | **$7.21** |
| (same on x86 for comparison) | $0.04048/vCPU-hr, $0.004446/GB-hr | $9.01 |
| Public IPv4 (1 task ENI) | $0.005/hr | **$3.65** |
| CloudFront + Route 53 DNS | flat-rate **Free** plan | **$0.00** |
| Secrets via SSM Parameter Store Standard | free | **$0.00** |
| **Compute subtotal (ARM, no ALB, no NAT)** | | **~$10.86** |

Database, two ways:

| DB choice | $/mo | Note |
|---|---|---|
| **RDS `db.t4g.micro`** Single-AZ + 20 GB gp3 | **~$13.98** | $0.016/hr verified from AWS pricing API. Always on, no cold start. gp3 at ~$0.115/GB-mo is **unverified**. |
| Aurora Serverless v2, min 0 ACU (scale-to-zero) | ~$2.70–5.40 | Cheaper, but adds a 15 s wake on first query after idle |

**Recommended DB: `db.t4g.micro`.** At this scale Aurora's saving is ~$8–11/month and it buys a
15-second first-hit penalty on the admin dashboard and on any SSR page that touches the DB. For
a site that exists to demonstrate competence, paying $11/mo for "always instant" is the right
trade. (Aurora scale-to-zero remains the correct choice if the spend ceiling is tight — see §8.)

**Total: ~$25/month** (Fargate ARM + public IP + t4g.micro + free CDN/DNS/secrets).
**~$14/month** if you take Aurora scale-to-zero instead and accept the wake latency.

**Avoiding the two big fixed costs — deliberately:**
- **No NAT Gateway.** $0.045/hr = **$32.85/mo** before data charges — it would be the largest
  line on the bill. Put the task in a **public subnet with `assignPublicIp: ENABLED`** and lock
  inbound with a security group. Outbound (ECR pulls, Stripe API, Web3Forms) goes via the
  internet gateway. Cost: the $3.65 public IPv4 charge instead of $32.85.
- **No ALB.** $0.0225/hr = **$16.43/mo** floor plus LCUs. For a single task this more than
  doubles the compute bill. Front the task with **CloudFront** (free plan) pointing at the
  task, or keep the existing **Cloudflare Tunnel** pattern with a `cloudflared` sidecar — which
  is already the proven pattern on this homelab for two other sites and needs no inbound
  exposure at all.

**Operational burden — honest accounting:**
- **What you patch:** the base image. `node:20-alpine` needs periodic rebuilds for CVEs. Node 20
  goes EOL and will need a bump to 22/24. This is real, recurring work that Lambda/Amplify would
  partly absorb for you.
- **What AWS handles:** ECS restarts a failed/unhealthy task automatically. RDS patching happens
  in a maintenance window. This is the core reliability win — **the "containers stopped and
  nobody noticed" failure mode is structurally eliminated**, because ECS's desired-count
  reconciliation restarts the task without a human.
- **What wakes you up:** almost nothing at this scale, *provided §7 monitoring exists*. Realistic
  pages: RDS maintenance-window restart (brief), an ECR image that fails health checks after a
  bad deploy, certificate/DNS misconfiguration.

**Migration effort: low.** Detailed in §6, but the headline is: **the Dockerfile does not need to
change.** Add `linux-musl-arm64-openssl-3.0.x` to Prisma's `binaryTargets` for ARM, wire env vars
to SSM, write the CDK/Terraform, cut DNS.

**Reliability vs. homelab:** ECS restarts dead tasks; the Mac Mini does not. RDS survives host
failure and takes automated backups; the local `myro_pgdata` volume has neither. No dependency on
a residential ISP, a laptop staying awake, or Docker Desktop auto-starting at login. This is the
option that most directly fixes problem 1 from §0.

---

### 4.4 AWS App Runner + RDS — **disqualified, cannot be used**

From AWS's own documentation, fetched 2026-09-14:

> "After careful consideration, we decided to close AWS App Runner to new customers. Existing
> AWS App Runner customers can continue to use the service as normal... AWS continues to invest
> in security and availability for AWS App Runner, but we do not plan to introduce new features."

The target account is dormant and empty, so it has **no existing App Runner usage** and is a new
customer by definition. **This option is not available**, independent of its merits.

For the record, had it been available it was a poor fit anyway: App Runner has **no true
scale-to-zero** (a provisioned container instance bills at $0.007/GB-hr even idle), and reaching
RDS requires a VPC connector. AWS's own recommended replacement is **ECS Express Mode** — i.e.
AWS is pointing App Runner refugees at option 4.5 / option 3.

---

### 4.5 Honorable mention — ECS Express Mode

Launched at re:Invent 2025 (2025-11-21). One API call (`aws ecs create-express-gateway-service`)
provisions an ECS-on-Fargate service, an ALB with target groups and health checks, autoscaling,
security groups and networking. **No additional charge — you pay only for the underlying
resources.** AWS explicitly positions it as the App Runner replacement.

**Why it is a mention and not the recommendation:** it always provisions an **ALB**, which is a
**$16.43/month floor** this site does not need at 14 requests/hour. Its headline saving (up to 25
services sharing one ALB) is irrelevant when you have one service. It also provisions resources
somewhat outside your IaC's direct control, which sits awkwardly with the IaC-only constraint.

**When to pick it instead:** if more services get added to this account later (the `_pipeline/`
demo-generation motion could plausibly produce several), the shared-ALB economics flip and
Express Mode becomes clearly correct. Worth revisiting at service #3.

---

## 5. Prisma + Lambda connection pooling — 2026 state of play

Relevant only if option 2 is chosen. Included because the brief asked, and because it is the
main hidden cost of the serverless path.

**The problem:** every concurrent Lambda execution environment holds its own PrismaClient and
its own connection(s). Postgres connection limits are small (a `db.t4g.micro` allows roughly
~100). Bursts exhaust them; idle environments hold connections open.

**The 2026 options, and why each has a catch:**

| Approach | Status | Catch |
|---|---|---|
| **RDS Proxy** | Supported, ~$0.015/vCPU-hr (**unverified rate**) → ~$22/mo min | **Prisma's prepared statements cause connection pinning**, largely defeating the pooling. Also **blocks Aurora auto-pause entirely.** |
| **PgBouncer (transaction mode)** | Still the documented path | `pgbouncer=true` only for PgBouncer < 1.21.0; 1.21+ wants `max_prepared_statements>0`. You would have to run/manage it. |
| **Prisma Accelerate** | Active, not renamed. Free 60k ops/mo; Starter $10/mo | Architected around Prisma's managed Postgres; using it as a bare pooler in front of your own RDS is not the documented happy path. Adds a third-party dependency in the request path. |
| **Aurora Data API** | No first-party Prisma adapter | Community tooling only (`data-api-client`). AWS's Feb 2026 Prisma CLI announcement is for **Aurora DSQL**, a different product — do not conflate them. |

**Bundle size, separately:** Prisma 6.19 ships the Rust query engine by default. The WASM query
compiler (`previewFeatures = ["queryCompiler","driverAdapters"]`, since 6.7.0) removes it and is
reported to cut bundle size ~90%; it became the default in **Prisma 7** (GA 2025-11-19). On 6.19
you are choosing between a preview feature and a major-version upgrade. Binary target for ARM64
Lambda would be `linux-arm64-openssl-3.0.x`, x86 `rhel-openssl-3.0.x` (**corroborated but not
confirmed against Prisma's canonical reference page**).

**The point of this section:** all of this complexity evaporates on Fargate, where a long-lived
process holds a normal pool. That is a genuine architectural argument for option 3, not just a
preference.

---

## 6. Data migration, and what has to change in the code

### 6.1 Postgres data migration — trivial

**There is no data.** Zero rows, six tables, one default extension (`plpgsql`), 7.9 MB of catalog.

The actual path:
1. `prisma db push` (or better, see below) against the new RDS instance to create the schema.
2. `npm run db:seed` to create the admin user from `ADMIN_SEED_*`.
3. Done.

`pg_dump`/`pg_restore` is available as a belt-and-braces option but is not needed. Nothing in the
schema complicates it: no extensions beyond default, no stored procedures, no custom types beyond
Prisma-generated enums, no `CITEXT`/`PostGIS`/`uuid-ossp`. Source is Postgres 16.12 → target RDS
Postgres 16.x, same major version.

**The one real schema concern:** `prisma/migrations/` **does not exist** — the schema has been
managed with `prisma db push`. Going to a persistent managed database, **adopt
`prisma migrate`** and generate an initial migration (`prisma migrate dev --name init`) as part
of this work. Otherwise there is no reproducible, reviewable schema history against a database you
can no longer casually wipe. Small task, do it before cutover, not after.

### 6.2 Code changes required — option 3 (recommended)

Genuinely small:

1. **`prisma/schema.prisma`** — add ARM binary target if running Fargate ARM64:
   `binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x"]` (Alpine base → musl variant).
   **Verify the exact string against Prisma's docs during implementation**; the musl/glibc and
   arch permutations are easy to get wrong and fail only at runtime.
2. **Dockerfile** — no structural change. Possibly pin/bump the Node base image. Build for
   `linux/arm64` if using Graviton.
3. **Env/secrets** — replace `env_file: .env.local` with ECS task-definition `secrets` sourced
   from **SSM Parameter Store** (SecureString, KMS-encrypted). The `NEXT_PUBLIC_*` pair stay
   **build args**, not runtime secrets.
4. **`lib/prisma.ts`** — unchanged.
5. **`middleware.ts`** — unchanged.
6. **`next.config.ts`** — clean up the CSP: it still allows `va.vercel-scripts.com` and
   `vitals.vercel-insights.com`, and the app still depends on `@vercel/analytics` and
   `@vercel/speed-insights`. **Those packages will silently do nothing outside Vercel.** Either
   remove them and tighten the CSP, or accept dead weight in the bundle. Not a blocker; is a
   "looks sloppy if a client inspects it" issue on a site whose purpose is demonstrating
   competence.
7. **Health check endpoint** — none exists. **Add `app/api/health/route.ts`** that verifies DB
   connectivity (`SELECT 1` via Prisma). Required for both the ECS container health check and the
   §7 monitoring. This is the single most important new code in the whole migration.
8. **Fix the ignored type errors** — `ignoreBuildErrors: true` should not survive to a
   client-facing production deploy. Out of scope for the migration itself; log as a follow-up.

### 6.3 Code changes required — option 2 (OpenNext), for contrast

Everything in 6.2 except the Dockerfile, **plus**: drop `output: 'standalone'`, adopt the
OpenNext build pipeline, resolve Prisma bundling (preview WASM engine or Prisma 7 upgrade),
resolve connection pooling (§5), re-verify middleware placement, re-verify Stripe webhook raw-body
handling through the Lambda/Function URL path, re-verify `next/image` optimization, and validate
Next.js 15.5.18 against a compatibility matrix that documents 15.3.2.

---

## 7. Monitoring and alerting — **the actual deliverable**

This section is first-class per the owner. The 7-week silent outage is the reason this project
exists; a migration that does not fix it has failed.

### 7.1 The alerting path, end to end

Named services and wiring, for the recommended architecture:

```
  [Route 53 Health Check]  ──every 30s──>  https://myroproductions.com/api/health
            │                                   (checks HTTP 200 + body string match)
            │ health check status
            ▼
  [CloudWatch Alarm]  "HealthCheckStatus < 1 for 2 consecutive periods"
            │
            │ ALARM state transition
            ▼
  [SNS Topic]  "myro-site-alerts"   (KMS-encrypted)
            │
            ├──> Email subscription      → nic's inbox        (free)
            └──> SMS subscription        → nic's phone        (~$0.0075/msg US)
```

**Why SNS email *and* SMS:** the original failure was not "the alert was wrong," it was "no alert
existed." An email that lands in a tab nobody opens for 7 weeks repeats the failure mode. **At
least one channel must be intrusive.** SMS at a few cents a year for a site that should never
alert is the right cost. (A Telegram/Slack webhook via SNS→Lambda is an equally good intrusive
channel and this homelab already runs a `claude_bot` Telegram integration — arguably the better
fit, and free.)

**Critically — a dead-man's-switch check:** every alarm above fires when something *changes to
bad*. If the whole account/alarm is deleted or SNS is misconfigured, nothing fires and you are
back to silent failure. Set the alarm's **"treat missing data as ALARM"** and add one external
check (§7.3) so that AWS itself failing is still detected.

### 7.2 Cost comparison — and the plain answer

| Approach | Frequency | Cost/mo | Verdict |
|---|---|---|---|
| **CloudWatch Synthetics canary** | 5 min (8,640 runs) | **~$10.25** + Lambda/S3/Logs overhead → **~$11–13** | **More than the compute bill. Overkill.** |
| CloudWatch Synthetics canary | 15 min (2,880 runs) | ~$3.34 + overhead | Still pricey for up/down |
| **Route 53 Health Check** (non-AWS endpoint, basic) | 30 s | **$0.75** | |
| **Route 53 Health Check** (AWS endpoint) | 30 s | **$0.00** — first **50 free** | **Recommended** |
| CloudWatch alarm on ALB/CloudFront metrics | 1 min | $0.10/alarm (10 free) | Good supplement, not sufficient alone |
| External (UptimeRobot free / BetterStack free) | 5 min | **$0.00** | **Recommended as the independent second opinion** |

**Stated plainly, as asked: yes — a 5-minute CloudWatch Synthetics canary at ~$11/month would
cost roughly as much as the entire Fargate compute bill (~$10.86), and more than the database.
For this site it is not worth it.** Synthetics earns its price when you need scripted multi-step
browser journeys (log in, click through a funnel, assert on rendered DOM). Checking "is the site
up and is the DB reachable" does not need a headless Chrome.

**Recommendation: Route 53 health check (free, up to 50, for AWS endpoints) + CloudWatch alarm +
SNS, backed by a free external service as an independent check.** Total marginal cost:
**$0.00–0.75/month.** Note that Route 53's *optional* features (HTTPS, string matching, fast
interval) cost **+$1.00/mo each** for AWS endpoints — string matching is worth paying for (§7.3);
budget ~$1–2/mo if you enable a couple.

### 7.3 What to actually alert on — the important part

The owner's instinct is right: **a 200 from the edge is not proof the app works.** The 7-week
outage was crude enough that any check would have caught it. The *next* outage probably will not
be. Concretely, these failures all return HTTP 200 from a naive check:

- Postgres is down → the marketing page still renders (it is largely static); only `/admin` 500s.
- Prisma connection pool exhausted → intermittent 500s, most checks pass.
- SSR error boundary → a shell page renders with no content, status 200.
- Stripe keys missing/rotated → checkout throws only when someone actually pays.
- Certificate expiring → works until the day it does not.

**So assert on more than the status code:**

1. **Build `/api/health` to actually test the stack, not just echo.** It should
   `SELECT 1` through Prisma (proving DB connectivity *and* pool health) and return a
   distinctive JSON body, e.g. `{"status":"ok","db":"ok","version":"<git-sha>"}`.
   Return **503**, not 200, when the DB check fails — so even a status-code-only monitor catches
   a DB outage.
2. **String matching on the response body.** Route 53's string-match feature (+$1/mo) asserts the
   response contains `"status":"ok"`. This is what turns "the server answered" into "the app
   works." **Worth the dollar.**
3. **Also check a real page, not only the health endpoint.** A second check against `/` with a
   string match on a known piece of rendered copy catches the SSR-renders-empty-shell failure
   that `/api/health` would miss.
4. **Latency threshold.** Alarm if p90 response time exceeds ~2–3 s sustained. Catches the
   degraded-but-alive state (DB slow, memory pressure) before it becomes an outage.
5. **Error-rate alarm.** CloudWatch alarm on 5xx count > N over 5 minutes, from CloudFront
   metrics or the app's own logs. Catches "some routes broken" which no single-URL check finds.
6. **Certificate expiry.** ACM auto-renews, but alarm on `DaysToExpiry < 21` anyway — renewal can
   fail when DNS validation records get disturbed, which is a live risk here given the
   Cloudflare/ACM interaction (§8.2).

### 7.4 Alarm on the database and app tier too

Public-URL checking is necessary and not sufficient. For the recommended architecture:

**Database (RDS):**
- `DatabaseConnections` approaching the instance max → connection leak
- `FreeStorageSpace` < 15% → the classic silent killer
- `CPUUtilization` sustained > 80%
- `FreeableMemory` critically low
- **RDS Events** → subscribe the SNS topic to RDS event categories (failure, failover,
  maintenance, low storage). Free, and catches things metrics do not.
- If Aurora scale-to-zero is chosen instead: alarm on `ServerlessDatabaseCapacity` pinned at max
  (runaway scaling = runaway cost).

**App tier (ECS):**
- **`RunningTaskCount` < desired count** — *this is the direct analogue of the original failure.*
  If ECS cannot keep a task running, this fires. Alarm on it explicitly.
- Service CPU/memory utilization sustained high
- Task stopped/restart events via EventBridge → SNS (catches crash-looping, which
  `RunningTaskCount` may miss if restarts are fast)
- Deployment failure / rollback events

**Budget (not uptime, but same category of silent surprise):** an **AWS Budgets** alert at, say,
$40/month. Free for the first two budgets. A misconfiguration that spins up a NAT Gateway or
scales Aurora should reach a human before the invoice does.

### 7.5 Does monitoring differ per hosting option?

Yes, materially — and it modestly reinforces the recommendation rather than changing it.

| Option | Out-of-the-box observability |
|---|---|
| **Fargate (rec.)** | **Best.** Native CloudWatch Container Insights, per-task metrics, ECS service events, `RunningTaskCount` as a direct "is it running" signal, logs via `awslogs` driver. The failure mode that caused this project maps to a **single first-class CloudWatch metric.** |
| SST/OpenNext Lambda | Good but diffuse. Lambda metrics (errors, throttles, duration, concurrency) are excellent per-function, but the app is split across several Lambdas + CloudFront, so "is the site healthy" must be assembled from pieces. Cold starts make latency alarms noisier and harder to threshold. |
| Amplify | **Weakest.** Limited access to underlying compute metrics; you largely monitor from outside. (Moot — disqualified.) |
| App Runner | Had decent built-in metrics. (Moot — disqualified.) |

**Does this shift the pick? It reinforces it.** Fargate gives the most direct instrumentation of
precisely the failure that started this, with the least assembly. It does not override the other
arguments; it agrees with them.

### 7.6 Ship monitoring in the same phase, or before?

**Recommendation: monitoring ships in the SAME phase as the migration, and the migration is not
"done" until an alert has been proven to fire.**

Reasoning:
- Most of the monitoring (Route 53 health check, CloudWatch alarms, SNS) is **cheap and fast** —
  it is a modest amount of additional IaC in the same stack, not a separate project. Sequencing
  it later means doing the work twice and risking it being deprioritized once the site is "up."
- **The health endpoint is a code change** (§6.2 item 7) that must exist before cutover anyway,
  because the ECS container health check and the ALB/CloudFront origin check want it too.
- **Definition of done must include a proven alert.** Deliberately break it in a controlled way —
  scale the ECS service to 0 tasks, confirm the alert reaches the phone, scale back. An untested
  alerting path is indistinguishable from no alerting path. That is the exact lesson of the last
  7 weeks.

The one thing that can precede everything: the **free external monitor (§7.3)**, which needs no
AWS work at all — see §8.5.

---

## 8. Recommendation

### **ECS Fargate (ARM64) + RDS `db.t4g.micro`, fronted by CloudFront, secrets in SSM Parameter
Store, monitored by Route 53 health check → CloudWatch alarm → SNS (email + phone).**

**Estimated cost: ~$25/month.** (~$14/month if Aurora scale-to-zero is chosen over RDS, accepting
a 15 s cold start on DB-touching requests.)

**Why:**

1. **It is the only option with no compatibility unknowns.** The app already runs in this exact
   container with `output: 'standalone'`. Middleware, 19 Node-runtime routes, `bcrypt`, `jose`,
   Stripe raw-body webhooks, `next/image` — all keep working because nothing about the runtime
   changes. Two of the four requested options are disqualified outright; of the two that remain,
   this is the one that does not require validating a community compatibility shim against a
   Next.js patch version its own docs do not list.

2. **It eliminates the Prisma-on-Lambda minefield entirely** (§5). Every pooling mitigation has a
   real catch; a long-lived container has none. `lib/prisma.ts` ships unchanged.

3. **No cold start.** This is a client-facing portfolio site. A prospective client clicking the
   link should not wait 1–3 s for a Lambda plus up to 15 s for a database to wake. "Always warm"
   is worth ~$10/month here — that is the entire product this site sells.

4. **It fixes the actual failure mode structurally.** ECS reconciles desired task count and
   restarts dead tasks without a human. Combined with §7, "stopped and nobody noticed" becomes
   both impossible-by-default and alarmed if it somehow happens.

5. **Lowest migration effort of the viable options** (§6.2) — realistically the Dockerfile is
   untouched.

**Runner-up: SST v3 / OpenNext on Lambda + CloudFront (~$3–12/month).**

**Switch to it if:** the monthly spend ceiling turns out to be below roughly $15 — that is the
only condition under which its downsides are worth accepting. At that point, Lambda's always-free
tier plus Aurora scale-to-zero plus the free CloudFront plan genuinely can approach a few dollars
a month, and the cost of that saving is cold starts, the Prisma bundling/pooling work, and a
dependency on a community-maintained compatibility layer. **If the ceiling is $25 or more, do not
take this trade.**

**Explicitly not recommended:** Amplify Hosting (cannot reach a private database — architecturally
disqualified for this app) and App Runner (closed to new customers — unavailable).

### Note on the unmonitored gap — flagged for the owner's decision

The owner has accepted that the site stays unmonitored on the homelab until this migration ships.
**I want to flag that as a concern rather than plan around it.**

A realistic estimate for this migration — write the IaC, containerize for ARM, adopt
`prisma migrate`, add the health endpoint, wire SSM, cut DNS, verify — is **days of focused work,
not hours**, and calendar time is usually longer than effort time. That means the site plausibly
stays unwatched for another 1–3 weeks. Given that it just spent 7 weeks down undetected, **another
multi-week blind window on the same fragile host is an avoidable risk.**

**Minimum stopgap, if the owner wants one (≈ 5 minutes, $0, no AWS involvement):** point a free
external monitor — UptimeRobot's free tier (50 monitors, 5-minute interval) or BetterStack's free
tier (10 monitors) — at `https://myroproductions.com` with an email + push alert. It needs no code
change, no AWS account, no infrastructure, and it is thrown away at cutover (or kept as the §7.3
independent second opinion, which is its better use). **This is not part of the migration plan and
does not change it — it is a 5-minute insurance policy on the intervening weeks.** Owner's call.

---

## 9. DNS, TLS, and secrets

### 9.1 Secrets: SSM Parameter Store Standard, not Secrets Manager

| | Secrets Manager | **SSM Parameter Store Standard** |
|---|---|---|
| Per secret/month | $0.40 | **free** |
| API calls | $0.05 / 10k | free at standard throughput |
| **6 runtime secrets** | **$2.40/mo** | **$0.00/mo** |

Secrets Manager's differentiator is **automatic rotation**. None of these twelve variables
rotate automatically — `JWT_SECRET` is static, Stripe keys are rotated manually, `DATABASE_URL`
changes only if you re-provision. **Paying $2.40/month for a feature not in use is waste at this
scale.** Use SSM Parameter Store **SecureString** parameters (KMS-encrypted at rest, satisfying
the encryption constraint), referenced from the ECS task definition's `secrets` block so values
are injected as env vars and never appear in the task definition or the image.

If RDS-managed master-password rotation is later adopted, that specific credential can live in
Secrets Manager (where RDS puts it natively) while everything else stays in SSM. Mixed is fine.

### 9.2 DNS and TLS — keep Cloudflare DNS, do NOT proxy to CloudFront

The domain is on Cloudflare today. Three options:

**Option A — Cloudflare DNS, unproxied (grey cloud) → CloudFront/AWS. Recommended if moving to
CloudFront.**
Keep the registrar and DNS at Cloudflare; set the record for `myroproductions.com` to
**DNS-only (grey cloud)** pointing at the CloudFront distribution. TLS is terminated by AWS with
an **ACM certificate** (free, auto-renewing).

**The sharp edge, confirmed:** do **not** enable Cloudflare's orange-cloud proxy in front of
CloudFront. Cloudflare's own documentation states that a CNAME "usually associated with another
CDN provider" cannot be proxied, and that "a proxied version of that record will cause
connectivity errors" — Cloudflare deliberately blocks it to prevent the misconfiguration.
Double-proxying invites TLS-termination conflicts, routing loops, and origin rejections, and adds
a pointless extra hop of latency.

**Also:** ACM's DNS-validation CNAME records **must themselves be grey-cloud / DNS-only**, or
validation fails — and, worse, silently breaks *renewal* months later. This is the single most
common way this setup dies quietly. Cover it with the certificate-expiry alarm in §7.3 item 6.

**Option B — keep the Cloudflare Tunnel, terminate at Cloudflare.**
Run a `cloudflared` sidecar in the Fargate task, exactly as `allstarbowindy.com` and this site do
today. Cloudflare stays orange-cloud and proxies to the tunnel; **no CloudFront, no ALB, no public
IP, no inbound exposure at all** (saves the $3.65 public IPv4 charge too). This is the
lowest-change option and reuses a pattern already proven on this homelab. Its cost: you forfeit
the free CloudFront plan's bundled DNS/DDoS, and you add a second container to the task whose
failure is a new (monitorable) failure mode.

**Option C — move DNS to Route 53** ($0.50/hosted zone/month + $0.40/million queries).
Buys tighter ACM/CloudFront integration, alias records, and health-check-driven DNS failover.
**Not worth the migration churn for a single site**, and it forfeits Cloudflare's free DDoS
protection at the DNS layer. Only compelling if you later want Route 53 weighted/failover routing.

**Recommendation: Option A** if going the CloudFront route (free CDN + free DNS via the flat-rate
plan is hard to argue with), **Option B** if minimizing change and reusing the existing proven
tunnel pattern matters more. Both are defensible; **Option A is the better demonstration of
competence on a portfolio site**, which is a legitimate tiebreaker here. Do not do Option A and
orange-cloud it.

---

## 10. Open questions for the owner

1. **Spend ceiling?** The recommendation is ~$25/month. The runner-up is ~$3–12/month with cold
   starts and materially more work. **If the ceiling is under ~$15, the recommendation changes**
   to OpenNext/Lambda + Aurora scale-to-zero. This is the single most decision-relevant unknown.

2. **Acceptable cold start?** The $11/month difference between RDS `db.t4g.micro` (always warm)
   and Aurora scale-to-zero is purchased with a **~15 second** wait on the first DB-touching
   request after idle (**30 s+** if idle > 24 h). For a portfolio site, my read is that this is a
   bad trade — but it is a judgment call about money vs. first impressions, and it is the owner's.

3. **Is Stripe supposed to be live?** The code is fully implemented but the running deployment
   appears to have empty Stripe keys. If payments are dormant, the migration is simpler and
   `/api/stripe/webhooks` needs no special routing attention. **If Stripe is meant to go live,
   say so now** — it changes webhook routing, secret handling, and testing scope.

4. **Alert channel preference?** Email alone repeats the original failure (unread inbox). Options:
   SNS SMS (~cents/year), or a Telegram push via the `claude_bot` integration already running on
   this homelab (free, and arguably the better fit). **Pick one intrusive channel.**

5. **Is the ~1–3 week unmonitored gap acceptable?** See §8. A 5-minute free external monitor
   closes it at zero cost and zero commitment. Yes/no.

6. **Cloudflare Tunnel or CloudFront?** (§9.2 Option A vs B.) Both work. A is the better
   showcase; B is less change and reuses a proven pattern.

7. **ARM64 or x86?** ARM saves ~$1.80/month and requires getting the Prisma binary target right.
   Minor, but it is a choice that has to be made at build time.

---

## 11. Risks and traps specific to this codebase

Flagged per instruction — things that will bite during implementation:

1. **`ignoreBuildErrors: true` + `ignoreDuringBuilds: true`.** The build passes by ignoring
   TypeScript errors in the Stripe integration. Any platform change hides rather than surfaces
   these. **Biggest latent trap in the repo.** Not a migration blocker; is a "this will explode
   later" item.
2. **No `prisma/migrations/`.** Schema managed by `db push`. Adopt `prisma migrate` before
   pointing at a database you cannot casually wipe (§6.1).
3. **Prisma binary target on Alpine + ARM.** `linux-musl-arm64-openssl-3.0.x` — musl (Alpine) not
   glibc. Gets silently wrong and fails at runtime, not build time. Verify against Prisma docs.
4. **Vercel packages in a non-Vercel deployment.** `@vercel/analytics` and
   `@vercel/speed-insights` are dependencies and are whitelisted in the CSP. They will do nothing
   on AWS. Dead weight and a slightly embarrassing detail on a portfolio site.
5. **`bcrypt` is a native module.** Fine in Docker (already working). **Would be a real problem
   in a Lambda bundle** — another hidden cost of option 2. (`bcryptjs` is the usual swap.)
6. **Stripe webhooks need the raw body.** Works today. Must be re-verified on any platform that
   transforms the request (API Gateway, Lambda adapters). Non-issue on Fargate.
7. **ACM DNS-validation records must be grey-cloud in Cloudflare** — and stay that way, or
   renewal fails silently months later (§9.2).
8. **RDS Proxy + Aurora scale-to-zero are mutually exclusive.** AWS's own docs: an attached RDS
   Proxy holds a persistent connection, so the instance **never auto-pauses**. If someone tries to
   combine "serverless DB to save money" with "RDS Proxy for pooling," they get the cost of both
   and the benefit of neither.
9. **NAT Gateway ($32.85/mo) would be the single largest line item** if someone reflexively
   follows a standard private-subnet VPC template. Deliberately avoid it (§4.3).
10. **The account's free tier is almost certainly expired** — do not build a budget that assumes
    750 free RDS hours.

---

## 12. Sources

All fetched **2026-09-14** unless noted. Figures marked *unverified* could not be confirmed from a
primary source this session and should be re-checked before committing to a budget.

**Repository (read directly, 2026-09-14)** — `package.json`, `node_modules/*/package.json`,
`next.config.ts`, `prisma/schema.prisma`, `middleware.ts`, `lib/auth/session.ts`,
`lib/stripe/config.ts`, `lib/prisma.ts`, `Dockerfile`, `docker-compose.local.yml`,
`.env.example` (variable names only), `app/api/**`; live `psql` queries against the running
`myro-website-db` container for DB size, row counts, version, and extensions.

**AWS — hosting platforms**
- Amplify Next.js support & unsupported features — https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html
- Amplify VPC access issue (open since 2023-03) — https://github.com/aws-amplify/amplify-hosting/issues/3362
- Amplify pricing — https://aws.amazon.com/amplify/pricing/
- **App Runner closed to new customers** — https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html
- App Runner pricing — https://aws.amazon.com/apprunner/pricing/
- ECS Express Mode (launched 2025-11-21) — https://infoq.com/news/2025/12/aws-ecs-express-mode/ and the App Runner migration guide above

**AWS — compute & network pricing**
- Fargate pricing (x86 $0.000011244/vCPU-s, $0.000001235/GB-s; ARM $0.0000089944/vCPU-s, $0.0000009889/GB-s) — https://aws.amazon.com/fargate/pricing/
- ALB pricing ($0.0225/hr + $0.008/LCU-hr) — https://aws.amazon.com/elasticloadbalancing/pricing/
- VPC pricing — public IPv4 $0.005/hr, NAT GW $0.045/hr + $0.045/GB — https://aws.amazon.com/vpc/pricing/
- Lambda pricing ($0.20/M requests, $0.0000166667/GB-s; 1M req + 400k GB-s always free) — https://aws.amazon.com/lambda/pricing/

**AWS — database**
- RDS PostgreSQL On-Demand rates, us-east-1, retrieved from the AWS pricing data API
  (`b0.p.awsstatic.com/pricing/2.0/meteredUnitMaps/rds/USD/current/rds-postgresql-ondemand.json`):
  **db.t4g.micro Single-AZ $0.016/hr**, **db.t4g.small Single-AZ $0.032/hr**
- RDS pricing page — https://aws.amazon.com/rds/postgresql/pricing/ (interactive table did not render; instance rates taken from the pricing API above)
- **Aurora Serverless v2 auto-pause / scale-to-zero** (min 0 ACU; timeout 300 s–86,400 s; ~15 s resume, 30 s+ after >24 h; **RDS Proxy prevents auto-pause**; storage still billed while paused) — https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-auto-pause.html
- Aurora scale-to-zero announcement (2024-11-20) — https://aws.amazon.com/blogs/database/introducing-scaling-to-0-capacity-with-amazon-aurora-serverless-v2/
- Aurora pricing — https://aws.amazon.com/rds/aurora/pricing/ — *$0.12/ACU-hour standard is **unverified** (third-party corroborated, AWS table did not render)*

**AWS — CDN, DNS, secrets, monitoring**
- CloudFront flat-rate plans announcement (2025-11-18) — https://aws.amazon.com/about-aws/whats-new/2025/11/aws-flat-rate-pricing-plans
- CloudFront pricing — Free plan: 100 GB + 1M requests, includes Route 53 DNS, DDoS protection, edge compute, 5 GB S3 credits; **no WAF at Free tier**; no overage charges — https://aws.amazon.com/cloudfront/pricing/
- Route 53 pricing — $0.50/hosted zone/mo; $0.40/M queries; health checks $0.50 (AWS endpoint) / $0.75 (non-AWS), optional features +$1.00/+$2.00 each; **first 50 AWS-endpoint health checks free** — https://aws.amazon.com/route53/pricing/
- Secrets Manager pricing ($0.40/secret/mo, $0.05/10k API calls) — https://aws.amazon.com/secrets-manager/pricing/
- SSM Parameter Store pricing (**Standard free**; Advanced $0.05/param/mo) — https://aws.amazon.com/systems-manager/pricing/
- CloudWatch pricing (alarms $0.10/mo, 10 free; **100 canary runs/mo free**; logs $0.50/GB) — https://aws.amazon.com/cloudwatch/pricing/
- Synthetics canary run rate **$0.0012/run** — *corroborated across multiple 2026 secondary sources; the AWS pricing table did not render the per-run figure. The free-tier line (100 runs/mo) **is** confirmed from the AWS page above.*

**AWS — free tier**
- https://aws.amazon.com/free/ and https://aws.amazon.com/free/free-tier-terms — post-2025-07-15 credit model ($100–$200, 6-month plan window, credits expire at 12 months)
- https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-free-tier.html — legacy 12-month tier, clock starts at **account creation**

**Next.js / OpenNext / Prisma**
- OpenNext AWS — Next.js 15 support claim, middleware runs in the server function by default, community-maintained — https://opennext.js.org/aws
- SST — https://sst.dev (releases through v4.17.1, 2026-07-12; no deprecation notice). *Team-focus-shift-to-OpenCode reporting is **unverified** — consistent across secondary 2026 sources, no official SST statement found.*
- Prisma serverless/Lambda deployment & connection pooling — https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-aws-lambda
- *Prisma ARM64/musl binary target strings and the RDS Proxy $0.015/vCPU-hr rate are **unverified** — corroborated but not confirmed against primary sources this session.*

**Cloudflare**
- Proxy limitations — a CNAME "usually associated with another CDN provider" cannot be proxied; "a proxied version of that record will cause connectivity errors" — https://developers.cloudflare.com/dns/proxy-status/limitations/
- ACM validation records must be DNS-only (grey cloud) — Cloudflare community + https://advancedweb.hu/how-to-use-a-custom-domain-on-cloudfront-with-cloudflare-managed-dns/

**Uptime monitoring (external)**
- UptimeRobot free tier (50 monitors, 5-min interval) / BetterStack free tier (10 monitors) — https://uptimerobot.com/knowledge-hub/monitoring/11-best-uptime-monitoring-tools-compared/ and https://betterstack.com/community/comparisons/website-uptime-monitoring-tools/

### Explicitly unverified — re-check before committing to a budget

1. RDS **gp3 storage $/GB-month** and backup storage rate (~$0.115/GB-mo assumed; not confirmed).
2. **Aurora $0.12/ACU-hour** (third-party corroborated only).
3. **RDS Proxy $0.015/vCPU-hour** (third-party corroborated only).
4. **Synthetics $0.0012/canary run** (secondary sources; free-tier line is confirmed).
5. Whether this dormant account retains **any** free tier — check the Billing console directly.
6. **OpenNext support for Next.js 15.5.18 specifically** (matrix documents 15.3.2) — requires a
   throwaway build to confirm if option 2 is pursued.
7. **Prisma ARM64/musl binary target string** — verify against Prisma docs at implementation time.
8. SST team-focus reporting — consistent across secondary sources, no official statement.

# Hosting Decision — myroproductions.com

**Audit date:** 2026-05-28  
**Prepared for:** fresh hosting decision after Mac Mini recommission  
**Budget ceiling:** $100/month (compute + DB + monitoring + room for growth)  
**Goal:** cheapest viable path that also builds AWS experience

All pricing in USD, us-east-1 unless noted. Sources cited inline with retrieval date.

---

## Context: Why Two Options Became Three

The user framed this as "Cloudflare vs AWS." That framing misses the most common production pattern: Cloudflare at the edge (DNS, WAF, CDN, zero egress fees) with AWS behind it for compute and data. That hybrid is Option C and it is explicitly evaluated below. The "Cloudflare-only" path is also non-trivial for this app — it is not a static site or a simple Node API, it runs bcrypt, Prisma, and a Stripe webhook handler. Every constraint is called out.

---

## Option A: Cloudflare-Only

### What "Cloudflare-only" actually means for this app

Cloudflare's compute offering is Workers — V8 isolates, not a Node.js process. The migration path for a Next.js app is `@opennextjs/cloudflare` (the former `next-on-pages` package was deprecated; OpenNext is now the official adapter, endorsed by the Next.js Ecosystem Working Group as of March 2026). Source: [opennext.js.org/cloudflare](https://opennext.js.org/cloudflare), verified 2026-05-28.

The Workers runtime gained substantial Node.js compatibility in 2025 via the `nodejs_compat` flag, including most of `node:crypto`. Source: [Cloudflare changelog, April 2025](https://developers.cloudflare.com/changelog/2025-04-08-nodejs-crypto-and-tls/). But "substantial" is not "complete."

### Code changes required (enumerated)

**1. bcrypt → pure-JS replacement**  
The `bcrypt` npm package uses native C++ bindings (`node-gyp`, OpenSSL) — it will not run in Workers. Confirmed by Cloudflare community: "bcrypt uses node-gyp and links to OpenSSL; Workers don't support native Node modules." Source: [answeroverflow.com/m/1295058626867888130](https://www.answeroverflow.com/m/1295058626867888130).  
Fix: swap to `bcryptjs` (pure JS, works with `nodejs_compat`) or `@noble/hashes` (Argon2id). This is a one-file change but it is a required security-sensitive dependency swap.

**2. Prisma driver adapter is mandatory**  
Standard Prisma over TCP with the `pg` driver requires `node_compat = true` in `wrangler.toml`, which "is not officially supported on Cloudflare Pages." When using `@opennextjs/cloudflare` (Workers, not Pages), you must use an edge-compatible driver: `@prisma/adapter-neon` (HTTP-based), `@prisma/adapter-pg` with TCP, or `@prisma/adapter-d1` for D1. You also cannot use a global Prisma singleton — every request needs a new client instance. Source: [prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-cloudflare](https://www.prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-cloudflare), verified 2026-05-28.

**3. Database: PostgreSQL → Neon (or D1 for a full migration)**  
The app uses PostgreSQL. Two paths:  
- **Hyperdrive + Neon**: Keep Postgres schema, swap to Neon Serverless adapter (`@prisma/adapter-neon`). Hyperdrive is a connection proxy that caches connections globally; it is **included free in the Workers Paid plan** — no extra charge. Source: [Cloudflare Hyperdrive docs](https://developers.cloudflare.com/hyperdrive/), verified 2026-05-28. Neon Launch plan: $0.106/CU-hour compute, $0.35/GB-month storage. For a quiescent personal portfolio, compute will be near-zero between requests (scale-to-zero). Realistic Neon bill: **$0–$5/month**. Source: [neon.com/pricing](https://neon.com/pricing), verified 2026-05-28.  
- **D1 (SQLite)**: Requires migrating the Postgres schema to SQLite dialect, swapping the `@prisma/adapter-d1`. D1 support in Prisma is in Preview as of 2026. This is a schema migration risk on top of everything else. Not recommended unless you specifically want SQLite semantics (no `JSONB`, no `ARRAY` types, etc.).

**4. Worker bundle size**  
Free plan: 3 MiB compressed limit. Paid plan: 10 MiB. A Next.js 15 + Prisma bundle can easily hit 5–8 MiB compressed. Workers Paid plan required. Source: [Prisma edge deployment docs](https://www.prisma.io/docs/orm/prisma-client/deployment/edge/deploy-to-cloudflare).

**5. Node Middleware (Next.js 15.2+)**  
OpenNext Cloudflare does not yet support Node Middleware (introduced in Next.js 15.2). Source: [opennext.js.org/cloudflare](https://opennext.js.org/cloudflare), 2026-05-28. If the codebase uses `middleware.ts` with Node APIs, this is a blocker.

**6. Stripe webhook handler**  
Stripe webhooks hit an API route. Workers can handle this; `stripe-signature` verification uses Web Crypto which is supported. Not a blocker, but must be tested.

**7. Environment variables**  
Cloudflare uses `.dev.vars` locally and `wrangler secret put` for production — not `.env`. CI/CD pipelines need updating.

### Cost breakdown (Cloudflare-only)

| Line item | Monthly |
|---|---|
| Workers Paid plan (base, includes 10M requests/month) | $5.00 |
| Additional requests (low traffic: negligible over 10M) | ~$0 |
| Neon Serverless Postgres (Launch, ~1 CU-hr/month active compute, 0.5 GB storage) | ~$2–$5 |
| Hyperdrive | $0 (included in Workers Paid) |
| KV/R2 for session cache or static assets | ~$0–$2 |
| **Total** | **$7–$12/month** |

Source for Workers Paid pricing: [developers.cloudflare.com/workers/platform/pricing](https://developers.cloudflare.com/workers/platform/pricing/), verified 2026-05-28. No bandwidth/egress charges on Cloudflare Workers. Source: same URL.

### Verdict for this app

Feasible but requires real code surgery: bcrypt swap, Prisma driver adapter refactor, database migration to Neon (or D1), bundle size validation, and middleware audit. The cost is attractively low ($7–$12/month). **However, it provides zero AWS learning value** — which is an explicit user goal. If cost were the only factor and the user wanted to spend 2–4 hours on the migration, this works. Given the stated goal of building AWS experience, this is the wrong path unless the budget is razor-thin.

---

## Option B: AWS-Only

Three sub-options. All assume the domain stays on Cloudflare DNS (already there, no reason to move it to Route 53).

### Sub-option B1: ECS Fargate (existing Docker image, no code changes)

Run the existing multi-stage container as-is. This is the path of least code change and the most AWS surface area to learn.

**Architecture:**  
API Gateway HTTP API → VPC Link → ALB (internal) → ECS Fargate task (0.25 vCPU / 0.5 GB) → RDS PostgreSQL (db.t4g.micro, Single-AZ)

Alternatively, skip the internal ALB and use API Gateway HTTP API + VPC Link directly to a Network Load Balancer, which is cheaper. The public endpoint is just API Gateway; Cloudflare DNS points to it.

**AWS Fargate pricing** (Linux/ARM, us-east-1, per second, 1-min minimum):  
- vCPU: $0.0000089944/vCPU-second = **$0.03238/vCPU-hour**  
- Memory: $0.0000009889/GB-second = **$0.00356/GB-hour**  
Source: [aws.amazon.com/fargate/pricing](https://aws.amazon.com/fargate/pricing/), verified 2026-05-28.

A 0.25 vCPU / 0.5 GB ARM task running 24/7 (730 hours/month):  
- vCPU: 0.25 × $0.03238 × 730 = **$5.91/month**  
- Memory: 0.5 × $0.00356 × 730 = **$1.30/month**  
- Fargate compute subtotal: **~$7.21/month**

**RDS PostgreSQL db.t4g.micro Single-AZ:**  
$0.016/hour × 730 hours = **$11.68/month**. Source: [instances.vantage.sh/aws/rds/db.t4g.micro](https://instances.vantage.sh/aws/rds/db.t4g.micro), verified 2026-05-28. Add 20 GB GP2 storage at $0.115/GB-month = **$2.30/month**. Total RDS: **~$14/month**.

Note: Some aggregator sites cite $0.03/hour ($21.90/month) for db.t4g.micro. The discrepancy is Single-AZ vs. Multi-AZ. Single-AZ at $0.016/hour is the correct rate. Source: [economize.cloud/resources/aws/pricing/rds/db.t4g.micro](https://www.economize.cloud/resources/aws/pricing/rds/db.t4g.micro/), verified 2026-05-28.

**ALB (if used):** $0.0225/hour × 730 = **$16.43/month** base, plus LCU charges (negligible at low traffic ~$0–$2). Source: [aws.amazon.com/elasticloadbalancing/pricing](https://aws.amazon.com/elasticloadbalancing/pricing/), verified 2026-05-28.

**API Gateway HTTP API (cheaper alternative to ALB for public ingress):** $1.00 per million requests. At low traffic (10,000 requests/month): **$0.01/month**. VPC Link: $0.01/hour = **$7.20/month**. This replaces the $16 ALB. Source: [costgoat.com/pricing/amazon-api-gateway](https://costgoat.com/pricing/amazon-api-gateway), verified 2026-05-28.

**CloudWatch Logs:** $0.50/GB ingestion (first 5 GB free). A quiet Next.js app might emit 0.5–1 GB/month: **~$0–$0.50/month**. Source: [aws.amazon.com/cloudwatch/pricing](https://aws.amazon.com/cloudwatch/pricing/), verified 2026-05-28.

**ECR (container image storage):** $0.10/GB-month. A Next.js standalone image is ~300–500 MB: **~$0.03–$0.05/month**. Source: [aws.amazon.com/ecr/pricing](https://aws.amazon.com/ecr/pricing/), verified 2026-05-28.

**ECS Fargate + API Gateway HTTP API + VPC Link cost breakdown:**

| Line item | Monthly |
|---|---|
| Fargate (0.25 vCPU / 0.5 GB ARM, 24/7) | $7.21 |
| RDS db.t4g.micro Single-AZ + 20 GB storage | $14.00 |
| API Gateway HTTP API (10K–50K requests) | $0.05–$0.10 |
| VPC Link (HTTP API to private subnet) | $7.20 |
| CloudWatch Logs | $0–$0.50 |
| ECR storage | $0.05 |
| NAT Gateway (if needed for egress from private subnet) | $0–$15 (avoidable with VPC endpoints) |
| **Total without NAT Gateway** | **~$28–$30/month** |
| **Total with NAT Gateway (worst case)** | **~$43–$45/month** |

NAT Gateway is avoidable: put the Fargate task in a public subnet with a public IP (simpler, slightly less hardened) or use VPC endpoints for ECR/CloudWatch. For a personal portfolio, public subnet is acceptable.

**Code changes:** None. The existing Dockerfile runs as-is. The `output: 'standalone'` mode is exactly what ECS Fargate expects.

**AWS learning value:** High. Touches ECS, Fargate, ECR, VPC, IAM roles, RDS, API Gateway, CloudWatch, Secrets Manager.

### Sub-option B2: AWS Amplify (managed Next.js, least ops)

Amplify Hosting Compute supports Next.js 12–15 with full SSR. No Dockerfile needed. Git-push deploys. Source: [docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html), verified 2026-05-28.

**Critical limitation:** Amplify Hosting Compute does not support VPC access. This means RDS in a private VPC is unreachable. The database must be either publicly accessible (bad practice for production credentials) or accessed via an HTTP proxy (adds complexity that negates the simplicity benefit of Amplify). Source: [github.com/aws-amplify/amplify-hosting/issues/3362](https://github.com/aws-amplify/amplify-hosting/issues/3362), confirmed in community posts as unresolved.

The practical workaround is to use Neon (serverless Postgres over HTTP) instead of RDS. This eliminates the VPC problem but requires the same Prisma driver adapter change as Option A.

Amplify pricing: $0.30/1M requests, $0.20/GB-hour compute, $0.15/GB data transfer, $0.023/GB storage. Free tier: 500K requests/month, 100 GB-hours compute, 15 GB data transfer. Source: [aws.amazon.com/amplify/pricing](https://aws.amazon.com/amplify/pricing/), verified 2026-05-28.

At low traffic (under free tier thresholds), Amplify compute cost is **~$0/month**. Add Neon Launch Postgres: **$2–$5/month**. Realistic total: **$5–$10/month**.

**Unsupported Next.js features in Amplify:** Edge API Routes, on-demand ISR, streaming, `unstable_after`. Not blockers for this app as currently built, but worth noting for future features.

**Code changes:** Prisma driver swap to Neon adapter (same as Option A), plus the bcrypt question needs checking (Amplify runs Lambda under the hood with full Node.js — bcrypt native module likely works here, unlike Workers). No Dockerfile changes needed.

**AWS learning value:** Low-moderate. Amplify abstracts almost everything. You learn Amplify console and CI/CD pipeline, but not VPC, ECS, or RDS directly.

### Sub-option B3: Lambda via OpenNext (serverless, most learning per dollar)

`@opennextjs/aws` deploys Next.js as Lambda functions. Scale to zero. Pay per request.

At low traffic (50,000 requests/month at 200ms avg duration, 512 MB memory): Lambda cost is roughly $0.003/month (negligible). Source: standard Lambda pricing $0.0000002/request + $0.0000166667/GB-second.

Postgres: Use Neon (serverless HTTP-based, no connection pool exhaustion under Lambda). Or RDS with RDS Proxy ($0.015/vCPU-hr), but RDS Proxy adds ~$8/month and is overkill here.

**Cold starts:** 200–500ms added latency after idle. Mitigation: a warmer function (EventBridge rule pinging the Lambda every 5 minutes). Source: [opennext.js.org/aws/v2/inner_workings/warming](https://opennext.js.org/aws/v2/inner_workings/warming), 2026-05-28. For a personal portfolio, intermittent cold starts are acceptable.

**Code changes:** None to the Next.js app code. The OpenNext build wraps the output. The existing Dockerfile is not used (Lambda doesn't run containers in this flow unless you use Container Image Lambda — possible but adds build complexity).

**Cost breakdown (Lambda/OpenNext + Neon):**

| Line item | Monthly |
|---|---|
| Lambda compute (50K requests, 200ms, 512 MB) | ~$0.10 |
| Lambda requests | ~$0.01 |
| API Gateway HTTP API | ~$0.05 |
| Neon Serverless Postgres (Launch) | $2–$5 |
| CloudWatch Logs | $0–$0.50 |
| **Total** | **~$3–$6/month** |

**AWS learning value:** Moderate. Lambda, API Gateway, IAM, CloudWatch. Does not teach ECS/VPC/container workflows.

### Overall Option B recommendation

B1 (ECS Fargate) is the correct AWS learning path for someone who explicitly wants to push workloads to AWS. It uses the existing Docker image without code changes, teaches the container + networking + IAM + database stack, and costs $28–$30/month with the API Gateway HTTP API pattern (no ALB required). B2 (Amplify) is a dead end for VPC-connected databases. B3 (Lambda) is cheap but doesn't build the container/ECS skills the user likely wants.

---

## Option C: Hybrid — Cloudflare Edge + AWS Compute

### Architecture

- Cloudflare: DNS (already there), free CDN/WAF, zero egress charges on static assets served from Cloudflare cache
- AWS: ECS Fargate running the Docker container, RDS PostgreSQL, all backend infrastructure
- Cloudflare Tunnel or CNAME to the API Gateway HTTP API endpoint — DNS stays on Cloudflare, no Route 53 needed

This is the dominant pattern in 2026 for sites that live on AWS but use Cloudflare edge. Source: [cloudflare.com/multi-cloud/aws](https://www.cloudflare.com/multi-cloud/aws/), verified 2026-05-28.

### What Cloudflare adds for free over pure AWS

- Zero egress fees (AWS charges ~$0.09/GB data transfer out; Cloudflare charges $0 regardless of bandwidth)
- DDoS mitigation at the edge (built into all Cloudflare plans including free)
- WAF (Cloudflare Free: basic rules; Pro at $20/month: full ruleset)
- CDN caching for static assets — reduces requests hitting the origin (fewer Fargate CPU cycles)
- The domain is already on Cloudflare; there is no migration cost

At low traffic, egress savings are marginal (a portfolio site might push 1–5 GB/month, saving $0.09–$0.45/month from AWS data transfer costs). But the DDoS and WAF protection at Cloudflare's edge is meaningful for a site with a Stripe integration and public API routes.

### Cost breakdown (Hybrid: Cloudflare Free + ECS Fargate + RDS)

Same AWS compute costs as B1, but Cloudflare absorbs static asset bandwidth:

| Line item | Monthly |
|---|---|
| Cloudflare (DNS + CDN + basic WAF) | $0 (free plan) |
| Fargate (0.25 vCPU / 0.5 GB ARM, 24/7) | $7.21 |
| RDS db.t4g.micro Single-AZ + 20 GB storage | $14.00 |
| API Gateway HTTP API + VPC Link | $7.25 |
| CloudWatch Logs | $0–$0.50 |
| ECR | $0.05 |
| **Total** | **~$28–$30/month** |

Practically identical to B1 at this traffic level because bandwidth savings are small. The value is in security posture and the fact that the domain is already here.

If the user adds Cloudflare Pro ($20/month) for the full WAF ruleset, total rises to **$48–$50/month** — still well under budget.

### Code changes

Same as B1: none. The Docker container runs identically.

### Verdict

This is the natural state of the architecture: domain already on Cloudflare, compute on AWS. There is nothing to "migrate" — just point Cloudflare DNS at the AWS endpoint. This is not an either/or; it is the default hybrid you get when you host on AWS and keep your existing DNS on Cloudflare.

---

## Decision Matrix

| | **A: Cloudflare-only** | **B1: AWS ECS Fargate** | **B2: AWS Amplify** | **B3: AWS Lambda/OpenNext** | **C: Hybrid (CF+ECS)** |
|---|---|---|---|---|---|
| Monthly low estimate | $7 | $28 | $3 | $3 | $28 |
| Monthly realistic | $10 | $30 | $8 | $6 | $30 |
| Monthly ceiling ($100 budget headroom) | $15 | $45 | $20 | $15 | $50 |
| Code changes required | **Major** (bcrypt, Prisma adapter, env vars) | **None** | Minor (Prisma adapter, DB swap) | None (Next.js code) | **None** |
| AWS learning value | None | **Strong** | Low | Moderate | **Strong** |
| Operational complexity | Low-moderate | Moderate | Low | Low | Moderate |
| Vendor lock-in | High (Workers-specific runtime) | Low (Docker is portable) | Moderate (Amplify-specific build) | Moderate (OpenNext) | Low (Docker + CNAME) |
| VPC/private DB support | No (Hyperdrive workaround) | **Yes** | No | Via RDS Proxy only | **Yes** |
| Uses existing Dockerfile | No | **Yes** | No | No | **Yes** |

---

## Recommendation

**Option C (Hybrid: Cloudflare DNS + AWS ECS Fargate) is the correct choice for this app and this user.**

Specifically: B1 architecture (ECS Fargate + API Gateway HTTP API + RDS) with Cloudflare remaining as DNS and CDN — which it already is. This is not a new direction; it is the natural state when you host on AWS and keep your domain on Cloudflare.

**Why not Cloudflare-only (Option A):** It requires rewriting two security-critical pieces of the stack (bcrypt, Prisma connection handling), migrating to Neon, and auditing the entire app for Workers runtime compatibility — all for a cost saving of roughly $18–$20/month over Option C. The user's explicit goal is building AWS experience. Rewriting the app to run on Workers directly contradicts that goal and introduces non-trivial migration risk. Not worth it.

**Why not Amplify (Option B2):** Cannot connect to RDS in a private VPC. This is a documented, unresolved limitation that forces either a publicly accessible database (bad) or a Neon workaround (which then requires the same Prisma driver changes as Option A). Amplify abstracts away the AWS infrastructure you want to learn. Skip it.

**Why not Lambda/OpenNext (Option B3):** Lambda is cheaper than Fargate at low traffic and is a legitimate learning path, but it does not use the existing Docker image and does not teach ECS, VPC networking, or container workflows. If the user's AWS learning goal is specifically serverless functions, this is a valid second choice. If the goal is broader AWS infrastructure literacy (the more valuable skill), ECS Fargate is the better teacher at only $22–$24/month more than Lambda.

**Concrete starting point:**
1. Keep Cloudflare as DNS — no changes needed
2. Create an ECS cluster in us-east-1 with a single Fargate service: 0.25 vCPU / 0.5 GB ARM64
3. Push the existing Docker image to ECR (no Dockerfile changes)
4. Provision RDS db.t4g.micro Single-AZ PostgreSQL in a private subnet
5. Use API Gateway HTTP API + VPC Link for public ingress (saves $9/month vs ALB)
6. Wire up Secrets Manager for DATABASE_URL, JWT secrets, Stripe keys
7. Point Cloudflare CNAME at the API Gateway custom domain

**Expected monthly cost at launch:** $28–$32/month, leaving $68–$72/month of headroom for future features (Redis, additional services, traffic growth).

If budget becomes the primary constraint later and the user is willing to do the code migration work, Option A remains viable as a downgrade path — but it should not be the starting point.

---

*All pricing sourced from vendor documentation or authoritative third-party calculators, verified 2026-05-28.*

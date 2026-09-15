# Handoff — Site down → stripped to static → migrated live to Cloudflare Workers

**Date**: 2026-09-14 20:13
**Project**: myro-productions-website
**Branch**: feat/static-landing-cloudflare-pages (6 commits, none pushed; remote master is behind; working tree clean)
**Session topic**: Diagnosed a 7-week outage, decided the site didn't need its CRM/DB/payments layer, stripped it to static, and cut DNS over to a live Cloudflare Workers deployment.

## State + in-progress work

- **`myroproductions.com` and `www` are LIVE on Cloudflare Workers**, free tier, $0/mo. Verified end to end (see below). This is the real, current production state — not a plan.
- Branch has 6 commits, all local. Not pushed, no PR opened yet.
- Homelab `myro-website` + `myro-website-db` containers are still running but now redundant (Workers serves the traffic). Left up deliberately — nothing was torn down until Workers was confirmed serving.
- Cloudflare tunnel `80721cb3-8faf-42c0-b777-f20f09c2ec22` is still running and still required by other subdomains (`allstarbowlindy`, `dash`, `n8n`, `builtnotborrowed-demo`). Only the apex and `www` DNS records were detached from it. **Do not kill the tunnel.**
- `allstarbowlindy.myroproductions.com` is still returning 502 (its container died in the same 2026-07-24 stop event as this site's). User was told, called it a dead project, said "leave it." **Do not fix or touch.**
- Test suite: 206 passed / 37 failed across 15 suites. The 37 failures are pre-existing content-drift from commit `984ddb8` (two commits before this session's work) and were verified byte-identical before and after every change made this session. Not regressions — don't report them as such.
- `docs/aws-migration-options.md` (902 lines, committed) is shelved, not applied. Only relevant if the admin CRM is ever made real.

## Decisions + reasoning

- **Abandoned the AWS plan (ECS Fargate + RDS, ~$25/mo) in favor of static-only on Cloudflare Workers.** Why: all six Prisma tables (clients, subscriptions, projects, payments, admin_users, activity_log) had zero rows — the CRM/payments layer had never held a single record, and no public page touched the database. The app was a static marketing site wearing a CRM costume. User also confirmed: no payments needed, downtime is tolerable, it's a demo-of-ideas site, not a client-critical system.
- **Target Cloudflare Workers, not Cloudflare Pages, and not `@cloudflare/next-on-pages`.** Why: `@cloudflare/next-on-pages` is archived and never supported past Next 14 (Cloudflare's own docs say to remove it if installed). The maintained path is `@opennextjs/cloudflare` (v1.20.6), which targets Workers. Do not let a future session "fix" this back to next-on-pages or Pages.
- **Created `open-next.config.ts` explicitly**, despite OpenNext docs claiming it's optional/auto-generated. Why: verified false for adapter 1.20.6 — the build hard-fails without it.
- **Deleted `middleware.ts` instead of reconciling it with `next.config.ts` headers.** Why: it duplicated security headers already set in `next.config.ts` `headers()`, emitting every header twice with two conflicting CSPs. The middleware's `connect-src 'self'` would have broken the contact form's call to Web3Forms in production. With admin route gating removed, middleware had no remaining purpose. `next.config.ts` already correctly whitelists `api.web3forms.com` and Calendly.
- **Removed `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`.** Why: they existed only to mask Stripe type errors; Stripe is gone, and the build now passes clean with full type checking and linting.
- **Set `images.unoptimized: true`.** Why: the runtime image optimizer needs Cloudflare Images (setup + billing) — not worth it for five static PNGs.
- **Ran `npm audit fix` but did not do the Next 16 upgrade.** Why: fixed 4 prod vulnerabilities (1 critical) down to 2; the remaining 2 require a breaking major upgrade, deliberately scoped out of this session. Next 15 EOL is 2026-10-21 (~5 weeks out) — this is a real deadline, not just tech debt.
- **Port fix: changed compose mapping from 3002 to 3001, and fixed `NEXT_PUBLIC_SITE_URL`.** Why: the Cloudflare tunnel ingress routes the apex to `localhost:3001`; the compose file published 3002, so nothing ever listened on 3001 — this alone would have kept the site 502 even after the stopped containers were revived. `NEXT_PUBLIC_SITE_URL` had been baked in at build time as `http://localhost:3002`, which was leaking into canonical/OG tags on the public site.
- **Cutover method: delete apex + www CNAMEs pointed at the tunnel, attach both as Workers custom domains** (not a gradual/weighted rollout). Why: user approved after confirming the Workers preview URL looked identical to production; simplicity over staged rollout given the low-stakes nature of the site. Rollback data saved first.
- **Did not tear down the homelab containers or the tunnel ingress config yet.** Why: proof-of-cutover required leaving the old path available to fall back to; teardown is a deliberate next step, not yet started.
- **SSH MCP servers redact high-entropy output (Vault unseal shares came back as `[REDACTED:entropy:88]`).** Decision: use direct `ssh` via Bash tool for anything moving keys/tokens/hashes off remote hosts, not the SSH MCP tools. Documented in `~/.claude/commands/vaultunseal.md` and in project memory — this is a general rule, not Vault-specific, and should not be "fixed" by disabling redaction.

## File paths + line refs

- `docker-compose.local.yml` — port mapping changed from `3002` → `3001` to match tunnel ingress (commit `6133e34`).
- `next.config.ts` — `output: 'standalone'` removed (OpenNext build replaces it); `images.unoptimized: true` added; `headers()` retained as the single source of security headers (including CSP whitelist for `api.web3forms.com` and Calendly); `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` removed.
- `middleware.ts` — deleted (commit `ae9db78`); duplicated/conflicted with `next.config.ts` headers, would have broken the contact form CSP.
- `wrangler.jsonc` — new; `compatibility_date: 2026-09-14`, flags `nodejs_compat` + `global_fetch_strictly_public`, `ASSETS` binding.
- `open-next.config.ts` — new; required by `@opennextjs/cloudflare` 1.20.6 despite docs claiming optional.
- `lib/portfolio-data.ts` — source of truth for the three statically-generated project pages (agorabench, work-os, myro-productions-website); confirm this is what still drives `app/**` project pages post-strip.
- `docs/aws-migration-options.md` — shelved AWS analysis (ECS Fargate + RDS ~$25/mo); only relevant if CRM is made real.
- `docs/dns-rollback-2026-09-14.json` — original apex + www CNAME record IDs and tunnel target (`80721cb3-8faf-42c0-b777-f20f09c2ec22.cfargotunnel.com`); manual recreation needed to revert DNS.
- `docs/design-board.html` — GPT v1 frontend design board, committed on GPT's behalf after security review (secrets/XSS/data-fetching check only, not a taste review) per the new Claude/GPT division-of-labor convention.
- `~/.claude/commands/vaultunseal.md` — rewritten to use direct `ssh` (not SSH MCP tools) throughout; host table, redaction cause, boot-wait, and failure-mode rows added.
- `~/.claude/projects/-Volumes-DevDrive-M4Pro-Projects-Websites-clients-myro-productions-website/memory/ssh-mcp-redacts-high-entropy-output.md` — memory of the SSH MCP redaction issue.
- `~/.claude/CLAUDE.md` §2 — "RUN TO COMPLETION" rule added this session.
- `/Volumes/DevDrive-M4Pro/Projects/Websites/CLAUDE.md` — "AWS Architecture and Backend Engineering" section and "Division of Labor: Claude (backend) / GPT (frontend v1)" section added this session.

### Commits on the branch (oldest → newest)
- `6133e34` fix(serving): align container port with tunnel ingress, set public site URL
- `a89cc8c` chore: drop dead src/.gitkeep artifacts
- `9d3e30a` docs: AWS migration options analysis
- `ae9db78` feat: strip to static landing site, target Cloudflare Workers (50 files, +8977/-11045)
- `5e4ba15` docs: add frontend design board (GPT v1)
- `cf01e87` docs: DNS rollback record + design board revision

## Next steps + open questions

1. **Push the branch and open a PR to master** on the `Myro-Productions-Portfolio` GitHub account (`gh auth switch --user Myro-Productions-Portfolio` first — this repo belongs to that identity, not the personal one).
2. **Set up uptime monitoring.** This is the thread through the whole session: the site was silently down 7 weeks, and `allstarbowlindy` still is. A 200 from the edge proves nothing on its own — check should assert body content, not just status code. Options already researched: Route 53 health check → CloudWatch alarm → SNS (~$0–0.75/mo), or a free external monitor like UptimeRobot (~5 min setup, no AWS). CloudWatch Synthetics canary (~$11/mo) was rejected as costing more than the hosting itself. No monitoring exists today — this is the highest-leverage open item.
3. **Homelab teardown** — stop/remove the now-redundant `myro-website` + `myro-website-db` containers and remove the apex/www ingress from the tunnel config (the DNS records are already detached; the tunnel's ingress rules for those hostnames may still reference them). Not started.
4. **Next.js 15 → 16 upgrade** before EOL 2026-10-21 (~5 weeks out) to close the remaining 2 audit vulnerabilities. Breaking change, deliberately not bundled into this session.
5. Confirm whether `docs/aws-migration-options.md` should be moved/archived somewhere more permanent or just left in place on the shelf.
- ? Should the redundant homelab containers be stopped now, or kept warm as a manual fallback for some longer soak period before teardown?

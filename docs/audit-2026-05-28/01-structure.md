# Structure & Organization Audit

**Audit date:** 2026-05-28
**Lens:** Structure & Organization

## Verdict

The codebase is **mixed** — the core Next.js source (`app/`, `components/`, `lib/`, `prisma/`) is coherent and idiomatic for App Router, but the project carries significant structural debt from its automated build origin: a committed `.worktrees/` directory containing a full parallel copy of the entire codebase, non-standard numbered top-level directories (`01-DOCUMENTATION`, `03-TESTS`, `04-ASSETS`, `07-ARCHIVED`) that partially duplicate idiomatic locations, an empty `src/` placeholder, and a README that describes a fictional directory structure rather than the actual one. The single biggest organizational issue is that `.worktrees/001-myro-productions-personal-website/` is tracked in git and contains a complete second copy of the entire project — every source file, every doc, every config — inflating the repository and guaranteeing confusion for any new developer who opens the tree.

## Inventory

**Source directories (idiomatic):**
- `app/` — 35 files: 1 root page, 7 admin pages, 2 payment pages, 1 project detail page, 26 API route files
- `components/` — 43 files across: `admin/` (3), `animations/` (5), `icons/` (8), `sections/` (11 including contact subdir), `seo/` (1), `stripe/` (1), `ui/` (12)
- `lib/` — 16 files across: `admin/` (2), `auth/` (3 + README), `hooks/` (1), `stripe/` (2), `validation/` (1), root utils
- `prisma/` — 3 files: schema, seed, README (no migrations directory)
- `public/` — 6 files: 2 hero images, 1 profile photo, 2 cert badges, manifest.json
- `middleware.ts` — root-level, idiomatic

**Non-standard top-level directories:**
- `01-DOCUMENTATION/` — 42 files (feature summaries, audit reports, security audit)
- `03-TESTS/` — 22 files (`__mocks__/`, `__tests__/` with unit/integration/e2e)
- `04-ASSETS/` — 3 files (2 hero images, 1 profile photo — duplicates of `public/images/`)
- `07-ARCHIVED/` — 2 files (one Playwright HTML report, one empty text file)

**Tooling directories in repo:**
- `.auto-claude/` — gitignored, 15 files
- `.claude/` — NOT gitignored, 3 files (security-audit command, agent README, commands README)
- `.worktrees/001-myro-productions-personal-website/` — NOT gitignored, ~150+ files (full project copy)
- `.auto-claude-status` — NOT gitignored, root-level status file

**Documentation:**
- `docs/` — 7 canonical docs (ARCHITECTURE, DEVELOPMENT, DEPLOYMENT, API, TESTING, CONTRIBUTING, SECURITY — all exist) + `docs/adr/` (10 ADRs + README)
- `01-DOCUMENTATION/` — 42 additional ad-hoc markdown files, overlapping in topic with `docs/`

**Tests:**
- Jest unit/integration: 20 test files in `03-TESTS/__tests__/`
- Playwright E2E: 4 spec files in `03-TESTS/__tests__/e2e/`
- `__mocks__/`: 2 files in `03-TESTS/__mocks__/`

**Route counts:**
- Public page routes: 5 (`/`, `/projects/[slug]`, `/payment/success`, `/payment/cancelled`, admin prefix)
- Admin page routes: 6 (`/admin`, `/admin/login`, `/admin/clients`, `/admin/projects`, `/admin/payments`, `/admin/subscriptions`)
- API routes: 26 (contact, stripe checkout/webhooks, calendly webhook, 22 admin API routes)

## Findings

### Finding 1 — HIGH: `.worktrees/` committed to git, not gitignored

`.worktrees/001-myro-productions-personal-website/` is a full parallel copy of the entire project tracked in version control. The directory contains its own copies of every source file, every config file, every doc, and its own `.gitignore`. ADR-009 (`docs/adr/ADR-009-git-worktrees.md`, line 296) explicitly states "Gitignore Worktrees: Already handled by `.gitignore`" — this is false. The root `.gitignore` does not contain `.worktrees/`. The worktree was created during an initial automated build session on a Windows machine (`D:\Projects\Myro_Productions_Website`, per `.auto-claude/specs/001-myro-productions-personal-website/build-progress.txt` line 5) and was never pruned.

### Finding 2 — HIGH: README describes a fictional directory structure

`README.md` lines 162-208 show a project structure that does not match reality on three counts: (a) it shows `app/(public)/` route groups that do not exist; (b) it shows `components/layout/` and `components/features/` subdirectories that do not exist — actual subdirs are `animations/`, `icons/`, `sections/`, `admin/`, `seo/`, `stripe/`, `ui/`; (c) it shows `lib/db.ts` and `lib/auth.ts` but actual paths are `lib/prisma.ts` and `lib/auth/` (a directory).

### Finding 3 — HIGH: Tests are not where the toolchain expects them; Playwright config points to wrong path

`jest.config.ts` uses `testMatch: ['**/__tests__/**/*.test.[jt]s?(x)']` — this WILL match `03-TESTS/__tests__/` by glob expansion. However `playwright.config.ts` line 8 sets `testDir: './__tests__/e2e'`. There is no `__tests__/e2e/` at the project root. The E2E specs actually live at `03-TESTS/__tests__/e2e/`. Running `npm run test:e2e` from the project root will find zero tests.

> **Cross-reference with the code-quality audit (Finding 1):** The code-quality agent reported the Jest test suite as completely non-functional because tests are in `03-TESTS/` and Jest's working directory is the root. The structure agent here says Jest's `**/__tests__/**` glob DOES traverse subdirectories and would match `03-TESTS/__tests__/`. The two agents disagree. This must be verified by actually running `npm test` on the resurrected host — but the Playwright issue (explicit `testDir`) is unambiguous and confirmed.

### Finding 4 — MED: E2E tests are out of sync with the actual page structure

The homepage E2E spec (`03-TESTS/__tests__/e2e/homepage.spec.ts`, lines 23-29) asserts that the page contains exactly 5 sections: `#home, #services, #portfolio, #about, #contact`. The actual `app/page.tsx` (lines 39-53) renders 8 sections: Hero, Services, Process, Portfolio, About, Pricing, FAQ, Contact. Three sections (Process, Pricing, FAQ) are completely absent from the test suite.

### Finding 5 — MED: Numbered directory scheme is non-standard, incomplete, and partially redundant

The numbered top-level dirs (`01-DOCUMENTATION`, `03-TESTS`, `04-ASSETS`, `07-ARCHIVED`) follow no documented convention and have gaps (no 02, 05, 06 exist). `04-ASSETS/` contains images that are byte-for-byte duplicates of files in `public/images/`. `01-DOCUMENTATION/` contains 42 ad-hoc feature-implementation notes that overlap with the 7 canonical docs in `docs/`.

### Finding 6 — MED: `src/` directory exists but contains only a `.gitkeep`

Nothing imports from `src/`. The `@/` alias in `jest.config.ts` maps to `<rootDir>/`, not `src/`. This is a placeholder from project initialization.

### Finding 7 — MED: `.claude/` committed to repo; `.auto-claude-status` also committed

`.claude/commands/security-audit.md` and `.claude/agents/README.md` are committed. `.auto-claude-status` is committed at the root. `.gitignore` only catches `.auto-claude/`.

### Finding 8 — MED: `prisma/migrations/` directory is absent; README's `npm run db:migrate` is unverified

The README instructs `npm run db:migrate` as a setup step but no migration history exists. A developer following the README cannot set up the database using the documented command.

### Finding 9 — LOW: `components/ui/Navigation.md` is a stray documentation file inside the components tree

This pattern is not followed by any other component. It belongs in `docs/` or `01-DOCUMENTATION/`.

### Finding 10 — LOW: `.env.example` is missing; README's setup flow is broken at step 3

`README.md` line 97 instructs `cp .env.example .env.local`. No `.env.example` file exists in the repository.

## Refactor vs. Rebuild Lean (Structure Lens)

**Refactor.** The core source is cleanly organized — `app/`, `components/`, `lib/`, `prisma/`, `middleware.ts` follow App Router conventions correctly, and the component subdivision is reasonable. The problems are all additive debt, not architectural rot: stale worktree, numbered directories that should be consolidated, test tooling config pointing at wrong paths, documentation never reconciled with reality. None of this requires a rebuild. Estimated 2-4 hours of mechanical cleanup, no code changes required.

## Essential Files for Understanding This Codebase

- `app/page.tsx` — actual page composition (8 sections, not 5 as tests claim)
- `app/layout.tsx` — root layout and providers
- `middleware.ts` — auth protection and security headers
- `prisma/schema.prisma` — data model (Client, Subscription, Project, Payment, AdminUser, ActivityLog)
- `jest.config.ts`, `playwright.config.ts` — test discovery configs (Playwright broken)
- `.gitignore` — missing `.worktrees/`, `.claude/`, `.auto-claude-status` entries
- `03-TESTS/__tests__/e2e/homepage.spec.ts` — tests against old 5-section structure
- `docs/adr/ADR-009-git-worktrees.md` — claims `.worktrees/` is gitignored (false)
- `README.md` — describes fictional structure, do not use as directory reference

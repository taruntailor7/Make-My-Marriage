# Make My Marriage

Multi-tenant SaaS for Indian wedding planning. Next.js App Router monolith.

## Stack

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **DB:** MongoDB Atlas (M0 free tier) + Mongoose
- **Auth:** NextAuth.js v5 — Google OAuth + email/password (phone OTP deferred)
- **UI:** Tailwind CSS + shadcn/ui + react-hook-form + zod
- **Storage:** Cloudinary (photos, receipts, contracts)
- **Email:** Resend
- **Hosting:** Vercel

## Critical Architecture Rules

- **NEVER call Mongoose models directly in route handlers or Server Actions.** All tenant-scoped DB access goes through `TenantContext` (`src/lib/db/tenant-context.ts`). This is the single most important safety constraint — it prevents cross-tenant data leaks.
- **Server Actions** for all organizer dashboard mutations. REST API routes only for guest-facing (RSVP, gallery, invite) and internal (cron) endpoints.
- **JWT sessions**, not database sessions. JWT stores `userId` and `activeWeddingId`.
- **Hard delete everywhere.** No soft delete pattern. DPDP Act compliance.

## Roles

- **Owner** — full control, can delete wedding, manage other owners
- **Family Admin** — full planning access, no account-level actions
- **Event Coordinator** — scoped to specific events only, no budget/vendor access

## Project Structure

```
src/
  app/
    (auth)/          — login, signup, forgot-password, reset-password
    (dashboard)/     — all organizer pages (auth-gated via middleware)
    (onboarding)/    — create-wedding, weddings list
    w/[slug]/        — public wedding website
    rsvp/[token]/    — guest RSVP (no auth)
    gallery/[eventId]/ — guest photo gallery (no auth)
    invite/[token]/  — invite acceptance page
    api/             — REST routes (auth, invite, rsvp, upload, gallery, cron)
  lib/
    db/models/       — 12 Mongoose models
    db/tenant-context.ts — THE tenant scoping layer
    db/connection.ts — MongoDB connection singleton (cached for serverless)
    auth/config.ts   — NextAuth configuration
    actions/         — Server Action files (safe-action wrapper)
    validations/     — Zod schemas per domain
    notifications/   — Email engine + templates (Resend)
    cloudinary/      — Upload signing + cleanup helpers
    data/            — Static data (checklist template)
    rate-limit.ts    — In-memory rate limiter for public endpoints
  components/
    ui/              — shadcn/ui components
    dashboard/       — dashboard-specific components
    forms/           — reusable form components
    wedding-website/ — wedding website template components
  types/             — Shared TypeScript types
  middleware.ts      — Auth guard for dashboard routes
```

## Documentation

All product and technical docs are in `docs/`:
- `PRD.md` — 24 features, 4 phases, all requirements locked
- `ARCHITECTURE.md` — system design, data model, implementation order, UI direction, edge case defaults
- `DATABASE_DESIGN.md` — 12 collections, full schemas, indexes, queries, cascades, virtuals, middleware hooks
- `API_DESIGN.md` — 57 Server Actions + 10 REST routes, zod schemas, auth rules, role requirements
- `LANDING_PAGE_DESIGN.md` — landing page design brief
- `STITCH_PROMPTS.md` — UI design prompts for all 22 pages

**When implementing a feature, read the relevant doc section first. Don't guess — schemas, validation rules, field types, and business logic are all specified.**

## Build Order (Phase 1 — Foundation)

Per `ARCHITECTURE.md` Section 16.2:

1. ~~Project scaffold (Next.js + deps + shadcn + folder structure)~~ ✅
2. ~~MongoDB connection singleton~~ ✅
3. ~~All 12 Mongoose models~~ ✅
4. ~~NextAuth config (Google + Credentials, JWT, MongoDB adapter)~~ ✅
5. ~~middleware.ts (protect dashboard routes)~~ ✅
6. ~~TenantContext class~~ ✅
7. ~~Zod validation schemas~~ ✅
8. ~~actionClient wrapper (next-safe-action)~~ ✅
9. Auth pages (login, signup, forgot-password, reset-password)
10. Onboarding (no-weddings state, create wedding flow)
11. Events CRUD
12. Organizer invite flow (generate link, redeem)
13. Revoke organizer access
14. Multi-wedding switcher
15. Dashboard shell
16. Landing page

## Color System

- Primary (gold): `#C8A26B` — buttons, accents, highlights
- Secondary (navy): `#1E293B` — sidebar, secondary buttons
- Background (cream): `#FAFAF8` — page background
- Card: `#FFFFFF`
- Text: `#1A1A1A` primary, `#6B6B6B` secondary
- Border: `#E8E5E0`
- Dark sections: `#111111`
- Headings: Playfair Display (serif) on marketing pages, DM Sans (sans-serif) in dashboard
- Body: DM Sans throughout

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npx tsc --noEmit     # type-check without building
```

## npm Registry

Project uses `.npmrc` with `registry=https://registry.npmjs.org/` to override the user's global JFrog Artifactory registry. Always use `NPM_CONFIG_REGISTRY=https://registry.npmjs.org/` prefix when running `npx` commands.

## Git Workflow

- Never commit to main directly — always feature branches
- No commits without explicit user instruction
- Conventional commits: `type(scope): subject`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

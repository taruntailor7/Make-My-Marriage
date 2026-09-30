# Make My Marriage — Project Status

## Build Progress

| # | Feature | Status | Date | Notes |
|---|---------|--------|------|-------|
| 1 | Project scaffold | ✅ Done | 2026-09-30 | Next.js 14 + TS, 12 Mongoose models, NextAuth v5, TenantContext, Zod schemas, middleware, safe-action wrapper |
| 2 | Security hardening | ✅ Done | 2026-09-30 | Fixed OAuth linking, timing leak, coordinator role gate, Cloudinary path validation |
| 3 | Landing page | ✅ Done | 2026-09-30 | All 11 sections matching Stitch design — nav, hero with dashboard mockup, features, how-it-works, dashboard preview (dark), role cards, guest experience with phone mockup, trust signals, CTA, footer |
| 4 | Auth pages | ✅ Done | 2026-09-30 | Login, signup, forgot-password, reset-password. Split-screen design, Google OAuth wired, Zod validation, server actions (signup, forgot-password with Resend email, reset-password with token + session invalidation) |
| 5 | Onboarding | ✅ Done | 2026-09-30 | Get-started (no-weddings state), create-wedding 3-step wizard with server action (creates wedding + owner membership), my-weddings page with server-side data fetching |
| 6 | Dashboard shell | 🔲 Next | — | Sidebar + header + wedding switcher |
| 7 | Events CRUD | 🔲 Planned | — | |
| 8 | Organizer invite flow | 🔲 Planned | — | |
| 9 | Multi-wedding switcher | 🔲 Planned | — | |

## Phase 1 Build Order Reference

Per `ARCHITECTURE.md` Section 16.2:
1. ~~Project scaffold~~ ✅
2. ~~MongoDB connection singleton~~ ✅
3. ~~All 12 Mongoose models~~ ✅
4. ~~NextAuth config~~ ✅
5. ~~middleware.ts~~ ✅
6. ~~TenantContext class~~ ✅
7. ~~Zod validation schemas~~ ✅
8. ~~actionClient wrapper~~ ✅
9. ~~Auth pages~~ ✅
10. ~~Onboarding~~ ✅
11. Events CRUD ← **next**
12. Organizer invite flow
13. Revoke organizer access
14. Multi-wedding switcher
15. Dashboard shell
16. ~~Landing page~~ ✅

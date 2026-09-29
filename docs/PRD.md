# Make My Marriage — Product Requirements Document

## 1. Problem

Planning an Indian wedding spans multiple events (Haldi, Mehendi, Sangeet,
wedding ceremony, reception...), multiple families, and multiple people
helping out — currently coordinated ad hoc over WhatsApp threads and
spreadsheets, with no shared source of truth, no access control, and no
single place to track tasks, budget, vendors, or guests. Make My Marriage
is a multi-tenant SaaS that gives each couple a shared, permissioned space
to plan their wedding end-to-end.

## 2. Users & Permissions

- **Owner** — bride, groom, or anyone else explicitly added as a co-owner. Full control, including deleting the wedding and adding/removing other Owners. A wedding can have more than one Owner.
- **Family Admin** — parents, siblings, close family. Full planning access, minus account-level actions (delete wedding, manage Owners).
- **Event Coordinator** — a helper (friend, relative, planner) scoped to specific event(s) only.
- **Guest** — invited to specific event(s). No login or account required.

| Capability | Owner | Family Admin | Event Coordinator | Guest |
|---|---|---|---|---|
| View/edit assigned event(s) | ✓ | ✓ | ✓ (only assigned) | — |
| View/edit all events, budget, guests | ✓ | ✓ | ✗ | — |
| Invite/revoke organizers | ✓ | ✓ | ✗ | — |
| Delete wedding / manage Owners | ✓ | ✗ | ✗ | — |
| RSVP, upload photos, view website | — | — | — | ✓ |

## 3. Goals (v1)

- A couple can run their entire multi-event wedding — planning, budget, guests, vendors, public presence — inside one product, without falling back to spreadsheets or ad hoc WhatsApp coordination for anything this PRD covers.
- Access is correctly scoped: an Event Coordinator assigned to one event never sees another event's budget or guest list.
- Guests can RSVP and upload photos with zero friction — no app install, no account creation required.

## 4. Non-Goals (v1)

- Not a vendor discovery/marketplace — only tracks vendors *you already hired*, not vendor browsing/reviews (Backlog)
- Not a payments platform — no billing, no in-app vendor payment processing; advance/balance are records, not transactions
- Not a general-purpose website builder — template-based, not drag-and-drop
- Not building live-streaming infrastructure — embeds existing services only
- India-only for v1 — no multi-currency, no i18n
- No guest travel/accommodation tracking, no seating/table planning (Backlog)

## 5. Locked Product Decisions

- Multi-tenant SaaS from day one (not a personal single-wedding tool)
- No hard deadline — product build, not racing a real wedding date
- Stack: Next.js (App Router) + TypeScript, MongoDB Atlas, Mongoose, NextAuth.js v5, Cloudinary, Resend, Vercel — see docs/ARCHITECTURE.md for full stack table
- Pricing: free for now, no billing built into v1, monetize later
- Market: India-only for now (single currency, Indian phone formats, no i18n yet)
- Auth: Google OAuth + email/password at launch; phone OTP deferred (requires paid SMS provider)
- A wedding can have multiple Owners

## 6. Features

### 6.1 Foundation

**1. Sign up / log in** — phone OTP, Google, or email+password, user's choice each time.
- Collects display name on first login, plus phone number for contact purposes even if login was via Google/email.
- **Identity linking**: accounts are matched on verified phone/email as the unique key across auth methods — a login with a different method that matches an existing verified phone/email links to the same account instead of creating a duplicate.

**2. Create a wedding**
- Fields: name, date range (start–end), optional cover photo.
- Creator becomes the first Owner automatically.

**3. Events**
- Fields: name, date, start/end time, venue (free-text address), optional notes/dress code, event type (preset: Haldi/Mehendi/Sangeet/Wedding/Reception/Other).
- Sorted by date/time automatically.

**4. Organizer roles** — Owner / Family Admin / Event Coordinator, as defined in Section 2. Multiple Owners allowed.

**5. Invite organizers**
- Owner/Family Admin picks a role (Owner, Family Admin, or Event Coordinator + event scope) first, then generates a shareable link/code. Shared manually (WhatsApp, text, call) — no in-app sending.
- **Link security**: single-use, expires after 7 days or first use, whichever comes first — an indefinitely-reusable admin invite link is a real access risk given the guest PII involved.

**6. Revoke organizer access** — immediate on next access check (enforced via TenantContext, no caching delay). Past edits stay attributed to the removed person; only access is removed.

**7. Multi-wedding membership** — one identity, multiple wedding memberships, switcher shown only when a user belongs to more than one.

**8. Dashboard shell** — upcoming events sorted by date, countdown to the next event, entry points into Tasks/Budget/Guests/Website.

### 6.2 Core Planning

**9. Task planner — core**
- Fields: title, description (optional), due date (optional), assignee (any organizer), linked event (optional — some tasks are wedding-wide, e.g. "book photographer"), status.
- **Status model**: simple done/not-done, not a multi-stage workflow — wedding tasks are binary in practice.
- Assignee is notified on assignment and again as the due date approaches (via the notification engine, #23).

**10. Starter checklist template**
- One generic template (~20-30 common tasks: book venue, send invites, order outfits, book photographer, etc.), applied via an explicit "apply template" action at wedding creation — opt-in, not auto-populated.

**11. Budget — targets**
- Optional target amount per category (starter categories: venue, catering, decor, photography, attire, jewelry, vendor misc — editable list). A reference line only, never an enforced cap.
- Only per-category targets are in scope, and even those are optional — the point is tracking actual spend, never enforcing a limit. No overall wedding-level budget cap.

**12. Budget — actuals**
- Fields per expense: amount, category, date, linked vendor (optional, #14), payment method (free-text tag — cash/UPI/card/bank transfer, recorded only, never processed), notes, optional receipt photo.
- View: category-by-category actual vs. target where a target is set.

**13. Budget — multi-family contribution tracking**
- Each expense tagged with a funder (bride's side / groom's side / joint / specific named person — editable list per wedding). View: totals by funder alongside totals by category.

**14. Vendor management**
- Fields per vendor: name, category (caterer/decorator/photographer/etc., preset + Other), contact (phone/email), notes, optional contract/quote file upload, assigned event(s) (optional — some vendors cover the whole wedding).
- Payment schedule: multiple installments per vendor (advance, mid-payment, final balance, etc.), each with amount, due date, paid checkbox. Marking one paid auto-creates the linked expense in #12 — no double entry.

### 6.3 Guest Experience

**15. Guest list**
- Fields: name, phone, email (optional), relation (free text), side (bride's/groom's/joint), plus-ones allowed (integer, default 0).
- Add one-by-one, or bulk CSV import with column mapping.

**16. Event-level guest lists**
- Each guest is checked into the event(s) they're invited to at add-time (editable later). Event Coordinators see only guests invited to their assigned event(s); Owners/Family Admins see everyone.

**17. Digital invitations**
- App generates a shareable invite card per event (couple's names, event name/date/time/venue, chosen from a small set of visual templates) as an image or link. Shared manually by the organizer — the app doesn't send it.

**18. RSVP**
- Guest accesses via a unique per-guest link (no login), sees only the events they're invited to. One session: an "attending everything" shortcut, or event-by-event yes/no. Captures headcount (up to their plus-one allowance) and a free-text dietary/meal note per attending event.
- Guest can revisit the same link and change their response until a cutoff date.
- **RSVP cutoff**: one cutoff date per wedding, not per event.

**19. Reminders**
- RSVP-deadline nudges to guests who haven't responded, event-day alerts to organizers/guests — routed through the shared notification engine (#23), which gets its first real implementation here.

### 6.4 Public Presence

**20. Wedding website**
- Template picker (small set of visual templates) + content form: couple's story, schedule (pulled from Events), venue/map per event, registry/gift info, FAQ — each section toggleable on/off.
- Default subdomain (e.g. `riya-arjun.makemymarriage.app`); custom domain is an upgrade path, not v1-blocking.
- **Privacy**: the site is public-by-link (normal for wedding websites — schedule/venue isn't sensitive). The guest list is never shown on it, and RSVP only happens through a guest's own unique link, never a public form on the site. No guest ever needs credentials for anything guest-facing — RSVP, website, or gallery upload.

**21. Photo gallery**
- Albums per event. A QR code shown at the venue links to a mobile upload page scoped to that event's album — no login, no app.
- **Moderation**: uploads go live immediately by default, organized per event; a per-wedding toggle lets Owners flip to "require approval" if they want to pre-screen.
- Photos only in v1 (no video), to keep storage cost predictable.
- Viewing/downloading: anyone with the gallery link, same audience as the website.

**22. Live streaming** — website embeds a YouTube Live/Zoom/Vimeo link the couple sets up separately; no custom streaming infrastructure.

## 7. Cross-Cutting Requirements

**23. Notification engine** — one shared system (email/SMS/WhatsApp/push) that every reminder in the product routes through (RSVP deadlines, task due dates, vendor payment due dates, event-day alerts) — not bespoke per-feature logic.

**24. PII/security & DPDP compliance** — guest contact info, addresses, payment data, and photos require access control and careful data handling as a day-one constraint, not a backlog item, since the product serves Indian users under the DPDP Act.

## 8. Backlog (explicitly not in v1 — revisit later)

- Guest travel & accommodation tracking (flights, hotel room blocks)
- Seating & meal-table planning
- Vendor marketplace (browse/discover vendors, reviews) — distinct from #14
- WhatsApp Business API integration (auto-sent invites/reminders instead of manual link-sharing)
- Analytics (RSVP response rates, budget burn rate over time)
- Gift registry / cash gift tracking
- Regional/religious template variants, multi-language support
- Native mobile apps

## 9. Build Order

Phase 1 Foundation (#1-8) → Phase 2 Core Planning (#9-14) → Phase 3 Guest
Experience (#15-19) → Phase 4 Public Presence (#20-22). Cross-cutting
(#23-24) built alongside whichever phase first needs them. Backlog is
revisited after v1 ships.

This ordering is for implementation sequencing only — the PRD and the
architecture are unified across all phases, not split per phase.

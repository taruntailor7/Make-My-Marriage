# Make My Marriage — System Architecture

## 1. Stack

| Layer | Choice | Free tier limits |
|---|---|---|
| Framework | Next.js 14+ (App Router) + TypeScript | — |
| Architecture | Monolith — Server Components + Server Actions | — |
| UI | Tailwind CSS + shadcn/ui + react-hook-form + zod | — |
| Database | MongoDB Atlas (M0 shared cluster) | 512MB |
| ODM | Mongoose | — |
| Auth | NextAuth.js v5 (Auth.js) — Google OAuth + email/password | — |
| Photo/file storage | Cloudinary | 25GB storage, 25GB bandwidth/mo |
| Email | Resend | 3,000 emails/mo, 100/day |
| Hosting | Vercel (Hobby) | 100GB bandwidth/mo |
| QR codes | `qrcode` npm package (client-side) | — |
| Invite card images | `@vercel/og` (Satori, built into Vercel) | — |
| Scheduled jobs | Vercel Cron Jobs | Daily frequency on free tier |
| Phone OTP | Deferred — add Twilio/MSG91 when ready to pay | — |

**Monthly cost at launch: ₹0.** First bottleneck will be Cloudinary storage
if guest photo uploads get heavy (25GB free).

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (Hosting)                  │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │           Next.js App (Monolith)             │   │
│  │                                              │   │
│  │  ┌──────────────┐  ┌─────────────────────┐   │   │
│  │  │ (dashboard)  │  │ Public pages        │   │   │
│  │  │ Auth-gated   │  │ w/[slug]  (website) │   │   │
│  │  │ Tenant-scoped│  │ rsvp/[token]        │   │   │
│  │  │              │  │ gallery/[eventId]    │   │   │
│  │  └──────┬───────┘  └──────┬──────────────┘   │   │
│  │         │                 │                   │   │
│  │  ┌──────▼─────────────────▼──────────────┐   │   │
│  │  │         lib/services/                 │   │   │
│  │  │   Business logic + TenantContext      │   │   │
│  │  └──────┬──────────┬──────────┬──────────┘   │   │
│  │         │          │          │               │   │
│  └─────────┼──────────┼──────────┼───────────────┘   │
│            │          │          │                    │
└────────────┼──────────┼──────────┼────────────────────┘
             │          │          │
     ┌───────▼──┐  ┌────▼───┐  ┌──▼──────┐
     │ MongoDB  │  │Cloudin-│  │ Resend  │
     │ Atlas    │  │ary     │  │ (email) │
     └──────────┘  └────────┘  └─────────┘
```

**Two audiences, one app:**
- **Organizer app** (`(dashboard)/`) — behind NextAuth session. Every
  query scoped to the user's active wedding via TenantContext.
- **Guest-facing pages** (`w/`, `rsvp/`, `gallery/`) — public or
  token-based. No login required. Accessed via shareable links/QR codes.

## 3. Data Model

### 3.1 Collections

#### `users`
Managed by NextAuth. Extended with a profile.
```
{
  _id: ObjectId,
  name: string,
  email: string | null,          // unique sparse index
  emailVerified: Date | null,
  phone: string | null,          // unique sparse index
  image: string | null,          // avatar URL
  // NextAuth manages: accounts, sessions sub-collections
}
```

#### `weddings`
Top-level tenant entity. Every other collection references this.
```
{
  _id: ObjectId,
  name: string,                  // "Riya & Arjun's Wedding"
  slug: string,                  // "riya-arjun" — unique, for wedding website URL
  startDate: Date,
  endDate: Date,
  coverPhoto: string | null,     // Cloudinary URL
  createdBy: ObjectId,           // ref → users

  // Embedded: budget category targets (small, always loaded with wedding)
  budgetCategories: [{
    key: string,                 // "venue", "catering", "decor", etc.
    label: string,
    target: number | null        // optional — tracking, not enforcing
  }],

  // Embedded: funder list for contribution tracking
  funders: [{
    key: string,                 // "brides-side", "grooms-side", "joint", or custom
    label: string
  }],

  // Embedded: wedding website content (one-to-one with wedding)
  website: {
    templateId: string,
    isPublished: boolean,
    sections: {
      story: { enabled: boolean, content: string },
      schedule: { enabled: boolean },       // pulls from events automatically
      venue: { enabled: boolean },          // pulls from events automatically
      registry: { enabled: boolean, content: string },
      faq: { enabled: boolean, items: [{ q: string, a: string }] },
      gallery: { enabled: boolean },        // links to photo gallery
      livestream: { enabled: boolean, embedUrl: string | null }
    }
  },

  // Settings
  rsvpCutoffDate: Date | null,
  galleryModerationEnabled: boolean,  // default false (uploads go live)

  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ slug: 1 }` unique.

#### `weddingMembers`
RBAC join table. Queried on every authenticated request for authorization.
```
{
  _id: ObjectId,
  weddingId: ObjectId,           // ref → weddings
  userId: ObjectId,              // ref → users
  role: "owner" | "family_admin" | "event_coordinator",
  eventScope: [ObjectId],        // ref → events. Only used when role = event_coordinator.
                                 // Empty for owner/family_admin (they see everything).
  invitedBy: ObjectId,           // ref → users
  createdAt: Date
}
```
Indexes: `{ weddingId: 1, userId: 1 }` unique compound, `{ userId: 1 }` (for "my weddings" query).

#### `events`
```
{
  _id: ObjectId,
  weddingId: ObjectId,           // ref → weddings
  name: string,
  date: Date,
  startTime: string | null,      // "18:00"
  endTime: string | null,
  venue: string | null,          // free-text address
  eventType: "haldi" | "mehendi" | "sangeet" | "wedding" | "reception" | "other",
  notes: string | null,
  dressCode: string | null,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ weddingId: 1, date: 1 }`.

#### `guests`
```
{
  _id: ObjectId,
  weddingId: ObjectId,           // ref → weddings
  name: string,
  phone: string | null,
  email: string | null,
  relation: string | null,       // free text
  side: "bride" | "groom" | "joint",
  plusOnesAllowed: number,        // default 0
  eventIds: [ObjectId],          // ref → events they're invited to

  // Embedded: RSVP responses (max ~10, one per event, always accessed with guest)
  rsvps: [{
    eventId: ObjectId,
    attending: boolean | null,    // null = not yet responded
    headcount: number,            // 1 (self) + plus-ones attending
    dietaryNote: string | null
  }],

  rsvpRespondedAt: Date | null,  // last RSVP submission timestamp

  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ weddingId: 1 }`, `{ weddingId: 1, side: 1 }`.

#### `tasks`
```
{
  _id: ObjectId,
  weddingId: ObjectId,
  title: string,
  description: string | null,
  dueDate: Date | null,
  assigneeId: ObjectId | null,   // ref → users (an organizer)
  eventId: ObjectId | null,      // ref → events (null = wedding-wide task)
  isDone: boolean,               // simple binary status
  isFromTemplate: boolean,       // true if created by applying checklist template
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ weddingId: 1, isDone: 1 }`, `{ weddingId: 1, eventId: 1 }`.

#### `expenses`
```
{
  _id: ObjectId,
  weddingId: ObjectId,
  amount: number,                // in INR (rupees, 2 decimal places)
  category: string,              // matches a budgetCategories.key on the wedding
  date: Date,
  vendorId: ObjectId | null,     // ref → vendors
  vendorPaymentIndex: number | null, // which installment this came from, if vendor-linked
  paymentMethod: string | null,  // free text: "cash", "UPI", "card", "bank transfer"
  funder: string | null,         // matches a funders.key on the wedding
  notes: string | null,
  receiptPhoto: string | null,   // Cloudinary URL
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ weddingId: 1, category: 1 }`, `{ weddingId: 1, vendorId: 1 }`.

#### `vendors`
```
{
  _id: ObjectId,
  weddingId: ObjectId,
  name: string,
  category: string,              // "caterer", "decorator", "photographer", etc.
  phone: string | null,
  email: string | null,
  notes: string | null,
  contractFile: string | null,   // Cloudinary URL
  eventIds: [ObjectId],          // ref → events (empty = whole wedding)

  // Embedded: payment schedule (max ~5-10 installments, always accessed with vendor)
  payments: [{
    label: string,               // "Advance", "50% mid-payment", "Final balance"
    amount: number,
    dueDate: Date | null,
    isPaid: boolean,
    paidDate: Date | null,
    linkedExpenseId: ObjectId | null  // ref → expenses (auto-created when marked paid)
  }],

  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ weddingId: 1 }`.

#### `photos`
Metadata only — actual images stored in Cloudinary.
```
{
  _id: ObjectId,
  weddingId: ObjectId,
  eventId: ObjectId,             // ref → events (album = event)
  cloudinaryPublicId: string,
  url: string,                   // Cloudinary delivery URL
  thumbnailUrl: string,          // Cloudinary auto-generated thumbnail
  uploadedBy: string | null,     // free text name (guests aren't users)
  isApproved: boolean,           // relevant only when galleryModerationEnabled = true
  createdAt: Date
}
```
Indexes: `{ weddingId: 1, eventId: 1, createdAt: -1 }`.

#### `inviteTokens`
For organizer invitations (shareable link/code).
```
{
  _id: ObjectId,
  weddingId: ObjectId,
  token: string,                 // unique, URL-safe random string
  role: "owner" | "family_admin" | "event_coordinator",
  eventScope: [ObjectId],        // only for event_coordinator
  createdBy: ObjectId,           // ref → users
  usedBy: ObjectId | null,       // ref → users (null until redeemed)
  usedAt: Date | null,
  expiresAt: Date,               // 7 days from creation
  createdAt: Date
}
```
Indexes: `{ token: 1 }` unique, `{ expiresAt: 1 }` TTL index (auto-delete expired tokens).

#### `rsvpTokens`
For guest RSVP access (unique link per guest, no login).
```
{
  _id: ObjectId,
  weddingId: ObjectId,
  guestId: ObjectId,             // ref → guests
  token: string,                 // unique, URL-safe random string
  createdAt: Date
}
```
Indexes: `{ token: 1 }` unique, `{ guestId: 1 }` unique.

#### `notifications`
Log of sent notifications (for dedup and audit).
```
{
  _id: ObjectId,
  weddingId: ObjectId,
  type: "rsvp_reminder" | "task_due" | "vendor_payment_due" | "event_day",
  channel: "email" | "sms" | "whatsapp" | "push",
  recipientType: "organizer" | "guest",
  recipientId: string,           // userId or guestId
  recipientContact: string,      // email or phone (for audit)
  status: "sent" | "failed" | "bounced",
  sentAt: Date,
  metadata: object               // type-specific data (eventId, taskId, etc.)
}
```
Indexes: `{ weddingId: 1, type: 1, sentAt: -1 }`.

### 3.2 Embedding vs. Reference Summary

| Data | Strategy | Reason |
|---|---|---|
| Budget categories/targets | Embedded in `weddings` | Small list (~10), always loaded with wedding |
| Funder list | Embedded in `weddings` | Small list, always loaded with wedding |
| Website content | Embedded in `weddings` | One-to-one, always loaded together |
| RSVP responses | Embedded in `guests` | Max ~10 per guest, always accessed with guest |
| Vendor payment schedule | Embedded in `vendors` | Max ~10, always accessed with vendor |
| Everything else | Separate collections | Queried independently, can grow large, need indexes |

## 4. Tenant Isolation — TenantContext

The most critical piece. Without Postgres RLS, tenant scoping lives in
application code. A `TenantContext` class wraps all database access and
auto-injects `weddingId` into every query.

```typescript
// lib/db/tenant-context.ts

class TenantContext {
  constructor(
    private weddingId: string,
    private userId: string,
    private role: WeddingRole,
    private eventScope: string[]  // only for event_coordinator
  ) {}

  // Every query method auto-scopes to this wedding
  async findEvents(filter = {}) {
    const scoped = { ...filter, weddingId: this.weddingId }
    // If event_coordinator, further restrict to their assigned events
    if (this.role === 'event_coordinator') {
      scoped._id = { $in: this.eventScope }
    }
    return Event.find(scoped).sort({ date: 1 })
  }

  async findGuests(filter = {}) {
    const scoped = { ...filter, weddingId: this.weddingId }
    if (this.role === 'event_coordinator') {
      // Coordinator sees only guests invited to their events
      scoped.eventIds = { $in: this.eventScope }
    }
    return Guest.find(scoped)
  }

  async createExpense(data) {
    return Expense.create({ ...data, weddingId: this.weddingId })
  }

  // ... similar methods for every collection
}
```

**Rules:**
- No direct `Model.find()` / `Model.create()` calls in route handlers or
  Server Actions. Everything goes through `TenantContext`.
- `TenantContext` is instantiated per-request from the NextAuth session +
  the user's `weddingMembers` record for their active wedding.
- Event Coordinators get additional scoping: they can only see/edit events
  in their `eventScope` and guests invited to those events.

**Helper to get tenant context in a Server Action / API route:**
```typescript
async function getTenantContext(): Promise<TenantContext> {
  const session = await auth()
  if (!session?.user) throw new AuthError('Not authenticated')

  const activeWeddingId = session.user.activeWeddingId
  const membership = await WeddingMember.findOne({
    weddingId: activeWeddingId,
    userId: session.user.id
  })
  if (!membership) throw new AuthError('No access to this wedding')

  return new TenantContext(
    activeWeddingId,
    session.user.id,
    membership.role,
    membership.eventScope
  )
}
```

## 5. Authentication Flow

### 5.1 NextAuth Configuration

NextAuth.js v5 with MongoDB adapter. Two providers at launch:
- **Google OAuth** — standard OAuth2 flow, zero cost
- **Email/password (Credentials)** — passwords hashed with bcrypt, stored
  in the `users` collection

Session strategy: **JWT** (not database sessions) — avoids a DB query per
request on the free tier. The JWT contains `userId` and `activeWeddingId`.

### 5.2 Identity Linking

Per PRD: if a user signs in with Google and later with email/password using
the same email, it should link to the same account. NextAuth handles this
via the `allowDangerousEmailAccountLinking` option on the email provider +
matching on verified email.

### 5.3 Active Wedding Switching

A user can belong to multiple weddings. The JWT stores `activeWeddingId`.
Switching weddings updates this in the JWT (via a Server Action that calls
`unstable_update` on the session).

### 5.4 Phone OTP (deferred)

When ready to add: install a custom NextAuth provider backed by
Twilio/MSG91. Existing auth flow doesn't change — it's additive.

## 6. Guest-Facing Access (No Auth)

Guests never log in. Three guest-facing surfaces:

### 6.1 Wedding Website — `/w/[slug]`
- Public by link. Server-rendered from `weddings.website` embedded content.
- No auth check. Slug lookup only.

### 6.2 RSVP — `/rsvp/[token]`
- Guest gets a unique link containing a token.
- Token looked up in `rsvpTokens` → resolves to `guestId`.
- Page shows only events this guest is invited to.
- Submitting updates `guests.rsvps` embedded array.
- Editable until `weddings.rsvpCutoffDate`.

### 6.3 Photo Gallery Upload — `/gallery/[eventId]`
- QR code at venue encodes this URL.
- No auth. Guest enters their name (free text), uploads photos.
- If `galleryModerationEnabled`, photos have `isApproved: false` until
  an organizer approves them.

### 6.4 Photo Gallery View
- Same URL, viewing mode. Anyone with the link can browse and download.

## 7. File Storage — Cloudinary

All file uploads go to Cloudinary. Three upload contexts:

| Upload | Source | Cloudinary folder | Auto-transform |
|---|---|---|---|
| Guest photos | Gallery upload page | `{weddingId}/gallery/{eventId}/` | Auto-optimize, generate thumbnail |
| Receipt photos | Budget expense form | `{weddingId}/receipts/` | Auto-optimize |
| Vendor contracts | Vendor form | `{weddingId}/contracts/` | None (preserve original) |
| Wedding cover photo | Wedding setup | `{weddingId}/cover` | Auto-resize to max 1200px |

**Upload flow (guest photos):**
1. Client requests a signed upload URL from a Server Action
2. Client uploads directly to Cloudinary (no file through our server)
3. On success, client sends the Cloudinary response to our API
4. API saves photo metadata to the `photos` collection

This keeps Vercel serverless function size/timeout limits irrelevant for
large photo uploads.

## 8. Notification Engine

One module: `lib/notifications/`. All reminders route through it.

### 8.1 Channel: Email (v1)
Via Resend. Email templates built with React Email (JSX → HTML).

### 8.2 Trigger Points
| Trigger | When | Recipient | Channel |
|---|---|---|---|
| RSVP reminder | Cron: X days before cutoff, guest hasn't responded | Guest (email) | Email |
| Task assigned | On assignment | Organizer (email) | Email |
| Task due soon | Cron: 1 day before due date | Assignee (email) | Email |
| Vendor payment due | Cron: 3 days before due date | Owner/Family Admin (email) | Email |
| Event tomorrow | Cron: 1 day before event | All invited guests + organizers | Email |

### 8.3 Cron Implementation
A single Vercel Cron Job runs daily (`/api/cron/daily-notifications`).
It queries across all weddings for:
- Guests with pending RSVPs approaching cutoff
- Tasks due tomorrow
- Vendor payments due in 3 days
- Events happening tomorrow

Deduplicates against `notifications` collection to avoid double-sends.

### 8.4 Future Channels (deferred)
SMS (Twilio/MSG91), WhatsApp Business API, push notifications — all
additive. The notification engine already abstracts the channel; adding
one means implementing a new sender, not restructuring.

## 9. Digital Invitations

### 9.1 Invite Card Generation
Uses `@vercel/og` (Satori) to render an HTML template to a PNG/image.

**Flow:**
1. Organizer picks a template from a small set (3-5 visual designs)
2. Template is populated with: couple's names, event name/date/time/venue
3. `@vercel/og` renders it server-side to an image
4. Image URL is shareable (served from a Next.js API route with caching)

### 9.2 QR Code for Gallery
Generated client-side using `qrcode` npm package. Encodes the
`/gallery/[eventId]` URL. Organizer can download/print it.

## 10. Project Structure

```
make-my-marriage/
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md              ← this document
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           ← auth guard + tenant context provider
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── events/
│   │   │   ├── tasks/
│   │   │   ├── budget/
│   │   │   ├── guests/
│   │   │   ├── vendors/
│   │   │   ├── invitations/
│   │   │   └── settings/
│   │   ├── w/[slug]/                ← public wedding website
│   │   │   └── page.tsx
│   │   ├── rsvp/[token]/            ← guest RSVP (no auth)
│   │   │   └── page.tsx
│   │   ├── gallery/[eventId]/       ← guest photo upload/view (no auth)
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  ← NextAuth API route
│   │   │   ├── invite/[token]/      ← redeem organizer invite
│   │   │   ├── upload/              ← Cloudinary signed upload URL
│   │   │   └── cron/
│   │   │       └── daily-notifications/route.ts
│   │   ├── layout.tsx               ← root layout
│   │   └── page.tsx                 ← landing page
│   ├── lib/
│   │   ├── db/
│   │   │   ├── connection.ts        ← MongoDB connection singleton
│   │   │   ├── models/
│   │   │   │   ├── user.ts
│   │   │   │   ├── wedding.ts
│   │   │   │   ├── wedding-member.ts
│   │   │   │   ├── event.ts
│   │   │   │   ├── guest.ts
│   │   │   │   ├── task.ts
│   │   │   │   ├── expense.ts
│   │   │   │   ├── vendor.ts
│   │   │   │   ├── photo.ts
│   │   │   │   ├── invite-token.ts
│   │   │   │   ├── rsvp-token.ts
│   │   │   │   └── notification.ts
│   │   │   └── tenant-context.ts    ← THE critical tenant-scoping layer
│   │   ├── auth/
│   │   │   └── config.ts            ← NextAuth config (providers, adapter, callbacks)
│   │   ├── services/
│   │   │   ├── wedding.service.ts
│   │   │   ├── event.service.ts
│   │   │   ├── guest.service.ts
│   │   │   ├── task.service.ts
│   │   │   ├── budget.service.ts
│   │   │   ├── vendor.service.ts
│   │   │   ├── rsvp.service.ts
│   │   │   ├── gallery.service.ts
│   │   │   └── invitation.service.ts
│   │   ├── notifications/
│   │   │   ├── engine.ts            ← dispatch: picks channel, deduplicates, logs
│   │   │   ├── channels/
│   │   │   │   └── email.ts         ← Resend sender
│   │   │   └── templates/           ← React Email templates
│   │   │       ├── rsvp-reminder.tsx
│   │   │       ├── task-assigned.tsx
│   │   │       ├── task-due.tsx
│   │   │       ├── payment-due.tsx
│   │   │       └── event-tomorrow.tsx
│   │   ├── cloudinary/
│   │   │   └── client.ts            ← upload helpers, signed URL generation
│   │   ├── invite-cards/
│   │   │   └── templates/           ← OG image templates for digital invitations
│   │   └── validations/
│   │       ├── wedding.schema.ts    ← zod schemas per domain
│   │       ├── event.schema.ts
│   │       ├── guest.schema.ts
│   │       └── ...
│   ├── components/
│   │   ├── ui/                      ← shadcn/ui components
│   │   ├── dashboard/               ← dashboard-specific components
│   │   ├── forms/                   ← reusable form components
│   │   └── wedding-website/         ← wedding website template components
│   └── middleware.ts                 ← NextAuth middleware (protect dashboard routes)
├── public/
├── .env.local                       ← secrets (Mongo URI, Cloudinary, Resend, Google OAuth)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 11. Security

### 11.1 Tenant Isolation
- All DB access via `TenantContext` — auto-injects `weddingId`.
- Event Coordinator scoping enforced in `TenantContext` methods.
- No direct Mongoose model calls in route handlers.

### 11.2 Auth
- Dashboard routes protected by NextAuth middleware (`middleware.ts`).
- JWT-based sessions — no session DB queries per request.
- CSRF protection built into NextAuth.
- Passwords hashed with bcrypt (NextAuth Credentials provider).

### 11.3 Guest Access
- RSVP tokens: unique per guest, URL-safe, not sequential.
- Invite tokens: single-use, 7-day TTL, auto-deleted by MongoDB TTL index.
- Gallery upload: no auth, but scoped to a specific event. Rate limiting
  on the upload endpoint to prevent abuse.

### 11.4 Input Validation
- All input validated with zod schemas before touching the database.
- Schemas defined in `lib/validations/` and reused across Server Actions
  and API routes.

### 11.5 DPDP Act Considerations
- Guest PII (phone, email, address) never exposed to other guests.
- Guest list never shown on the public wedding website.
- Event Coordinators see only guests assigned to their events.
- Photo uploads: guest name is optional free text, not linked to any account.
- Data deletion: Owners can delete their wedding, which cascades to all
  related data (events, guests, photos, etc.).

## 12. Deployment

### 12.1 Environment Variables
```
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/make-my-marriage
NEXTAUTH_SECRET=<random 32-char string>
NEXTAUTH_URL=https://makemymarriage.app  (or Vercel preview URL)
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
CLOUDINARY_CLOUD_NAME=<from Cloudinary dashboard>
CLOUDINARY_API_KEY=<from Cloudinary dashboard>
CLOUDINARY_API_SECRET=<from Cloudinary dashboard>
RESEND_API_KEY=<from Resend dashboard>
CRON_SECRET=<random string to verify cron requests>
```

### 12.2 Vercel Configuration
- Framework preset: Next.js (auto-detected)
- Build command: `next build`
- Cron job: `vercel.json` with cron schedule for daily notifications
- Preview deployments: automatic per git branch

### 12.3 MongoDB Atlas Setup
- Free M0 cluster (AWS Mumbai region for lowest latency to Indian users)
- Network access: allow Vercel's IP ranges (or 0.0.0.0/0 for serverless)
- Database user with readWrite permissions

## 13. Starter Checklist Template

The PRD requires a starter checklist. Stored as a static JSON file
in the codebase (`lib/data/checklist-template.json`), applied on demand.

Example tasks (~25 items):
- Book wedding venue
- Book photographer/videographer
- Hire caterer
- Order wedding outfits (bride)
- Order wedding outfits (groom)
- Book decorator/florist
- Book mehendi artist
- Book DJ/band
- Send save-the-date invitations
- Finalize guest list
- Send formal invitations
- Arrange priest/pandit
- Book mandap setup
- Arrange baraat logistics
- Plan sangeet performances
- Book hotel blocks for outstation guests
- Final venue walkthrough
- Confirm all vendor payments
- Prepare welcome bags/gifts

Each template task specifies a relative offset from the wedding start date
(e.g., "6 months before", "2 weeks before") used to auto-populate due dates.

## 14. UI / Design Direction

### 14.1 Overall Aesthetic
- **Clean modern SaaS** with warm accent colors — elegant, fits a wedding
  context without looking like a party invitation. Not generic corporate blue.
- Think: Notion-level cleanliness meets wedding warmth.

### 14.2 Responsive
- **Mobile-first.** Every page must work well on phone screens first, then
  scale up to tablet, laptop, and large desktop.
- Dashboard uses a collapsible sidebar on desktop, bottom nav on mobile.

### 14.3 Dark Mode
- Supported. Respects system preference by default (`prefers-color-scheme`),
  with a manual toggle in settings/header.
- Use Tailwind's `dark:` variant. shadcn/ui supports dark mode natively.

### 14.4 Landing Page
- Yes, build one at `app/page.tsx`.
- Content: hero with tagline + CTA, feature showcase (4-6 feature cards
  highlighting the main capabilities), "How it works" section, final CTA.
- No pricing section yet (product is free for now).

### 14.5 Template Designs
- **Wedding website templates:** 3 visual themes to start — one minimal/modern,
  one traditional/ornate, one photo-heavy. All responsive, all support dark mode.
- **Digital invitation card templates:** 3-5 designs — clean, floral, traditional,
  minimalist, elegant. Generated server-side via `@vercel/og`.
- **Email templates:** Clean, branded, minimal. Match the app's visual identity.

### 14.6 Color System
- Primary: warm rose/blush tone (wedding-appropriate, gender-neutral)
- Accent: gold/amber for highlights
- Neutrals: slate grays
- Semantic: green for success, red for destructive actions, amber for warnings
- All colors defined as CSS variables in Tailwind config for easy theming.

## 15. Edge Case Defaults

Decisions for behaviors not explicitly covered in the PRD. These are the
defaults to implement — the user will course-correct if they want different
behavior after seeing the running app.

| Scenario | Default behavior |
|---|---|
| Guest visits RSVP link after cutoff | Show read-only view of their responses + "RSVP is closed" message |
| Organizer deletes an event with guests assigned | Warn with count of affected guests, require confirmation. On confirm: remove event from all guests' `eventIds`, delete associated tasks, photos, RSVPs for that event |
| CSV import with bad rows | Import valid rows, skip bad ones, show a summary: "Imported 45 of 50 guests. 5 skipped:" with reasons per row |
| Wedding slug collision | Auto-suggest with numeric suffix: "riya-arjun-2". User can edit before confirming |
| Organizer with no email assigned a task | Skip the notification silently (log it). Don't block the assignment |
| Wedding deletion | Cascade delete all related data. Cloudinary assets: queue a background cleanup (best-effort, don't block the UI) |
| RSVP token for a deleted guest | Show "This invitation is no longer valid" |
| Expired invite token | Show "This invite has expired. Ask the wedding organizer for a new link" |
| Gallery upload when moderation is on | Show "Your photo has been uploaded and will be visible after approval" toast |
| Empty dashboard (new wedding, no events yet) | Show an empty state with a friendly illustration and "Add your first event" CTA |

## 16. Implementation Notes for Fresh Sessions

This section exists so that a new Claude session (without the original
conversation context) can pick up and build the product from these docs alone.

### 16.1 What to read first
1. `docs/PRD.md` — all features, fields, behaviors
2. `docs/ARCHITECTURE.md` (this file) — stack, data model, patterns, UI direction

### 16.2 Implementation order within each phase

**Phase 1 (Foundation) — build in this order:**
1. `npx create-next-app` with TypeScript + Tailwind + App Router
2. Install and configure shadcn/ui
3. MongoDB connection singleton (`lib/db/connection.ts`)
4. Mongoose models — `users`, `weddings`, `weddingMembers`, `events`, `inviteTokens`
5. NextAuth config (Google + Credentials providers, MongoDB adapter, JWT strategy)
6. `middleware.ts` — protect `(dashboard)` routes
7. TenantContext class (`lib/db/tenant-context.ts`)
8. Auth pages (login, signup)
9. Wedding creation flow (name, date range, slug generation)
10. Events CRUD (add/edit/remove, sorted by date)
11. Organizer invite flow (generate link, redeem link)
12. Revoke organizer access
13. Multi-wedding switcher
14. Dashboard shell (events list, countdown, placeholder cards)
15. Landing page

**Phase 2 (Core Planning) — build in this order:**
1. Models: `tasks`, `expenses`, `vendors`
2. Task CRUD + done/not-done toggle + event/assignee linking
3. Checklist template data file + "apply template" action
4. Budget: expense CRUD, category aggregation view
5. Budget: contribution tracking (funder tagging, totals)
6. Vendor CRUD with embedded payment schedule
7. Vendor payment → auto-create linked expense
8. Cloudinary setup for receipt photos + vendor contract uploads

**Phase 3 (Guest Experience) — build in this order:**
1. Models: `guests`, `rsvpTokens`
2. Guest CRUD + event assignment
3. CSV import with column mapping
4. RSVP token generation per guest
5. RSVP page (public, token-based, per-event yes/no + "attend all" shortcut)
6. Digital invitation card generation (`@vercel/og` templates)
7. Notification engine (`lib/notifications/`) + Resend integration
8. Daily cron job for reminders
9. Email templates (React Email)

**Phase 4 (Public Presence) — build in this order:**
1. Models: `photos`
2. Wedding website template engine + 3 templates
3. Wedding website page (`/w/[slug]`)
4. Photo gallery: Cloudinary upload flow + metadata storage
5. QR code generation for gallery links
6. Gallery upload page (public, no auth)
7. Gallery view page with thumbnail grid
8. Moderation toggle + approval flow
9. Live streaming embed section on wedding website

### 16.3 Key constraints to remember
- **Never call Mongoose models directly in route handlers.** Always go
  through TenantContext for tenant-scoped data.
- **No git commits to main/master.** Always feature branches.
- **No commits without explicit user instruction.**
- **Don't do unsolicited refactors.** Build exactly what's specced.
- **All free-tier services.** Don't introduce paid dependencies.
- **Phone OTP is deferred.** Don't implement it.
- **User has full creative freedom delegated for UI.** Make it look good.

## 17. Verification Plan

After implementing each phase, verify end-to-end:

**Phase 1 (Foundation):**
- Sign up via Google and email/password
- Create a wedding, verify slug is generated
- Add events, verify sort by date
- Generate invite link, open in incognito, redeem as a different user
- Verify the new user sees only their scoped events (if Coordinator)
- Revoke access, verify immediate denial on next request
- Switch between weddings

**Phase 2 (Core Planning):**
- Create tasks, assign to organizer, verify notification on assignment
- Apply checklist template, verify tasks with correct due dates
- Add expenses, verify budget-vs-actual aggregation
- Add vendor with payment schedule, mark a payment paid, verify linked expense auto-created
- Tag expenses with funders, verify contribution totals

**Phase 3 (Guest Experience):**
- Add guests, assign to events
- Bulk CSV import
- Generate RSVP link, open in incognito, submit RSVP
- Verify "attending everything" shortcut
- Verify dietary notes captured per event
- Re-visit RSVP link, change response
- Verify RSVP cutoff enforcement
- Generate invite card image, verify rendering
- Trigger daily cron, verify RSVP reminder email sent

**Phase 4 (Public Presence):**
- Enable wedding website, fill content, visit /w/[slug]
- Verify sections toggle on/off
- Generate QR code for an event, scan with phone
- Upload photos via gallery page (no login)
- Verify thumbnail auto-generated
- Toggle moderation on, upload, verify photo is not visible until approved
- Set a livestream URL, verify embed renders on website

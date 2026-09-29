# Make My Marriage — API Design

## 1. Two API Surfaces

| Surface | Used by | Auth | Pattern |
|---|---|---|---|
| **Server Actions** | Organizer dashboard (web app) | NextAuth session + TenantContext | `'use server'` functions in `lib/actions/` |
| **REST API routes** | Guest pages, cron, upload signing | Token-based or none | `app/api/` route handlers |

Server Actions handle all organizer mutations. REST routes exist only where
Server Actions can't be used (public guest pages, external callbacks, cron).

## 2. Common Patterns

### 2.1 Server Action Wrapper

Every Server Action follows this pattern:

```typescript
'use server'
import { getTenantContext } from '@/lib/db/tenant-context'
import { actionClient } from '@/lib/actions/safe-action'
import { createEventSchema } from '@/lib/validations/event.schema'

export const createEvent = actionClient
  .schema(createEventSchema)
  .action(async ({ parsedInput }) => {
    const ctx = await getTenantContext()
    // ... business logic via ctx
    return { success: true, data: event }
  })
```

**`actionClient`** is a thin wrapper (using `next-safe-action` or hand-rolled)
that provides:
- Zod input validation (rejects before the handler runs)
- Consistent error shape
- `revalidatePath` after mutations

### 2.2 Error Shape

All actions and routes return this shape on error:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode }

type ErrorCode =
  | 'UNAUTHORIZED'       // not logged in
  | 'FORBIDDEN'          // logged in but wrong role / not in this wedding
  | 'NOT_FOUND'          // resource doesn't exist (in this wedding)
  | 'VALIDATION_ERROR'   // zod rejected the input
  | 'CONFLICT'           // duplicate slug, already-used token, etc.
  | 'CUTOFF_PASSED'      // RSVP past cutoff date
  | 'RATE_LIMITED'       // too many requests (gallery upload)
  | 'SERVER_ERROR'       // unexpected
```

### 2.3 Role Requirement Notation

Actions specify which roles can call them:

| Notation | Meaning |
|---|---|
| `owner` | Only Owners |
| `owner, family_admin` | Owners or Family Admins |
| `any_member` | Any wedding member (incl. Event Coordinators, scoped) |
| `public` | No auth required |
| `cron` | Internal, verified by CRON_SECRET header |

### 2.4 Pagination

List actions that can return large datasets accept optional pagination params:

```typescript
{ page?: number, limit?: number }  // defaults: page=1, limit=50
```

**Actions that support pagination:**
- `listGuests` — up to 500 guests per wedding
- `listExpenses` — up to 200 expenses per wedding
- `listTasks` — up to 100 tasks per wedding
- `listPhotos` — potentially 1000+ per event

**Actions that return all (small datasets):**
- `listEvents` — max ~10 per wedding
- `listVendors` — max ~20 per wedding
- `listMembers` — max ~10 per wedding
- `listInviteTokens` — max ~20 outstanding

Paginated responses include:
```typescript
{ data: T[], total: number, page: number, totalPages: number }
```

### 2.5 Revalidation

After every mutation, the Server Action calls `revalidatePath` for the
affected dashboard page so Server Components re-fetch fresh data.

## 3. Auth Actions

File: `lib/actions/auth.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `signUpWithCredentials` | `{ name, email, password, phone? }` | public | `{ userId }` | Creates user, hashes password with bcrypt |
| `forgotPassword` | `{ email }` | public | `{ success }` | Always returns success (don't reveal if email exists). If user found, sends a password reset email via Resend with a signed JWT token (expires 1 hour) |
| `resetPassword` | `{ token, newPassword }` | public | `{ success }` | Verifies JWT token, hashes new password, updates user. Invalidates all existing sessions for this user |
| `changePassword` | `{ currentPassword, newPassword }` | any logged-in user | `{ success }` | Verifies current password matches, then updates. Only for Credentials users (Google-only users don't have a password) |
| `updateProfile` | `{ name?, phone?, image? }` | any logged-in user | `{ user }` | Updates current user's profile |
| `switchActiveWedding` | `{ weddingId }` | any logged-in user | `{ success }` | Updates JWT `activeWeddingId`. Verifies user is a member of the target wedding |
| `deleteAccount` | `{}` | any logged-in user | `{ success }` | Deletes user + all their weddingMember records. Does NOT delete weddings they own (must transfer or delete those first) |

**Zod schemas:**

```typescript
const signUpSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
})

const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
})

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).max(128),
})

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
})

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  image: z.string().url().optional(),
})
```

## 4. Wedding Actions

File: `lib/actions/wedding.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `createWedding` | `{ name, startDate, endDate, coverPhoto? }` | any logged-in user | `{ wedding }` | Auto-generates slug, seeds default budgetCategories + funders, creates weddingMember (owner, invitedBy: self) |
| `updateWedding` | `{ name?, slug?, startDate?, endDate?, coverPhoto?, rsvpCutoffDate?, galleryModerationEnabled? }` | owner, family_admin | `{ wedding }` | Slug change triggers uniqueness check |
| `deleteWedding` | `{}` | owner | `{ success }` | Cascades per DATABASE_DESIGN.md Section 4 |
| `getMyWeddings` | `{}` | any logged-in user | `{ weddings[] }` | Returns all weddings where user is a member, with role |
| `getWedding` | `{}` | any_member | `{ wedding }` | Full wedding doc (incl. embedded website, budgetCategories, funders, settings). Uses activeWeddingId from session. Needed by settings page, website editor, budget config |
| `getDashboardData` | `{}` | any_member | see below | Aggregated dashboard summary. Event Coordinators see scoped data only |

**`getDashboardData` return shape:**
```typescript
{
  wedding: { name, slug, startDate, endDate, daysUntilStart },
  events: Event[],                    // upcoming, sorted by date (scoped for coordinators)
  taskSummary: {
    total: number,
    pending: number,
    overdue: number,                  // due date passed, not done
  },
  budgetSummary: {                    // null for event_coordinators (no budget access)
    totalSpent: number,
    topCategories: { key, label, actual, target }[],  // top 3 by spend
  } | null,
  guestSummary: {
    totalGuests: number,
    totalResponded: number,
    totalAttending: number,           // guests with at least one attending=true RSVP
    totalHeadcount: number,           // sum of all headcounts across all events
  },
  upcomingPayments: {                 // null for event_coordinators
    vendor: string,
    label: string,
    amount: number,
    dueDate: Date,
  }[] | null,                         // next 3 unpaid vendor payments by due date
}

**Zod schemas:**

```typescript
const createWeddingSchema = z.object({
  name: z.string().trim().min(2).max(200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  coverPhoto: z.string().url().optional(),
}).refine(d => d.endDate >= d.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
})

const updateWeddingSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  slug: z.string().trim().min(2).max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  coverPhoto: z.string().url().nullable().optional(),
  rsvpCutoffDate: z.coerce.date().nullable().optional(),
  galleryModerationEnabled: z.boolean().optional(),
})
```

## 5. Event Actions

File: `lib/actions/event.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `createEvent` | `{ name, date, startTime?, endTime?, venue?, eventType, notes?, dressCode? }` | owner, family_admin | `{ event }` | |
| `updateEvent` | `{ eventId, ...fields }` | owner, family_admin | `{ event }` | |
| `deleteEvent` | `{ eventId }` | owner, family_admin | `{ success, affectedGuests }` | Returns count of affected guests before deleting. Cascades per DB doc |
| `listEvents` | `{}` | any_member | `{ events[] }` | Coordinators see only their scoped events. Each event includes `guestCount` (invited) and `confirmedCount` (RSVP yes) |
| `getEvent` | `{ eventId }` | any_member | `{ event, guestCount, confirmedCount, headcount }` | Coordinators: only if eventId is in their scope. Includes full RSVP stats for this event |

**Zod schemas:**

```typescript
const createEventSchema = z.object({
  name: z.string().trim().min(1).max(200),
  date: z.coerce.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  venue: z.string().trim().max(500).optional(),
  eventType: z.enum(['haldi', 'mehendi', 'sangeet', 'wedding', 'reception', 'other']),
  notes: z.string().max(2000).optional(),
  dressCode: z.string().max(200).optional(),
})

const updateEventSchema = z.object({
  eventId: z.string(),
  ...createEventSchema.partial().shape,
})
```

## 6. Organizer / Member Actions

File: `lib/actions/member.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `generateInviteLink` | `{ role, eventScope? }` | owner, family_admin | `{ token, url, expiresAt }` | Creates inviteToken, returns shareable URL |
| `listInviteTokens` | `{}` | owner, family_admin | `{ tokens[] }` | All invite tokens for this wedding — pending (unused, not expired), redeemed (usedBy populated), and expired. Organizer can see which invites are outstanding |
| `revokeInviteToken` | `{ tokenId }` | owner, family_admin | `{ success }` | Deletes an unused invite token (can't revoke already-redeemed ones — use revokeMember instead) |
| `listMembers` | `{}` | owner, family_admin | `{ members[] }` | Members with populated user name/email/image and their role |
| `updateMemberRole` | `{ memberId, role, eventScope? }` | owner, family_admin | `{ member }` | Change a member's role. Only owners can promote to owner. eventScope required if changing to event_coordinator. Can't change your own role |
| `revokeMember` | `{ memberId }` | owner, family_admin | `{ success }` | Can't revoke yourself. Can't revoke another owner unless you're an owner. Deletes weddingMember record |

**Zod schemas:**

```typescript
const generateInviteLinkSchema = z.object({
  role: z.enum(['owner', 'family_admin', 'event_coordinator']),
  eventScope: z.array(z.string()).optional(),
}).refine(d => {
  if (d.role === 'event_coordinator') return d.eventScope && d.eventScope.length > 0
  return true
}, { message: 'Event coordinators need at least one event', path: ['eventScope'] })
```

## 7. Task Actions

File: `lib/actions/task.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `createTask` | `{ title, description?, dueDate?, assigneeId?, eventId? }` | owner, family_admin | `{ task }` | If assigneeId provided, triggers notification |
| `updateTask` | `{ taskId, ...fields }` | any_member | `{ task }` | Coordinators: only if task's eventId is in their scope (or task is unscoped) |
| `toggleTaskDone` | `{ taskId }` | any_member | `{ task }` | Flips isDone. Scoped for coordinators |
| `deleteTask` | `{ taskId }` | owner, family_admin | `{ success }` | |
| `listTasks` | `{ filter?: { isDone?, eventId?, assigneeId? } }` | any_member | `{ tasks[] }` | Coordinators see only tasks for their events |
| `applyChecklistTemplate` | `{}` | owner, family_admin | `{ tasks[] }` | Bulk-inserts tasks from checklist-template.json with calculated due dates |

**Zod schemas:**

```typescript
const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().max(2000).optional(),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().optional(),
  eventId: z.string().optional(),
})

const listTasksFilterSchema = z.object({
  isDone: z.boolean().optional(),
  eventId: z.string().optional(),
  assigneeId: z.string().optional(),
})

const listGuestsFilterSchema = z.object({
  side: z.enum(['bride', 'groom', 'joint']).optional(),
  eventId: z.string().optional(),
  hasResponded: z.boolean().optional(),
  search: z.string().trim().max(100).optional(),
})

const bulkAssignEventSchema = z.object({
  guestIds: z.array(z.string()).min(1),
  eventId: z.string(),
  action: z.enum(['add', 'remove']),
})
```

## 8. Budget / Expense Actions

File: `lib/actions/budget.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `createExpense` | `{ amount, category, date, vendorId?, paymentMethod?, funder?, notes?, receiptPhoto? }` | owner, family_admin | `{ expense }` | |
| `updateExpense` | `{ expenseId, ...fields }` | owner, family_admin | `{ expense }` | |
| `deleteExpense` | `{ expenseId }` | owner, family_admin | `{ success }` | If vendor-linked, also clears the vendor payment's `linkedExpenseId` and `isPaid` |
| `listExpenses` | `{ filter?: { category?, funder?, vendorId? } }` | owner, family_admin | `{ expenses[] }` | Coordinators: FORBIDDEN (budget is never visible to coordinators) |
| `getBudgetSummary` | `{}` | owner, family_admin | `{ byCategory[], byFunder[], total }` | Aggregation pipeline results merged with category targets |
| `updateBudgetCategories` | `{ categories: { key, label, target? }[] }` | owner, family_admin | `{ wedding }` | Replaces the embedded budgetCategories array |
| `updateFunders` | `{ funders: { key, label }[] }` | owner, family_admin | `{ wedding }` | Replaces the embedded funders array |

**Zod schemas:**

```typescript
const createExpenseSchema = z.object({
  amount: z.number().min(0),
  category: z.string().trim().min(1).max(50),
  date: z.coerce.date(),
  vendorId: z.string().optional(),
  paymentMethod: z.string().trim().max(50).optional(),
  funder: z.string().trim().max(50).optional(),
  notes: z.string().max(1000).optional(),
  receiptPhoto: z.string().url().optional(),
})
```

## 9. Vendor Actions

File: `lib/actions/vendor.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `createVendor` | `{ name, category, phone?, email?, notes?, contractFile?, eventIds? }` | owner, family_admin | `{ vendor }` | |
| `updateVendor` | `{ vendorId, ...fields }` | owner, family_admin | `{ vendor }` | |
| `deleteVendor` | `{ vendorId }` | owner, family_admin | `{ success }` | Unlinks related expenses (sets `vendorId = null` on matching expenses, preserving the expense records). Does NOT delete expenses — the money was still spent |
| `listVendors` | `{ filter?: { category? } }` | owner, family_admin | `{ vendors[] }` | With virtual fields (totalPaid, totalOutstanding) |
| `getVendor` | `{ vendorId }` | owner, family_admin | `{ vendor }` | Full detail with payment schedule |
| `addPayment` | `{ vendorId, label, amount, dueDate? }` | owner, family_admin | `{ vendor }` | Pushes to embedded payments array |
| `markPaymentPaid` | `{ vendorId, paymentId }` | owner, family_admin | `{ vendor, expense }` | Sets isPaid=true, auto-creates linked expense |
| `undoPaymentPaid` | `{ vendorId, paymentId }` | owner, family_admin | `{ vendor }` | Sets isPaid=false, deletes linked expense |
| `removePayment` | `{ vendorId, paymentId }` | owner, family_admin | `{ vendor }` | Pulls from array. If was paid, also deletes linked expense |

**Zod schemas:**

```typescript
const createVendorSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(50),
  phone: z.string().max(15).optional(),
  email: z.string().email().max(255).optional(),
  notes: z.string().max(2000).optional(),
  contractFile: z.string().url().optional(),
  eventIds: z.array(z.string()).optional(),
})

const addPaymentSchema = z.object({
  vendorId: z.string(),
  label: z.string().trim().min(1).max(100),
  amount: z.number().min(0),
  dueDate: z.coerce.date().optional(),
})
```

## 10. Guest Actions

File: `lib/actions/guest.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `createGuest` | `{ name, phone?, email?, relation?, side, plusOnesAllowed?, eventIds }` | owner, family_admin | `{ guest, rsvpToken }` | Auto-creates rsvpToken, initializes empty rsvps for each event |
| `updateGuest` | `{ guestId, ...fields }` | owner, family_admin | `{ guest }` | If eventIds change, syncs rsvps array |
| `deleteGuest` | `{ guestId }` | owner, family_admin | `{ success }` | Also deletes rsvpToken |
| `listGuests` | `{ filter?: { side?, eventId?, hasResponded?, search? } }` | any_member | `{ guests[] }` | Coordinators see only guests for their events. `search` does case-insensitive regex on name/phone/email |
| `getGuest` | `{ guestId }` | any_member | `{ guest, rsvpUrl }` | Scoped for coordinators |
| `importGuestsCSV` | `{ csvData, columnMapping }` | owner, family_admin | `{ imported, skipped, errors[] }` | Validates rows, creates guests + rsvpTokens in bulk |
| `getRsvpSummary` | `{}` | owner, family_admin | `{ perEvent[], overall }` | Aggregated RSVP stats |
| `getGuestRsvpLink` | `{ guestId }` | owner, family_admin | `{ url }` | Returns the shareable RSVP link for this guest |
| `bulkAssignEvent` | `{ guestIds, eventId, action: 'add' \| 'remove' }` | owner, family_admin | `{ updated }` | Add/remove an event from multiple guests at once. Syncs rsvps arrays. Essential when a new event is created and existing guests need to be invited |

**Zod schemas:**

```typescript
const createGuestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  email: z.string().email().max(255).optional(),
  relation: z.string().trim().max(100).optional(),
  side: z.enum(['bride', 'groom', 'joint']),
  plusOnesAllowed: z.number().min(0).max(20).default(0),
  eventIds: z.array(z.string()).min(1),
})

const importGuestsSchema = z.object({
  csvData: z.string(),
  columnMapping: z.record(z.string(), z.string()),
})
```

## 11. Invitation Actions

File: `lib/actions/invitation.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `getInviteCardUrl` | `{ eventId, templateId }` | owner, family_admin | `{ imageUrl }` | Returns URL to the OG image route for this event + template |
| `listTemplates` | `{}` | owner, family_admin | `{ templates[] }` | Returns available invite card templates |

The actual invite card image is generated by an API route (Section 14), not
a Server Action, because it returns an image response, not JSON.

## 12. Wedding Website Actions

File: `lib/actions/website.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `updateWebsiteContent` | `{ sections }` | owner, family_admin | `{ wedding }` | Partial update of wedding.website.sections |
| `setWebsiteTemplate` | `{ templateId }` | owner, family_admin | `{ wedding }` | |
| `publishWebsite` | `{}` | owner, family_admin | `{ wedding }` | Sets isPublished = true |
| `unpublishWebsite` | `{}` | owner, family_admin | `{ wedding }` | Sets isPublished = false |
| `getWebsitePreviewUrl` | `{}` | owner, family_admin | `{ url }` | Returns a URL like `/w/[slug]?preview=true`. The wedding website page checks: if `preview=true` AND the viewer is an authenticated organizer of this wedding, show the site even if unpublished. Otherwise, 404 for unpublished sites |

**Zod schemas:**

```typescript
const updateWebsiteContentSchema = z.object({
  sections: z.object({
    story: z.object({
      enabled: z.boolean(), content: z.string().max(5000),
    }).partial().optional(),
    schedule: z.object({ enabled: z.boolean() }).partial().optional(),
    venue: z.object({ enabled: z.boolean() }).partial().optional(),
    registry: z.object({
      enabled: z.boolean(), content: z.string().max(2000),
    }).partial().optional(),
    faq: z.object({
      enabled: z.boolean(),
      items: z.array(z.object({
        q: z.string().max(500), a: z.string().max(2000),
      })),
    }).partial().optional(),
    gallery: z.object({ enabled: z.boolean() }).partial().optional(),
    livestream: z.object({
      enabled: z.boolean(), embedUrl: z.string().url().max(500).nullable(),
    }).partial().optional(),
  }),
})
```

## 13. Gallery / Photo Actions

File: `lib/actions/gallery.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `listPhotos` | `{ eventId, onlyPending? }` | any_member | `{ photos[] }` | Coordinators: only their events. `onlyPending` = moderation queue |
| `approvePhoto` | `{ photoId }` | owner, family_admin | `{ photo }` | Sets isApproved = true |
| `rejectPhoto` | `{ photoId }` | owner, family_admin | `{ success }` | Deletes photo doc + Cloudinary asset |
| `deletePhoto` | `{ photoId }` | owner, family_admin | `{ success }` | Same as reject — deletes from DB + Cloudinary |
| `getGalleryQrCode` | `{ eventId }` | any_member | `{ qrDataUrl }` | Returns base64 QR code image encoding the gallery URL |

Photo **upload** itself happens via the REST API (Section 14) because guests
upload without auth and the Cloudinary signed-upload flow needs a REST endpoint.

## 14. REST API Routes

These are the only HTTP endpoints outside of Server Actions.

### 14.1 Auth (managed by NextAuth)

```
GET/POST /api/auth/[...nextauth]
```
Handled entirely by NextAuth. Covers Google OAuth callback, credentials
sign-in, session management, CSRF.

### 14.2 Invite Token Redemption

```
POST /api/invite/[token]
```

| Field | Value |
|---|---|
| Auth | Must be logged in (NextAuth session) |
| Path param | `token` — the invite token string |
| Body | none |
| Success | `{ success: true, weddingId, role }` |
| Errors | `NOT_FOUND` (invalid/expired/used token), `CONFLICT` (already a member) |

**Flow:**
1. Look up inviteToken by `token` param
2. Verify not used, not expired
3. Verify current user isn't already a member of this wedding
4. Create weddingMember record
5. Mark token as used (`usedBy`, `usedAt`)
6. Return weddingId so the client can switch to it

### 14.3 RSVP Submission

```
GET /api/rsvp/[token]
POST /api/rsvp/[token]
```

| Field | Value |
|---|---|
| Auth | None (public, token-based) |
| Path param | `token` — the RSVP token string |
| GET response | `{ guest: { name, eventIds }, events[], rsvps[], isClosed }` |
| POST body | `{ rsvps: [{ eventId, attending, headcount, dietaryNote? }] }` |
| POST success | `{ success: true }` |
| Errors | `NOT_FOUND` (invalid token / deleted guest), `CUTOFF_PASSED` |

**GET:** Returns the guest's name, their invited events (with names/dates),
current RSVP state, and whether the cutoff has passed (read-only mode).

**POST:** Validates each RSVP entry, checks headcount ≤ plusOnesAllowed + 1,
checks cutoff not passed, updates guest.rsvps + rsvpRespondedAt.

**Zod schema:**

```typescript
const submitRsvpSchema = z.object({
  rsvps: z.array(z.object({
    eventId: z.string(),
    attending: z.boolean(),
    headcount: z.number().min(1).max(21),
    dietaryNote: z.string().max(500).optional(),
  })),
})
```

### 14.4 Cloudinary Upload Signing

```
POST /api/upload/sign
```

| Field | Value |
|---|---|
| Auth | Varies — see below |
| Body | `{ context: 'gallery' \| 'receipt' \| 'contract' \| 'cover', eventId? }` |
| Success | `{ signature, timestamp, cloudName, apiKey, folder }` |

**Auth rules by context:**
- `gallery` — no auth (guest upload). Requires `eventId`. Rate-limited: max 20 uploads per IP per hour.
- `receipt`, `contract`, `cover` — requires NextAuth session + TenantContext (organizer only).

Returns a Cloudinary signed upload params object. The client uploads directly
to Cloudinary using these params. After upload, the client calls a Server
Action (`confirmGalleryUpload` or the relevant organizer action) with the
Cloudinary response to save metadata.

### 14.5 Gallery Upload Confirmation (Guest)

```
POST /api/gallery/[eventId]/confirm
```

| Field | Value |
|---|---|
| Auth | None (public, part of guest gallery flow) |
| Path param | `eventId` |
| Body | `{ cloudinaryPublicId, url, thumbnailUrl, uploadedBy? }` |
| Success | `{ success: true, photoId }` |
| Errors | `NOT_FOUND` (eventId doesn't exist), `RATE_LIMITED` |

**Flow:**
1. Verify eventId exists and get the wedding
2. Create photo document. If `wedding.galleryModerationEnabled`, set `isApproved = false`
3. Return photoId

**Zod schema:**

```typescript
const confirmGalleryUploadSchema = z.object({
  cloudinaryPublicId: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url(),
  uploadedBy: z.string().trim().max(100).optional(),
})
```

### 14.6 Public Gallery Listing

```
GET /api/gallery/[eventId]
```

| Field | Value |
|---|---|
| Auth | None (public — same audience as the wedding website) |
| Path param | `eventId` |
| Query params | `page` (default 1), `limit` (default 50, max 100) |
| Success | `{ photos[], total, page, totalPages, eventName, weddingName }` |
| Errors | `NOT_FOUND` (eventId doesn't exist) |

Returns only approved photos (`isApproved: true`), newest first. This is the
public-facing gallery view — separate from `listPhotos` Server Action which
is for organizers and includes pending/unapproved photos.

**Why a REST route:** The gallery page (`/gallery/[eventId]`) is a public page
with no auth. Server Actions require either a session or a token. A public
Server Component could query the DB directly, but pagination is cleaner as
a REST endpoint the client can paginate through.

### 14.7 Invite Preview Page

```
GET /api/invite/[token]
```

| Field | Value |
|---|---|
| Auth | None (page must be viewable before login — user might not have an account yet) |
| Path param | `token` — the invite token string |
| Success | `{ weddingName, role, eventNames[], createdByName, expiresAt, isExpired, isUsed }` |
| Errors | `NOT_FOUND` (token doesn't exist at all) |

**Flow:** When an organizer shares an invite link, the invitee lands on
`/invite/[token]` which calls this GET to show "You've been invited to
Riya & Arjun's Wedding as a Family Admin." The page then prompts them to
log in / sign up and accept. Acceptance triggers `POST /api/invite/[token]`
(which requires auth).

**Security:** Returns wedding name and role only — no PII, no guest lists,
no budget data. Safe to expose without auth.

### 14.8 Digital Invite Card Image

```
GET /api/invite-card/[eventId]?template=minimal
```

| Field | Value |
|---|---|
| Auth | None (public, image is shareable) |
| Path param | `eventId` |
| Query param | `template` — template ID (default: 'minimal') |
| Response | PNG image (via `@vercel/og` / ImageResponse) |
| Cache | `Cache-Control: public, max-age=3600, s-maxage=86400` |

Renders the invite card template with: couple names (from wedding),
event name/date/time/venue. Returns an image suitable for sharing on
WhatsApp/social media.

### 14.7 Wedding Website

```
GET /w/[slug]
```

This is a **Next.js page route**, not an API route, but listed here for
completeness since it's public-facing. Server Component that fetches
wedding data by slug and renders the selected template. Returns 404 if
slug doesn't exist or website isn't published.

### 14.8 Daily Cron Job

```
GET /api/cron/daily-notifications
```

| Field | Value |
|---|---|
| Auth | `Authorization: Bearer ${CRON_SECRET}` header |
| Trigger | Vercel Cron, daily |
| Response | `{ sent: number, skipped: number, failed: number }` |

**Vercel config (`vercel.json`):**
```json
{
  "crons": [{
    "path": "/api/cron/daily-notifications",
    "schedule": "30 8 * * *"
  }]
}
```

Runs at 8:30 AM IST daily. Queries across all weddings for pending
notifications (see DATABASE_DESIGN.md Section 3.4), deduplicates, sends
via Resend, logs to notifications collection.

## 15. Settings Actions

File: `lib/actions/settings.actions.ts`

| Action | Input | Auth | Returns | Notes |
|---|---|---|---|---|
| `getWeddingSettings` | `{}` | owner, family_admin | `{ settings }` | Returns rsvpCutoffDate, galleryModerationEnabled, slug, website.isPublished |
| `updateWeddingSettings` | `{ ...fields }` | owner, family_admin | `{ wedding }` | Delegates to `updateWedding` action |

## 16. File Organization

```
src/lib/
├── actions/
│   ├── safe-action.ts         ← actionClient wrapper (validation + error handling)
│   ├── auth.actions.ts
│   ├── wedding.actions.ts
│   ├── event.actions.ts
│   ├── member.actions.ts
│   ├── task.actions.ts
│   ├── budget.actions.ts
│   ├── vendor.actions.ts
│   ├── guest.actions.ts
│   ├── invitation.actions.ts
│   ├── website.actions.ts
│   ├── gallery.actions.ts
│   └── settings.actions.ts
├── validations/
│   ├── auth.schema.ts
│   ├── wedding.schema.ts
│   ├── event.schema.ts
│   ├── member.schema.ts
│   ├── task.schema.ts
│   ├── budget.schema.ts
│   ├── vendor.schema.ts
│   ├── guest.schema.ts
│   ├── website.schema.ts
│   └── rsvp.schema.ts
└── ...

src/app/api/
├── auth/[...nextauth]/route.ts
├── invite/[token]/route.ts         ← GET (preview) + POST (accept)
├── rsvp/[token]/route.ts           ← GET (load) + POST (submit)
├── upload/sign/route.ts
├── gallery/[eventId]/
│   ├── route.ts                    ← GET (public photo listing)
│   └── confirm/route.ts            ← POST (guest upload confirmation)
├── invite-card/[eventId]/route.ts  ← GET (OG image)
└── cron/daily-notifications/route.ts
```

## 17. Rate Limiting

For public endpoints that could be abused:

| Endpoint | Limit | Method |
|---|---|---|
| `POST /api/upload/sign` (gallery context) | 20 per IP per hour | In-memory Map (resets on cold start; good enough for v1) |
| `POST /api/gallery/[eventId]/confirm` | 20 per IP per hour | Same |
| `POST /api/rsvp/[token]` | 10 per token per hour | Same |
| `GET /api/gallery/[eventId]` | 60 per IP per minute | Same (public gallery browsing) |

Implementation: simple in-memory rate limiter in `lib/rate-limit.ts`:

```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}
```

Resets on Vercel cold starts. Not persistent, not distributed — but
sufficient for v1 abuse prevention.

## 18. Action-to-Page Mapping

Which pages call which actions (helps trace the full request path):

| Page | Actions used |
|---|---|
| `/login`, `/signup` | `signUpWithCredentials` (signup only; login is NextAuth built-in) |
| `/forgot-password` | `forgotPassword` |
| `/reset-password` | `resetPassword` (token from email link) |
| `/(dashboard)/dashboard` | `getDashboardData` |
| `/(dashboard)/events` | `listEvents`, `createEvent`, `updateEvent`, `deleteEvent` |
| `/(dashboard)/tasks` | `listTasks`, `createTask`, `updateTask`, `toggleTaskDone`, `deleteTask`, `applyChecklistTemplate` |
| `/(dashboard)/budget` | `listExpenses`, `createExpense`, `updateExpense`, `deleteExpense`, `getBudgetSummary`, `updateBudgetCategories`, `updateFunders` |
| `/(dashboard)/vendors` | `listVendors`, `getVendor`, `createVendor`, `updateVendor`, `deleteVendor`, `addPayment`, `markPaymentPaid`, `undoPaymentPaid`, `removePayment` |
| `/(dashboard)/guests` | `listGuests`, `getGuest`, `createGuest`, `updateGuest`, `deleteGuest`, `importGuestsCSV`, `bulkAssignEvent`, `getRsvpSummary`, `getGuestRsvpLink` |
| `/(dashboard)/invitations` | `getInviteCardUrl`, `listTemplates` |
| `/(dashboard)/settings` | `getWedding`, `getWeddingSettings`, `updateWeddingSettings`, `changePassword`, `listMembers`, `listInviteTokens`, `generateInviteLink`, `revokeInviteToken`, `updateMemberRole`, `revokeMember`, `switchActiveWedding` |
| `/(dashboard)/website` | `getWedding`, `updateWebsiteContent`, `setWebsiteTemplate`, `publishWebsite`, `unpublishWebsite`, `getWebsitePreviewUrl` |
| `/w/[slug]` | none (Server Component reads DB directly via slug lookup — no tenant context needed, public page) |
| `/rsvp/[token]` | REST: `GET/POST /api/rsvp/[token]` |
| `/invite/[token]` | REST: `GET /api/invite/[token]` (preview), `POST /api/invite/[token]` (accept) |
| `/gallery/[eventId]` | REST: `GET /api/gallery/[eventId]` (public listing), `POST /api/upload/sign`, `POST /api/gallery/[eventId]/confirm`; Server Action: `listPhotos` (organizer moderation view) |

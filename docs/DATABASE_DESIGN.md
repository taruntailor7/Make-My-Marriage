# Make My Marriage — Database Design

MongoDB Atlas (M0 free tier, 512MB). Mongoose ODM. All collections live
in a single database: `make-my-marriage`.

## 1. Entity Relationship Diagram

```
┌──────────┐       ┌────────────────┐       ┌──────────┐
│  users   │──1:N──│ weddingMembers │──N:1──│ weddings │
└──────────┘       └────────────────┘       └────┬─────┘
                                                 │
                   ┌─────────────────────────────┤ 1:N
                   │           │           │     │         │
              ┌────▼───┐ ┌────▼───┐ ┌─────▼──┐ ┌▼───────┐ │
              │ events │ │ tasks  │ │expenses│ │vendors │ │
              └───┬────┘ └────────┘ └────────┘ └────────┘ │
                  │                                        │
         ┌────────┼────────┬───────────┐                   │
         │        │        │           │                   │
    ┌────▼───┐ ┌──▼────┐ ┌─▼────────┐ ┌▼──────────────┐   │
    │ guests │ │photos │ │rsvpTokens│ │ inviteTokens  │───┘
    └────────┘ └───────┘ └──────────┘ └───────────────┘
         │
    [embedded: rsvps]

    ┌──────────────┐
    │notifications │── references weddingId (cross-cutting)
    └──────────────┘
```

**Cardinalities:**
- users ↔ weddings: N:N (via weddingMembers)
- weddings → events: 1:N (typically 3-10 events per wedding)
- weddings → guests: 1:N (typically 50-500 per wedding)
- weddings → tasks: 1:N (typically 20-100 per wedding)
- weddings → expenses: 1:N (typically 20-200 per wedding)
- weddings → vendors: 1:N (typically 5-20 per wedding)
- events → photos: 1:N (could be 0-1000+ per event during gallery bursts)
- guests → rsvpTokens: 1:1
- guests → rsvps: 1:N embedded (one per invited event, max ~10)
- vendors → payments: 1:N embedded (max ~10 installments)

## 2. Collections — Full Mongoose Schema Definitions

### 2.1 `users`

Managed by NextAuth's MongoDB adapter. We extend it with `phone`.

```typescript
{
  _id:            { type: ObjectId, auto: true },
  name:           { type: String, required: true, trim: true, maxlength: 100 },
  email:          { type: String, trim: true, lowercase: true, maxlength: 255,
                    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, sparse: true, unique: true },
  emailVerified:  { type: Date, default: null },
  phone:          { type: String, trim: true, maxlength: 15,
                    match: /^\+?[1-9]\d{6,14}$/, sparse: true, unique: true },
  image:          { type: String, default: null },       // avatar URL
  hashedPassword: { type: String, select: false },       // only for credentials provider
  createdAt:      { type: Date, default: Date.now },
  updatedAt:      { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ email: 1 }` | unique sparse | Auth lookup by email |
| `{ phone: 1 }` | unique sparse | Auth lookup by phone (future OTP) |

**Notes:**
- NextAuth also creates `accounts` and `sessions` collections automatically.
- `hashedPassword` uses `select: false` — never returned in queries unless explicitly requested.
- `phone` is collected even for Google/email login users (for contact purposes per PRD).

### 2.2 `weddings`

The tenant entity. Every other collection hangs off `weddingId`.

```typescript
{
  _id:        { type: ObjectId, auto: true },
  name:       { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  slug:       { type: String, required: true, unique: true, lowercase: true,
                trim: true, minlength: 2, maxlength: 60,
                match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },   // URL-safe kebab-case
  startDate:  { type: Date, required: true },
  endDate:    { type: Date, required: true,
                validate: { validator: function(v) { return v >= this.startDate },
                            message: 'endDate must be >= startDate' } },
  coverPhoto: { type: String, default: null },             // Cloudinary URL
  createdBy:  { type: ObjectId, ref: 'User', required: true },

  // -- Embedded: budget category targets --
  budgetCategories: [{
    _id:    false,
    key:    { type: String, required: true, trim: true, maxlength: 50 },
    label:  { type: String, required: true, trim: true, maxlength: 100 },
    target: { type: Number, default: null, min: 0 }        // null = no target set
  }],

  // -- Embedded: funder list --
  funders: [{
    _id:   false,
    key:   { type: String, required: true, trim: true, maxlength: 50 },
    label: { type: String, required: true, trim: true, maxlength: 100 }
  }],

  // -- Embedded: wedding website content --
  website: {
    templateId:  { type: String, default: 'minimal' },
    isPublished: { type: Boolean, default: false },
    sections: {
      story:       { enabled: { type: Boolean, default: false },
                     content: { type: String, default: '', maxlength: 5000 } },
      schedule:    { enabled: { type: Boolean, default: true } },
      venue:       { enabled: { type: Boolean, default: true } },
      registry:    { enabled: { type: Boolean, default: false },
                     content: { type: String, default: '', maxlength: 2000 } },
      faq:         { enabled: { type: Boolean, default: false },
                     items:   [{ _id: false,
                                 q: { type: String, maxlength: 500 },
                                 a: { type: String, maxlength: 2000 } }] },
      gallery:     { enabled: { type: Boolean, default: false } },
      livestream:  { enabled: { type: Boolean, default: false },
                     embedUrl: { type: String, default: null, maxlength: 500 } }
    }
  },

  // -- Settings --
  rsvpCutoffDate:          { type: Date, default: null },
  galleryModerationEnabled: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ slug: 1 }` | unique | Wedding website URL lookup |
| `{ createdBy: 1 }` | regular | "My created weddings" query |

**Default seed data on creation:**
```json
budgetCategories: [
  { key: "venue",        label: "Venue" },
  { key: "catering",     label: "Catering" },
  { key: "decor",        label: "Decor & Flowers" },
  { key: "photography",  label: "Photography & Video" },
  { key: "attire",       label: "Attire & Accessories" },
  { key: "jewelry",      label: "Jewelry" },
  { key: "entertainment",label: "Entertainment & Music" },
  { key: "makeup",       label: "Makeup & Grooming" },
  { key: "transport",    label: "Transport & Logistics" },
  { key: "misc",         label: "Miscellaneous" }
]

funders: [
  { key: "brides-side",  label: "Bride's Side" },
  { key: "grooms-side",  label: "Groom's Side" },
  { key: "joint",        label: "Joint" }
]
```

**Slug generation algorithm:**
1. Take wedding name, lowercase, replace spaces with hyphens, strip non-alphanumeric
2. If collision: append `-2`, `-3`, etc. until unique
3. User can edit slug before confirming

### 2.3 `weddingMembers`

The RBAC join table. Queried on every authenticated request.

```typescript
{
  _id:        { type: ObjectId, auto: true },
  weddingId:  { type: ObjectId, ref: 'Wedding', required: true },
  userId:     { type: ObjectId, ref: 'User', required: true },
  role:       { type: String, required: true,
                enum: ['owner', 'family_admin', 'event_coordinator'] },
  eventScope: [{ type: ObjectId, ref: 'Event' }],  // only for event_coordinator
  invitedBy:  { type: ObjectId, ref: 'User', required: true },
  createdAt:  { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ weddingId: 1, userId: 1 }` | unique compound | Prevent duplicate membership |
| `{ userId: 1 }` | regular | "Which weddings am I in?" |
| `{ weddingId: 1, role: 1 }` | regular | "Who are the owners?" |

**Validation rules:**
- `eventScope` must be empty when `role` is `owner` or `family_admin`.
- `eventScope` must be non-empty when `role` is `event_coordinator`.
- The first member (creator) always has role `owner` and `invitedBy` = self.

### 2.4 `events`

```typescript
{
  _id:       { type: ObjectId, auto: true },
  weddingId: { type: ObjectId, ref: 'Wedding', required: true },
  name:      { type: String, required: true, trim: true, maxlength: 200 },
  date:      { type: Date, required: true },
  startTime: { type: String, default: null, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
  endTime:   { type: String, default: null, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
  venue:     { type: String, default: null, trim: true, maxlength: 500 },
  eventType: { type: String, required: true,
               enum: ['haldi', 'mehendi', 'sangeet', 'wedding', 'reception', 'other'] },
  notes:     { type: String, default: null, maxlength: 2000 },
  dressCode: { type: String, default: null, maxlength: 200 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ weddingId: 1, date: 1 }` | compound | Events sorted by date for a wedding |

**Deletion cascade:**
When an event is deleted:
1. Remove `eventId` from all guests' `eventIds` arrays
2. Remove matching `rsvps` entries from guests
3. Delete all `photos` for this event (+ Cloudinary cleanup, best-effort)
4. Delete all `tasks` linked to this event
5. Remove event from `weddingMembers.eventScope` arrays
6. Remove event from `vendors.eventIds` arrays

### 2.5 `guests`

```typescript
{
  _id:             { type: ObjectId, auto: true },
  weddingId:       { type: ObjectId, ref: 'Wedding', required: true },
  name:            { type: String, required: true, trim: true, maxlength: 200 },
  phone:           { type: String, default: null, trim: true, maxlength: 15,
                     match: /^\+?[1-9]\d{6,14}$/ },
  email:           { type: String, default: null, trim: true, lowercase: true,
                     maxlength: 255, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  relation:        { type: String, default: null, trim: true, maxlength: 100 },
  side:            { type: String, required: true, enum: ['bride', 'groom', 'joint'] },
  plusOnesAllowed:  { type: Number, default: 0, min: 0, max: 20 },
  eventIds:        [{ type: ObjectId, ref: 'Event' }],

  // Embedded: RSVP responses
  rsvps: [{
    _id:         false,
    eventId:     { type: ObjectId, ref: 'Event', required: true },
    attending:   { type: Boolean, default: null },     // null = not responded
    headcount:   { type: Number, default: 1, min: 1 },
    dietaryNote: { type: String, default: null, maxlength: 500 }
  }],

  rsvpRespondedAt: { type: Date, default: null },
  createdAt:       { type: Date, default: Date.now },
  updatedAt:       { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ weddingId: 1 }` | regular | All guests for a wedding |
| `{ weddingId: 1, side: 1 }` | compound | Filter guests by side |
| `{ weddingId: 1, eventIds: 1 }` | compound | Guests for a specific event |

**Validation rules:**
- `rsvps[].headcount` must be ≤ `plusOnesAllowed + 1`.
- `rsvps` array entries must have unique `eventId` values.
- Each `rsvps[].eventId` must exist in `eventIds`.

**CSV import column mapping:**
```
name (required), phone, email, relation, side (required), plusOnesAllowed, events
```
- `events` column: comma-separated event names, matched by fuzzy/exact name to existing events.
- Bad rows (missing name or side): skipped, reported in summary.

### 2.6 `tasks`

```typescript
{
  _id:            { type: ObjectId, auto: true },
  weddingId:      { type: ObjectId, ref: 'Wedding', required: true },
  title:          { type: String, required: true, trim: true, maxlength: 300 },
  description:    { type: String, default: null, maxlength: 2000 },
  dueDate:        { type: Date, default: null },
  assigneeId:     { type: ObjectId, ref: 'User', default: null },
  eventId:        { type: ObjectId, ref: 'Event', default: null },
  isDone:         { type: Boolean, default: false },
  isFromTemplate: { type: Boolean, default: false },
  createdAt:      { type: Date, default: Date.now },
  updatedAt:      { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ weddingId: 1, isDone: 1 }` | compound | Pending tasks for a wedding |
| `{ weddingId: 1, eventId: 1 }` | compound | Tasks for a specific event |
| `{ weddingId: 1, assigneeId: 1 }` | compound | Tasks assigned to a person |
| `{ dueDate: 1 }` | regular | Cron: tasks due tomorrow (cross-wedding) |

### 2.7 `expenses`

```typescript
{
  _id:                 { type: ObjectId, auto: true },
  weddingId:           { type: ObjectId, ref: 'Wedding', required: true },
  amount:              { type: Number, required: true, min: 0 },
  category:            { type: String, required: true, trim: true, maxlength: 50 },
  date:                { type: Date, required: true },
  vendorId:            { type: ObjectId, ref: 'Vendor', default: null },
  vendorPaymentIndex:  { type: Number, default: null, min: 0 },
  paymentMethod:       { type: String, default: null, trim: true, maxlength: 50 },
  funder:              { type: String, default: null, trim: true, maxlength: 50 },
  notes:               { type: String, default: null, maxlength: 1000 },
  receiptPhoto:        { type: String, default: null },    // Cloudinary URL
  createdAt:           { type: Date, default: Date.now },
  updatedAt:           { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ weddingId: 1, category: 1 }` | compound | Budget by category |
| `{ weddingId: 1, funder: 1 }` | compound | Budget by funder |
| `{ weddingId: 1, vendorId: 1 }` | compound | Expenses for a vendor |
| `{ weddingId: 1, date: -1 }` | compound | Recent expenses |

### 2.8 `vendors`

```typescript
{
  _id:          { type: ObjectId, auto: true },
  weddingId:    { type: ObjectId, ref: 'Wedding', required: true },
  name:         { type: String, required: true, trim: true, maxlength: 200 },
  category:     { type: String, required: true, trim: true, maxlength: 50 },
  phone:        { type: String, default: null, trim: true, maxlength: 15 },
  email:        { type: String, default: null, trim: true, lowercase: true, maxlength: 255 },
  notes:        { type: String, default: null, maxlength: 2000 },
  contractFile: { type: String, default: null },           // Cloudinary URL
  eventIds:     [{ type: ObjectId, ref: 'Event' }],

  // Embedded: payment schedule
  payments: [{
    _id:             { type: ObjectId, auto: true },       // need _id to reference specific installment
    label:           { type: String, required: true, trim: true, maxlength: 100 },
    amount:          { type: Number, required: true, min: 0 },
    dueDate:         { type: Date, default: null },
    isPaid:          { type: Boolean, default: false },
    paidDate:        { type: Date, default: null },
    linkedExpenseId: { type: ObjectId, ref: 'Expense', default: null }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ weddingId: 1 }` | regular | All vendors for a wedding |
| `{ weddingId: 1, category: 1 }` | compound | Vendors by category |

**Behavior: marking a payment as paid:**
1. Set `payments[i].isPaid = true`, `paidDate = now`
2. Auto-create an `expense` document: amount, category = vendor.category,
   date = now, vendorId, vendorPaymentIndex = i, funder = null (user fills later)
3. Set `payments[i].linkedExpenseId` to the new expense's `_id`
4. This is a single transaction-like operation (use Mongoose `session` for atomicity if needed on paid tier; on M0 free tier, single-document updates are atomic, cross-collection is best-effort)

### 2.9 `photos`

```typescript
{
  _id:                 { type: ObjectId, auto: true },
  weddingId:           { type: ObjectId, ref: 'Wedding', required: true },
  eventId:             { type: ObjectId, ref: 'Event', required: true },
  cloudinaryPublicId:  { type: String, required: true },
  url:                 { type: String, required: true },
  thumbnailUrl:        { type: String, required: true },
  uploadedBy:          { type: String, default: null, trim: true, maxlength: 100 },
  isApproved:          { type: Boolean, default: true },
  createdAt:           { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ weddingId: 1, eventId: 1, createdAt: -1 }` | compound | Gallery for an event, newest first |
| `{ weddingId: 1, isApproved: 1 }` | compound | Moderation queue |

**Note:** `isApproved` defaults to `true`. When `wedding.galleryModerationEnabled` is `true`, the upload handler overrides this to `false`.

### 2.10 `inviteTokens`

```typescript
{
  _id:        { type: ObjectId, auto: true },
  weddingId:  { type: ObjectId, ref: 'Wedding', required: true },
  token:      { type: String, required: true, unique: true },
  role:       { type: String, required: true,
                enum: ['owner', 'family_admin', 'event_coordinator'] },
  eventScope: [{ type: ObjectId, ref: 'Event' }],
  createdBy:  { type: ObjectId, ref: 'User', required: true },
  usedBy:     { type: ObjectId, ref: 'User', default: null },
  usedAt:     { type: Date, default: null },
  expiresAt:  { type: Date, required: true },
  createdAt:  { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ token: 1 }` | unique | Token lookup on redemption |
| `{ expiresAt: 1 }` | TTL (expireAfterSeconds: 0) | Auto-delete expired tokens |

**Token generation:** 32 bytes from `crypto.randomBytes`, encoded as URL-safe base64. Expires 7 days from creation.

**Redemption flow:**
1. Look up token → verify not used (`usedBy === null`) and not expired
2. Create `weddingMember` record for the redeeming user
3. Set `usedBy`, `usedAt` on the token (don't delete — keeps audit trail until TTL cleans it)

### 2.11 `rsvpTokens`

```typescript
{
  _id:       { type: ObjectId, auto: true },
  weddingId: { type: ObjectId, ref: 'Wedding', required: true },
  guestId:   { type: ObjectId, ref: 'Guest', required: true, unique: true },
  token:     { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ token: 1 }` | unique | RSVP page token lookup |
| `{ guestId: 1 }` | unique | One token per guest (find token for a guest) |

**Token generation:** same as inviteTokens — 32 bytes `crypto.randomBytes`, URL-safe base64. No expiry (token lives as long as the guest exists).

### 2.12 `notifications`

```typescript
{
  _id:              { type: ObjectId, auto: true },
  weddingId:        { type: ObjectId, ref: 'Wedding', required: true },
  type:             { type: String, required: true,
                      enum: ['rsvp_reminder', 'task_due', 'task_assigned',
                             'vendor_payment_due', 'event_day'] },
  channel:          { type: String, required: true,
                      enum: ['email', 'sms', 'whatsapp', 'push'] },
  recipientType:    { type: String, required: true, enum: ['organizer', 'guest'] },
  recipientId:      { type: String, required: true },
  recipientContact: { type: String, required: true },
  status:           { type: String, required: true,
                      enum: ['sent', 'failed', 'bounced'] },
  sentAt:           { type: Date, default: Date.now },
  metadata:         { type: Schema.Types.Mixed, default: {} }
}
```

**Indexes:**
| Index | Type | Purpose |
|---|---|---|
| `{ weddingId: 1, type: 1, sentAt: -1 }` | compound | Notification history |
| `{ recipientId: 1, type: 1, sentAt: -1 }` | compound | Dedup: was this already sent today? |
| `{ sentAt: 1 }` | TTL (expireAfterSeconds: 7776000) | Auto-prune after 90 days |

**Dedup logic:** Before sending, check:
```
notifications.findOne({
  recipientId, type,
  sentAt: { $gte: startOfToday }
})
```
If found → skip. Prevents double-sends on cron retries.

## 3. Key Query Patterns

### 3.1 Dashboard queries (per wedding)

```javascript
// Upcoming events (sorted by date)
events.find({ weddingId }).sort({ date: 1 })

// Task summary: pending count
tasks.countDocuments({ weddingId, isDone: false })

// Budget summary: total spent
expenses.aggregate([
  { $match: { weddingId } },
  { $group: { _id: null, total: { $sum: '$amount' } } }
])

// Guest summary: total count, RSVP response rate
guests.aggregate([
  { $match: { weddingId } },
  { $group: {
    _id: null,
    total: { $sum: 1 },
    responded: { $sum: { $cond: [{ $ne: ['$rsvpRespondedAt', null] }, 1, 0] } }
  }}
])
```

### 3.2 Budget aggregations

```javascript
// Budget by category: actual vs target
// Step 1: aggregate expenses by category
expenses.aggregate([
  { $match: { weddingId } },
  { $group: { _id: '$category', actual: { $sum: '$amount' } } }
])
// Step 2: merge with wedding.budgetCategories in application code

// Budget by funder
expenses.aggregate([
  { $match: { weddingId } },
  { $group: { _id: '$funder', total: { $sum: '$amount' } } }
])
```

### 3.3 RSVP aggregation (per event headcount)

```javascript
guests.aggregate([
  { $match: { weddingId } },
  { $unwind: '$rsvps' },
  { $match: { 'rsvps.attending': true } },
  { $group: {
    _id: '$rsvps.eventId',
    confirmedGuests: { $sum: 1 },
    totalHeadcount: { $sum: '$rsvps.headcount' }
  }}
])
```

### 3.4 Cron: daily notification queries (cross-wedding)

```javascript
// Tasks due tomorrow
const tomorrow = startOfDay(addDays(new Date(), 1))
const dayAfter = startOfDay(addDays(new Date(), 2))
tasks.find({
  isDone: false,
  assigneeId: { $ne: null },
  dueDate: { $gte: tomorrow, $lt: dayAfter }
}).populate('assigneeId', 'name email')

// Vendor payments due in 3 days
vendors.find({
  'payments': { $elemMatch: {
    isPaid: false,
    dueDate: { $gte: threeDaysFromNow, $lt: fourDaysFromNow }
  }}
})

// Events happening tomorrow
events.find({
  date: { $gte: tomorrow, $lt: dayAfter }
})

// Guests with pending RSVPs (cutoff approaching)
// Join weddings where rsvpCutoffDate is 3 days away, find their guests with null attending
```

## 4. Deletion Cascades

| When deleted | Cascade to |
|---|---|
| **Wedding** | Delete all: weddingMembers, events, guests, tasks, expenses, vendors, photos, inviteTokens, rsvpTokens, notifications. Cloudinary cleanup (best-effort background job) |
| **Event** | Remove from guests.eventIds + guests.rsvps, tasks with this eventId, photos for this event, weddingMembers.eventScope entries, vendors.eventIds entries |
| **Guest** | Delete their rsvpToken. Remove from no other collection (expenses/tasks don't reference guests) |
| **Vendor** | Unlink related expenses: set `vendorId = null` on matching expenses (preserves the expense records — the money was still spent, only the vendor association is removed) |

## 5. Storage Estimates (512MB free tier)

| Collection | Avg doc size | Per wedding (est.) | 100 weddings |
|---|---|---|---|
| weddings | ~3 KB (with website content) | 1 doc = 3 KB | 300 KB |
| weddingMembers | ~200 B | 5 docs = 1 KB | 100 KB |
| events | ~300 B | 8 docs = 2.4 KB | 240 KB |
| guests | ~500 B (with RSVPs) | 200 docs = 100 KB | 10 MB |
| tasks | ~250 B | 50 docs = 12.5 KB | 1.25 MB |
| expenses | ~300 B | 100 docs = 30 KB | 3 MB |
| vendors | ~800 B (with payments) | 10 docs = 8 KB | 800 KB |
| photos (metadata only) | ~300 B | 500 docs = 150 KB | 15 MB |
| rsvpTokens | ~150 B | 200 docs = 30 KB | 3 MB |
| notifications | ~250 B | 500 docs = 125 KB | 12.5 MB |
| **Total** | | **~462 KB** | **~46 MB** |

**Conclusion:** 512MB supports ~1,000 active weddings comfortably. Photos are metadata only (images live in Cloudinary). The first constraint hit will be Cloudinary storage (25GB), not MongoDB.

## 6. Starter Checklist Template

Stored in codebase as `src/lib/data/checklist-template.json`.

```json
[
  { "title": "Set wedding budget",                    "offsetDays": -180 },
  { "title": "Book wedding venue",                    "offsetDays": -180 },
  { "title": "Book photographer & videographer",      "offsetDays": -150 },
  { "title": "Hire caterer / finalize menu",          "offsetDays": -120 },
  { "title": "Book decorator / florist",              "offsetDays": -120 },
  { "title": "Order wedding outfits (bride)",         "offsetDays": -120 },
  { "title": "Order wedding outfits (groom)",         "offsetDays": -120 },
  { "title": "Book mehendi artist",                   "offsetDays": -90 },
  { "title": "Book DJ / band / entertainment",        "offsetDays": -90 },
  { "title": "Book makeup artist & grooming",         "offsetDays": -90 },
  { "title": "Arrange priest / pandit",               "offsetDays": -90 },
  { "title": "Book mandap / stage setup",             "offsetDays": -90 },
  { "title": "Finalize guest list",                   "offsetDays": -60 },
  { "title": "Design & send save-the-date",           "offsetDays": -60 },
  { "title": "Order jewelry & accessories",           "offsetDays": -60 },
  { "title": "Plan sangeet performances",             "offsetDays": -45 },
  { "title": "Send formal wedding invitations",       "offsetDays": -30 },
  { "title": "Arrange baraat logistics",              "offsetDays": -30 },
  { "title": "Book hotel blocks for outstation guests","offsetDays": -30 },
  { "title": "Finalize event-wise guest assignments",  "offsetDays": -21 },
  { "title": "Confirm all vendor bookings",           "offsetDays": -14 },
  { "title": "Final dress fittings",                  "offsetDays": -14 },
  { "title": "Follow up on pending RSVPs",            "offsetDays": -10 },
  { "title": "Final venue walkthrough",               "offsetDays": -7 },
  { "title": "Confirm all vendor payments",           "offsetDays": -7 },
  { "title": "Prepare welcome bags / gifts",          "offsetDays": -3 }
]
```

`offsetDays` is relative to `wedding.startDate`. Applied via:
```typescript
template.map(t => ({
  weddingId,
  title: t.title,
  dueDate: addDays(wedding.startDate, t.offsetDays),
  isDone: false,
  isFromTemplate: true
}))
```

## 7. Mongoose Virtuals (Computed Fields)

Virtuals are not stored in the DB — they're computed on read. Define these
on the schema so application code can treat them like real fields.

```typescript
// Wedding
weddingSchema.virtual('daysUntilStart').get(function () {
  return Math.ceil((this.startDate - Date.now()) / 86400000)
})

// Guest
guestSchema.virtual('hasResponded').get(function () {
  return this.rsvpRespondedAt !== null
})
guestSchema.virtual('attendingEventCount').get(function () {
  return this.rsvps.filter(r => r.attending === true).length
})

// Vendor
vendorSchema.virtual('totalContractAmount').get(function () {
  return this.payments.reduce((sum, p) => sum + p.amount, 0)
})
vendorSchema.virtual('totalPaid').get(function () {
  return this.payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0)
})
vendorSchema.virtual('totalOutstanding').get(function () {
  return this.totalContractAmount - this.totalPaid
})
vendorSchema.virtual('nextPaymentDue').get(function () {
  return this.payments
    .filter(p => !p.isPaid && p.dueDate)
    .sort((a, b) => a.dueDate - b.dueDate)[0] || null
})

// Task
taskSchema.virtual('isOverdue').get(function () {
  return !this.isDone && this.dueDate && this.dueDate < new Date()
})
```

Enable virtuals in JSON/object output:
```typescript
schema.set('toJSON', { virtuals: true })
schema.set('toObject', { virtuals: true })
```

## 8. Population Patterns

Which references to `.populate()` in which query contexts:

| Context | Collection | Populate | Fields |
|---|---|---|---|
| Dashboard task list | tasks | `assigneeId` | `name, image` |
| Guest list view | guests | — | no refs to populate (events shown by name from separate query) |
| Expense list | expenses | `vendorId` | `name` |
| Vendor detail | vendors | — | no refs (eventIds resolved in app code) |
| Cron: task due | tasks | `assigneeId` | `name, email` |
| Cron: event tomorrow | events | — | (guests fetched separately by eventIds) |
| Wedding member list | weddingMembers | `userId` | `name, email, image` |
| Invite token redemption | inviteTokens | — | (just token lookup, no populate needed) |

**Rule:** Minimize population. Only populate when the UI needs the referenced
document's fields in the same view. For listing pages, a single `.populate('field', 'name')`
is fine. Never deep-populate (populate inside populate).

## 9. Mongoose Middleware Hooks

### 9.1 Pre-save: timestamps
```typescript
// Applied globally via Mongoose timestamps option
{ timestamps: true }  // auto-manages createdAt, updatedAt
```

### 9.2 Pre-save: slug uniqueness (weddings)
```typescript
weddingSchema.pre('save', async function () {
  if (this.isNew || this.isModified('slug')) {
    let base = this.slug
    let suffix = 1
    while (await Wedding.exists({ slug: this.slug, _id: { $ne: this._id } })) {
      suffix++
      this.slug = `${base}-${suffix}`
    }
  }
})
```

### 9.3 Pre-validate: eventScope consistency (weddingMembers)
```typescript
weddingMemberSchema.pre('validate', function () {
  if (this.role === 'event_coordinator' && this.eventScope.length === 0) {
    throw new Error('Event coordinators must have at least one event in scope')
  }
  if (this.role !== 'event_coordinator' && this.eventScope.length > 0) {
    this.eventScope = []  // silently clear for non-coordinators
  }
})
```

### 9.4 Post-remove: cascade cleanup
```typescript
// Wedding deletion → cascade
weddingSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return
  const wid = doc._id
  await Promise.all([
    WeddingMember.deleteMany({ weddingId: wid }),
    Event.deleteMany({ weddingId: wid }),
    Guest.deleteMany({ weddingId: wid }),
    Task.deleteMany({ weddingId: wid }),
    Expense.deleteMany({ weddingId: wid }),
    Vendor.deleteMany({ weddingId: wid }),
    Photo.deleteMany({ weddingId: wid }),
    InviteToken.deleteMany({ weddingId: wid }),
    RsvpToken.deleteMany({ weddingId: wid }),
    Notification.deleteMany({ weddingId: wid }),
  ])
  // Cloudinary cleanup: fire-and-forget
  cleanupCloudinaryFolder(wid).catch(() => {})
})

// Event deletion → update related docs
eventSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return
  const eid = doc._id
  await Promise.all([
    Guest.updateMany(
      { weddingId: doc.weddingId, eventIds: eid },
      { $pull: { eventIds: eid, rsvps: { eventId: eid } } }
    ),
    Task.deleteMany({ eventId: eid }),
    Photo.deleteMany({ eventId: eid }),
    WeddingMember.updateMany(
      { weddingId: doc.weddingId, eventScope: eid },
      { $pull: { eventScope: eid } }
    ),
    Vendor.updateMany(
      { weddingId: doc.weddingId, eventIds: eid },
      { $pull: { eventIds: eid } }
    ),
  ])
})
```

## 10. MongoDB Connection for Vercel Serverless

Vercel serverless functions are stateless — each invocation may or may not
reuse a previous connection. The standard pattern:

```typescript
// lib/db/connection.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

let cached = global.mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,        // M0 free tier allows 500 connections max
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
```

**Key points:**
- Connection is cached in `global` to survive across warm invocations.
- `maxPoolSize: 10` keeps well under M0's 500-connection limit even with many concurrent functions.
- Every Server Action / API route calls `await connectDB()` at the top.

## 11. M0 Free Tier Limitations

| Feature | M0 support | Impact on our design |
|---|---|---|
| Multi-document transactions | ✗ | Vendor payment → expense creation is **not atomic**. Use a two-step write with error recovery (if expense creation fails, roll back the payment `isPaid` flag). |
| Change streams | ✗ | No realtime database subscriptions. Dashboard uses polling or page refresh, not live updates. |
| Automated backups | ✗ | No point-in-time recovery. Consider `mongodump` via cron to Cloudinary/R2 as a DIY backup if the product grows. |
| Full-text search (Atlas Search) | ✗ | Guest name search uses regex: `{ name: { $regex: query, $options: 'i' } }`. Good enough for <500 guests per wedding. |
| Capped collections | ✗ | Notifications collection grows unbounded. Add a TTL index on `sentAt` (e.g., 90 days) to auto-prune old notifications. |
| Max connections | 500 | `maxPoolSize: 10` in connection config keeps us safe. |
| Max document size | 16 MB | Wedding doc with embedded website content: ~3KB. No risk. |
| Storage | 512 MB | ~1,000 weddings. See Section 5. |

## 12. Soft Delete vs Hard Delete

**Policy: hard delete everywhere.** No `isDeleted` flags, no soft-delete pattern.

**Rationale:**
- Simplifies every query (no `{ isDeleted: false }` filter to remember).
- Storage matters on the 512MB free tier.
- DPDP Act compliance: when a user deletes their wedding, the data should actually be gone, not just hidden.
- Cascades (Section 4) handle referential cleanup.

**Exception:** `inviteTokens` — redeemed tokens are kept (with `usedBy`/`usedAt`) as an audit trail until the TTL index auto-deletes them after 7 days. This is not soft delete — it's a natural lifecycle.

## 13. Audit Trail

**Current design:** `createdAt` and `updatedAt` timestamps only. No `updatedBy` field.

**Rationale for v1:** Adding `updatedBy` to every collection means passing
the current user through every update operation, including cascade updates
(event deletion updating guests, vendor payment creating expenses). It's
meaningful overhead for a feature no one's asked for yet.

**If needed later:** Add `lastModifiedBy: ObjectId` to collections where
accountability matters (guests, expenses, vendors). This is an additive
schema change — MongoDB handles the missing field on old documents gracefully.

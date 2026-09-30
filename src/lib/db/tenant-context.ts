import { Types } from "mongoose"
import type { WeddingRole } from "@/types"
import {
  Event,
  Guest,
  Task,
  Expense,
  Vendor,
  Photo,
  WeddingMember,
  InviteToken,
  Notification,
} from "./models"

export class TenantContext {
  constructor(
    public readonly weddingId: string,
    public readonly userId: string,
    public readonly role: WeddingRole,
    public readonly eventScope: string[]
  ) {}

  private isCoordinator() {
    return this.role === "event_coordinator"
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private scopeFilter(filter: Record<string, any> = {}): Record<string, any> {
    return { ...filter, weddingId: this.weddingId }
  }

  // --- Events ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findEvents(filter: Record<string, any> = {}) {
    const scoped = this.scopeFilter(filter)
    if (this.isCoordinator()) {
      scoped._id = { $in: this.eventScope }
    }
    return Event.find(scoped).sort({ date: 1 })
  }

  async findEventById(eventId: string) {
    if (this.isCoordinator() && !this.eventScope.includes(eventId)) {
      return null
    }
    return Event.findOne({ _id: eventId, weddingId: this.weddingId })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createEvent(data: Record<string, any>) {
    return Event.create({ ...data, weddingId: this.weddingId })
  }

  // --- Guests ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findGuests(filter: Record<string, any> = {}) {
    const scoped = this.scopeFilter(filter)
    if (this.isCoordinator()) {
      scoped.eventIds = { $in: this.eventScope }
    }
    return Guest.find(scoped)
  }

  async findGuestById(guestId: string) {
    const guest = await Guest.findOne({ _id: guestId, weddingId: this.weddingId })
    if (!guest) return null
    if (this.isCoordinator()) {
      const hasOverlap = guest.eventIds.some((eid) =>
        this.eventScope.includes(eid.toString())
      )
      if (!hasOverlap) return null
    }
    return guest
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createGuest(data: Record<string, any>) {
    return Guest.create({ ...data, weddingId: this.weddingId })
  }

  // --- Tasks ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findTasks(filter: Record<string, any> = {}) {
    const scoped = this.scopeFilter(filter)
    if (this.isCoordinator()) {
      scoped.$or = [
        { eventId: { $in: this.eventScope } },
        { eventId: null },
      ]
    }
    return Task.find(scoped).sort({ dueDate: 1 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createTask(data: Record<string, any>) {
    return Task.create({ ...data, weddingId: this.weddingId })
  }

  // --- Expenses (coordinators have NO access) ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findExpenses(filter: Record<string, any> = {}) {
    if (this.isCoordinator()) throw new Error("Coordinators cannot access budget")
    return Expense.find(this.scopeFilter(filter)).sort({ date: -1 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createExpense(data: Record<string, any>) {
    if (this.isCoordinator()) throw new Error("Coordinators cannot access budget")
    return Expense.create({ ...data, weddingId: this.weddingId })
  }

  // --- Vendors (coordinators have NO access) ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findVendors(filter: Record<string, any> = {}) {
    if (this.isCoordinator()) throw new Error("Coordinators cannot access vendors")
    return Vendor.find(this.scopeFilter(filter))
  }

  async findVendorById(vendorId: string) {
    if (this.isCoordinator()) throw new Error("Coordinators cannot access vendors")
    return Vendor.findOne({ _id: vendorId, weddingId: this.weddingId })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createVendor(data: Record<string, any>) {
    if (this.isCoordinator()) throw new Error("Coordinators cannot access vendors")
    return Vendor.create({ ...data, weddingId: this.weddingId })
  }

  // --- Photos ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findPhotos(filter: Record<string, any> = {}) {
    const scoped = this.scopeFilter(filter)
    if (this.isCoordinator()) {
      scoped.eventId = { $in: this.eventScope }
    }
    return Photo.find(scoped).sort({ createdAt: -1 })
  }

  // --- Members ---
  async findMembers() {
    return WeddingMember.find({ weddingId: this.weddingId }).populate(
      "userId",
      "name email image"
    )
  }

  // --- Invite Tokens (owner/admin only) ---
  async findInviteTokens() {
    if (this.isCoordinator()) throw new Error("Coordinators cannot access invite tokens")
    return InviteToken.find({ weddingId: this.weddingId })
      .select("-token")
      .sort({ createdAt: -1 })
  }

  // --- Notifications ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findNotifications(filter: Record<string, any> = {}) {
    return Notification.find(this.scopeFilter(filter)).sort({
      sentAt: -1,
    })
  }

  // --- Dashboard Stats (role-scoped) ---
  async countGuests() {
    const filter = this.scopeFilter()
    if (this.isCoordinator()) filter.eventIds = { $in: this.eventScope }
    return Guest.countDocuments(filter)
  }

  async countPendingTasks() {
    const filter = this.scopeFilter({ status: { $ne: "done" } })
    if (this.isCoordinator()) {
      filter.$or = [{ eventId: { $in: this.eventScope } }, { eventId: null }]
    }
    return Task.countDocuments(filter)
  }

  async countOverdueTasks() {
    const filter = this.scopeFilter({ status: { $ne: "done" }, dueDate: { $lt: new Date() } })
    if (this.isCoordinator()) {
      filter.$or = [{ eventId: { $in: this.eventScope } }, { eventId: null }]
    }
    return Task.countDocuments(filter)
  }

  async findRecentTasks(limit = 5) {
    const filter = this.scopeFilter({ status: { $ne: "done" } })
    if (this.isCoordinator()) {
      filter.$or = [{ eventId: { $in: this.eventScope } }, { eventId: null }]
    }
    return Task.find(filter).sort({ dueDate: 1 }).limit(limit).lean()
  }

  async totalSpent(): Promise<number> {
    if (this.isCoordinator()) return 0
    const result = await Expense.aggregate([
      { $match: { weddingId: new Types.ObjectId(this.weddingId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    return result[0]?.total ?? 0
  }

  // --- Role checks ---
  requireRole(...allowed: WeddingRole[]) {
    if (!allowed.includes(this.role)) {
      throw new Error(`Requires role: ${allowed.join(" or ")}`)
    }
  }

  requireOwnerOrAdmin() {
    this.requireRole("owner", "family_admin")
  }

  requireOwner() {
    this.requireRole("owner")
  }
}

// --- Helper to get TenantContext from session ---
// Used in Server Actions and API routes
import { auth } from "@/lib/auth/config"

export async function getTenantContext(): Promise<TenantContext> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const activeWeddingId = session.user.activeWeddingId
  if (!activeWeddingId) {
    throw new Error("No active wedding selected")
  }

  const membership = await WeddingMember.findOne({
    weddingId: activeWeddingId,
    userId: session.user.id,
  })

  if (!membership) {
    throw new Error("No access to this wedding")
  }

  return new TenantContext(
    activeWeddingId,
    session.user.id,
    membership.role,
    membership.eventScope.map((id: Types.ObjectId) => id.toString())
  )
}

export type WeddingRole = "owner" | "family_admin" | "event_coordinator"

export type EventType =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "wedding"
  | "reception"
  | "other"

export type GuestSide = "bride" | "groom" | "joint"

export type NotificationType =
  | "rsvp_reminder"
  | "task_due"
  | "task_assigned"
  | "vendor_payment_due"
  | "event_day"

export type NotificationChannel = "email" | "sms" | "whatsapp" | "push"

export type NotificationStatus = "sent" | "failed" | "bounced"

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "CUTOFF_PASSED"
  | "RATE_LIMITED"
  | "SERVER_ERROR"

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode }

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  totalPages: number
}

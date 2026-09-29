import mongoose, { Schema, type Document, type Types } from "mongoose"
import type { NotificationType, NotificationChannel, NotificationStatus } from "@/types"

export interface INotification extends Document {
  weddingId: Types.ObjectId
  type: NotificationType
  channel: NotificationChannel
  recipientType: "organizer" | "guest"
  recipientId: string
  recipientContact: string
  status: NotificationStatus
  sentAt: Date
  metadata: Record<string, unknown>
}

const notificationSchema = new Schema<INotification>({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  type: {
    type: String,
    required: true,
    enum: [
      "rsvp_reminder",
      "task_due",
      "task_assigned",
      "vendor_payment_due",
      "event_day",
    ],
  },
  channel: {
    type: String,
    required: true,
    enum: ["email", "sms", "whatsapp", "push"],
  },
  recipientType: {
    type: String,
    required: true,
    enum: ["organizer", "guest"],
  },
  recipientId: { type: String, required: true },
  recipientContact: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["sent", "failed", "bounced"],
  },
  sentAt: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed, default: {} },
})

notificationSchema.index({ weddingId: 1, type: 1, sentAt: -1 })
notificationSchema.index({ recipientId: 1, type: 1, sentAt: -1 })
notificationSchema.index({ sentAt: 1 }, { expireAfterSeconds: 7776000 }) // 90 days TTL

export const Notification =
  (mongoose.models.Notification as mongoose.Model<INotification>) ??
  mongoose.model<INotification>("Notification", notificationSchema)

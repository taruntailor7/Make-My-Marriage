import mongoose, { Schema, type Document, type Types } from "mongoose"
import type { WeddingRole } from "@/types"

export interface IInviteToken extends Document {
  weddingId: Types.ObjectId
  token: string
  role: WeddingRole
  eventScope: Types.ObjectId[]
  createdBy: Types.ObjectId
  usedBy: Types.ObjectId | null
  usedAt: Date | null
  expiresAt: Date
  createdAt: Date
}

const inviteTokenSchema = new Schema<IInviteToken>({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  token: { type: String, required: true, unique: true },
  role: {
    type: String,
    required: true,
    enum: ["owner", "family_admin", "event_coordinator"],
  },
  eventScope: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  usedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  usedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
})

inviteTokenSchema.index({ token: 1 }, { unique: true })
inviteTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const InviteToken =
  (mongoose.models.InviteToken as mongoose.Model<IInviteToken>) ??
  mongoose.model<IInviteToken>("InviteToken", inviteTokenSchema)

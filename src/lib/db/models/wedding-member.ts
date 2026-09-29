import mongoose, { Schema, type Document, type Types } from "mongoose"
import type { WeddingRole } from "@/types"

export interface IWeddingMember extends Document {
  weddingId: Types.ObjectId
  userId: Types.ObjectId
  role: WeddingRole
  eventScope: Types.ObjectId[]
  invitedBy: Types.ObjectId
  createdAt: Date
}

const weddingMemberSchema = new Schema<IWeddingMember>({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: {
    type: String,
    required: true,
    enum: ["owner", "family_admin", "event_coordinator"],
  },
  eventScope: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
})

weddingMemberSchema.index({ weddingId: 1, userId: 1 }, { unique: true })
weddingMemberSchema.index({ userId: 1 })
weddingMemberSchema.index({ weddingId: 1, role: 1 })

weddingMemberSchema.pre("validate", function () {
  if (this.role === "event_coordinator" && this.eventScope.length === 0) {
    throw new Error("Event coordinators must have at least one event in scope")
  }
  if (this.role !== "event_coordinator" && this.eventScope.length > 0) {
    this.eventScope = []
  }
})

export const WeddingMember =
  (mongoose.models.WeddingMember as mongoose.Model<IWeddingMember>) ??
  mongoose.model<IWeddingMember>("WeddingMember", weddingMemberSchema)

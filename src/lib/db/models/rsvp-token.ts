import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IRsvpToken extends Document {
  weddingId: Types.ObjectId
  guestId: Types.ObjectId
  token: string
  createdAt: Date
}

const rsvpTokenSchema = new Schema<IRsvpToken>({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  guestId: {
    type: Schema.Types.ObjectId,
    ref: "Guest",
    required: true,
    unique: true,
  },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
})

rsvpTokenSchema.index({ token: 1 }, { unique: true })
rsvpTokenSchema.index({ guestId: 1 }, { unique: true })

export const RsvpToken =
  (mongoose.models.RsvpToken as mongoose.Model<IRsvpToken>) ??
  mongoose.model<IRsvpToken>("RsvpToken", rsvpTokenSchema)

import mongoose, { Schema, type Document, type Types } from "mongoose"
import type { GuestSide } from "@/types"

interface Rsvp {
  eventId: Types.ObjectId
  attending: boolean | null
  headcount: number
  dietaryNote: string | null
}

export interface IGuest extends Document {
  weddingId: Types.ObjectId
  name: string
  phone: string | null
  email: string | null
  relation: string | null
  side: GuestSide
  plusOnesAllowed: number
  eventIds: Types.ObjectId[]
  rsvps: Rsvp[]
  rsvpRespondedAt: Date | null
  createdAt: Date
  updatedAt: Date
  hasResponded: boolean
  attendingEventCount: number
}

const guestSchema = new Schema<IGuest>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    phone: {
      type: String,
      default: null,
      trim: true,
      maxlength: 15,
      match: /^\+?[1-9]\d{6,14}$/,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      maxlength: 255,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    relation: { type: String, default: null, trim: true, maxlength: 100 },
    side: { type: String, required: true, enum: ["bride", "groom", "joint"] },
    plusOnesAllowed: { type: Number, default: 0, min: 0, max: 20 },
    eventIds: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    rsvps: [
      {
        _id: false,
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        attending: { type: Boolean, default: null },
        headcount: { type: Number, default: 1, min: 1 },
        dietaryNote: { type: String, default: null, maxlength: 500 },
      },
    ],
    rsvpRespondedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

guestSchema.index({ weddingId: 1 })
guestSchema.index({ weddingId: 1, side: 1 })
guestSchema.index({ weddingId: 1, eventIds: 1 })

guestSchema.virtual("hasResponded").get(function (this: IGuest) {
  return this.rsvpRespondedAt !== null
})

guestSchema.virtual("attendingEventCount").get(function (this: IGuest) {
  return this.rsvps.filter((r) => r.attending === true).length
})

guestSchema.set("toJSON", { virtuals: true })
guestSchema.set("toObject", { virtuals: true })

export const Guest =
  (mongoose.models.Guest as mongoose.Model<IGuest>) ??
  mongoose.model<IGuest>("Guest", guestSchema)

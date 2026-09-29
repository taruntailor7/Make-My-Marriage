import mongoose, { Schema, type Document, type Types } from "mongoose"
import type { EventType } from "@/types"

export interface IEvent extends Document {
  weddingId: Types.ObjectId
  name: string
  date: Date
  startTime: string | null
  endTime: string | null
  venue: string | null
  eventType: EventType
  notes: string | null
  dressCode: string | null
  createdAt: Date
  updatedAt: Date
}

const eventSchema = new Schema<IEvent>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    date: { type: Date, required: true },
    startTime: {
      type: String,
      default: null,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
      type: String,
      default: null,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    venue: { type: String, default: null, trim: true, maxlength: 500 },
    eventType: {
      type: String,
      required: true,
      enum: ["haldi", "mehendi", "sangeet", "wedding", "reception", "other"],
    },
    notes: { type: String, default: null, maxlength: 2000 },
    dressCode: { type: String, default: null, maxlength: 200 },
  },
  { timestamps: true }
)

eventSchema.index({ weddingId: 1, date: 1 })

export const Event =
  (mongoose.models.Event as mongoose.Model<IEvent>) ??
  mongoose.model<IEvent>("Event", eventSchema)

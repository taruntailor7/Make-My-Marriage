import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IPhoto extends Document {
  weddingId: Types.ObjectId
  eventId: Types.ObjectId
  cloudinaryPublicId: string
  url: string
  thumbnailUrl: string
  uploadedBy: string | null
  isApproved: boolean
  createdAt: Date
}

const photoSchema = new Schema<IPhoto>({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  cloudinaryPublicId: { type: String, required: true },
  url: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  uploadedBy: { type: String, default: null, trim: true, maxlength: 100 },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

photoSchema.index({ weddingId: 1, eventId: 1, createdAt: -1 })
photoSchema.index({ weddingId: 1, isApproved: 1 })

export const Photo =
  (mongoose.models.Photo as mongoose.Model<IPhoto>) ??
  mongoose.model<IPhoto>("Photo", photoSchema)

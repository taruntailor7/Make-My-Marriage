import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface ITask extends Document {
  weddingId: Types.ObjectId
  title: string
  description: string | null
  dueDate: Date | null
  assigneeId: Types.ObjectId | null
  eventId: Types.ObjectId | null
  isDone: boolean
  isFromTemplate: boolean
  createdAt: Date
  updatedAt: Date
  isOverdue: boolean
}

const taskSchema = new Schema<ITask>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, default: null, maxlength: 2000 },
    dueDate: { type: Date, default: null },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", default: null },
    isDone: { type: Boolean, default: false },
    isFromTemplate: { type: Boolean, default: false },
  },
  { timestamps: true }
)

taskSchema.index({ weddingId: 1, isDone: 1 })
taskSchema.index({ weddingId: 1, eventId: 1 })
taskSchema.index({ weddingId: 1, assigneeId: 1 })
taskSchema.index({ dueDate: 1 })

taskSchema.virtual("isOverdue").get(function (this: ITask) {
  return !this.isDone && this.dueDate !== null && this.dueDate < new Date()
})

taskSchema.set("toJSON", { virtuals: true })
taskSchema.set("toObject", { virtuals: true })

export const Task =
  (mongoose.models.Task as mongoose.Model<ITask>) ??
  mongoose.model<ITask>("Task", taskSchema)

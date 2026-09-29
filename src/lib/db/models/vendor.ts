import mongoose, { Schema, type Document, type Types } from "mongoose"

interface Payment {
  _id: Types.ObjectId
  label: string
  amount: number
  dueDate: Date | null
  isPaid: boolean
  paidDate: Date | null
  linkedExpenseId: Types.ObjectId | null
}

export interface IVendor extends Document {
  weddingId: Types.ObjectId
  name: string
  category: string
  phone: string | null
  email: string | null
  notes: string | null
  contractFile: string | null
  eventIds: Types.ObjectId[]
  payments: Payment[]
  createdAt: Date
  updatedAt: Date
  totalContractAmount: number
  totalPaid: number
  totalOutstanding: number
  nextPaymentDue: Payment | null
}

const vendorSchema = new Schema<IVendor>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    phone: { type: String, default: null, trim: true, maxlength: 15 },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    notes: { type: String, default: null, maxlength: 2000 },
    contractFile: { type: String, default: null },
    eventIds: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    payments: [
      {
        label: { type: String, required: true, trim: true, maxlength: 100 },
        amount: { type: Number, required: true, min: 0 },
        dueDate: { type: Date, default: null },
        isPaid: { type: Boolean, default: false },
        paidDate: { type: Date, default: null },
        linkedExpenseId: {
          type: Schema.Types.ObjectId,
          ref: "Expense",
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
)

vendorSchema.index({ weddingId: 1 })
vendorSchema.index({ weddingId: 1, category: 1 })

vendorSchema.virtual("totalContractAmount").get(function (this: IVendor) {
  return this.payments.reduce((sum, p) => sum + p.amount, 0)
})

vendorSchema.virtual("totalPaid").get(function (this: IVendor) {
  return this.payments
    .filter((p) => p.isPaid)
    .reduce((sum, p) => sum + p.amount, 0)
})

vendorSchema.virtual("totalOutstanding").get(function (this: IVendor) {
  return this.totalContractAmount - this.totalPaid
})

vendorSchema.virtual("nextPaymentDue").get(function (this: IVendor) {
  return (
    this.payments
      .filter((p) => !p.isPaid && p.dueDate)
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0] ?? null
  )
})

vendorSchema.set("toJSON", { virtuals: true })
vendorSchema.set("toObject", { virtuals: true })

export const Vendor =
  (mongoose.models.Vendor as mongoose.Model<IVendor>) ??
  mongoose.model<IVendor>("Vendor", vendorSchema)

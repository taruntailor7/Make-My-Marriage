import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IExpense extends Document {
  weddingId: Types.ObjectId
  amount: number
  category: string
  date: Date
  vendorId: Types.ObjectId | null
  vendorPaymentIndex: number | null
  paymentMethod: string | null
  funder: string | null
  notes: string | null
  receiptPhoto: string | null
  createdAt: Date
  updatedAt: Date
}

const expenseSchema = new Schema<IExpense>(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    date: { type: Date, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", default: null },
    vendorPaymentIndex: { type: Number, default: null, min: 0 },
    paymentMethod: { type: String, default: null, trim: true, maxlength: 50 },
    funder: { type: String, default: null, trim: true, maxlength: 50 },
    notes: { type: String, default: null, maxlength: 1000 },
    receiptPhoto: { type: String, default: null },
  },
  { timestamps: true }
)

expenseSchema.index({ weddingId: 1, category: 1 })
expenseSchema.index({ weddingId: 1, funder: 1 })
expenseSchema.index({ weddingId: 1, vendorId: 1 })
expenseSchema.index({ weddingId: 1, date: -1 })

export const Expense =
  (mongoose.models.Expense as mongoose.Model<IExpense>) ??
  mongoose.model<IExpense>("Expense", expenseSchema)

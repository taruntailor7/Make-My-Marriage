import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string | null
  emailVerified: Date | null
  phone: string | null
  image: string | null
  hashedPassword?: string
  resetToken?: string
  resetTokenExpiry?: Date
  passwordChangedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      sparse: true,
      unique: true,
      default: null,
    },
    emailVerified: { type: Date, default: null },
    phone: {
      type: String,
      trim: true,
      maxlength: 15,
      match: /^\+?[1-9]\d{6,14}$/,
      sparse: true,
      unique: true,
      default: null,
    },
    image: { type: String, default: null },
    hashedPassword: { type: String, select: false },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ??
  mongoose.model<IUser>("User", userSchema)

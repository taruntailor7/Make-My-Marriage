"use server"

import bcrypt from "bcryptjs"
import crypto from "crypto"
import { actionClient } from "./safe-action"
import { signUpSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth.schema"
import { User } from "@/lib/db/models"

export const signUpAction = actionClient
  .schema(signUpSchema)
  .action(async ({ parsedInput: { name, email, password, phone } }) => {
    const existing = await User.findOne({ email })
    if (existing) {
      throw new Error("An account with this email already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      name,
      email,
      hashedPassword,
      phone: phone || null,
    })

    return { userId: user._id.toString() }
  })

export const forgotPasswordAction = actionClient
  .schema(forgotPasswordSchema)
  .action(async ({ parsedInput: { email } }) => {
    const user = await User.findOne({ email })

    // Always return success to prevent email enumeration
    if (!user) return { sent: true }

    const token = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store hashed token on user (we'll use a simple field approach)
    await User.updateOne(
      { _id: user._id },
      { $set: { resetToken: hashedToken, resetTokenExpiry: expires } }
    )

    // TODO: send email via Resend with link containing `token` (not hashedToken)
    // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    // await sendResetEmail(user.email, resetUrl)

    return { sent: true }
  })

export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { token, newPassword } }) => {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      throw new Error("Invalid or expired reset link")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await User.updateOne(
      { _id: user._id },
      {
        $set: { hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" },
      }
    )

    return { reset: true }
  })

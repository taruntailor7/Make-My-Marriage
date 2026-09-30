"use server"

import bcrypt from "bcryptjs"
import crypto from "crypto"
import { Resend } from "resend"
import { actionClient } from "./safe-action"
import { signUpSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth.schema"
import { User } from "@/lib/db/models"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL ?? "Make My Marriage <noreply@makemymarriage.com>"

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

    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await User.updateOne(
      { _id: user._id },
      { $set: { resetToken: hashedToken, resetTokenExpiry: expires } }
    )

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your Make My Marriage password",
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <h1 style="font-size: 24px; color: #1A1A1A; margin-bottom: 16px;">Reset your password</h1>
          <p style="font-size: 14px; color: #6B6B6B; line-height: 1.6;">
            You requested a password reset for your Make My Marriage account. Click the button below to set a new password.
          </p>
          <a href="${resetUrl}" style="display: inline-block; margin-top: 24px; padding: 12px 32px; background-color: #C8A26B; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Reset Password
          </a>
          <p style="font-size: 12px; color: #9A9A9A; margin-top: 32px; line-height: 1.5;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })

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
        $set: { hashedPassword, passwordChangedAt: new Date() },
        $unset: { resetToken: "", resetTokenExpiry: "" },
      }
    )

    return { reset: true }
  })

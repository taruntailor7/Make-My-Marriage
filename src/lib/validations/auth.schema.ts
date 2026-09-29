import { z } from "zod"

export const signUpSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).max(128),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(128),
})

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  image: z.string().url().optional(),
})

export const switchWeddingSchema = z.object({
  weddingId: z.string(),
})

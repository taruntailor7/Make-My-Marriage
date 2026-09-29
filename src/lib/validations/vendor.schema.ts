import { z } from "zod"

export const createVendorSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(50),
  phone: z.string().max(15).optional(),
  email: z.string().email().max(255).optional(),
  notes: z.string().max(2000).optional(),
  contractFile: z.string().url().optional(),
  eventIds: z.array(z.string()).optional(),
})

export const updateVendorSchema = z.object({
  vendorId: z.string(),
  ...createVendorSchema.partial().shape,
})

export const deleteVendorSchema = z.object({
  vendorId: z.string(),
})

export const addPaymentSchema = z.object({
  vendorId: z.string(),
  label: z.string().trim().min(1).max(100),
  amount: z.number().min(0),
  dueDate: z.coerce.date().optional(),
})

export const markPaymentPaidSchema = z.object({
  vendorId: z.string(),
  paymentId: z.string(),
})

export const removePaymentSchema = z.object({
  vendorId: z.string(),
  paymentId: z.string(),
})

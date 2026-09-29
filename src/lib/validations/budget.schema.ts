import { z } from "zod"

export const createExpenseSchema = z.object({
  amount: z.number().min(0),
  category: z.string().trim().min(1).max(50),
  date: z.coerce.date(),
  vendorId: z.string().optional(),
  paymentMethod: z.string().trim().max(50).optional(),
  funder: z.string().trim().max(50).optional(),
  notes: z.string().max(1000).optional(),
  receiptPhoto: z.string().url().optional(),
})

export const updateExpenseSchema = z.object({
  expenseId: z.string(),
  ...createExpenseSchema.partial().shape,
})

export const deleteExpenseSchema = z.object({
  expenseId: z.string(),
})

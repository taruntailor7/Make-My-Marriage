import { z } from "zod"

export const createWeddingSchema = z
  .object({
    name: z.string().trim().min(2).max(200),
    slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    coverPhoto: z.string().url().optional(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  })

export const updateWeddingSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  coverPhoto: z.string().url().nullable().optional(),
  rsvpCutoffDate: z.coerce.date().nullable().optional(),
  galleryModerationEnabled: z.boolean().optional(),
})

export const updateBudgetCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      key: z.string().trim().min(1).max(50),
      label: z.string().trim().min(1).max(100),
      target: z.number().min(0).nullable().optional(),
    })
  ),
})

export const updateFundersSchema = z.object({
  funders: z.array(
    z.object({
      key: z.string().trim().min(1).max(50),
      label: z.string().trim().min(1).max(100),
    })
  ),
})

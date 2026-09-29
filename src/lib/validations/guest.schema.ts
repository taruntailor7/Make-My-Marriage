import { z } from "zod"

export const createGuestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  email: z.string().email().max(255).optional(),
  relation: z.string().trim().max(100).optional(),
  side: z.enum(["bride", "groom", "joint"]),
  plusOnesAllowed: z.number().min(0).max(20).default(0),
  eventIds: z.array(z.string()).min(1),
})

export const updateGuestSchema = z.object({
  guestId: z.string(),
  ...createGuestSchema.partial().shape,
})

export const deleteGuestSchema = z.object({
  guestId: z.string(),
})

export const importGuestsSchema = z.object({
  csvData: z.string(),
  columnMapping: z.record(z.string(), z.string()),
})

export const listGuestsFilterSchema = z.object({
  side: z.enum(["bride", "groom", "joint"]).optional(),
  eventId: z.string().optional(),
  hasResponded: z.boolean().optional(),
  search: z.string().trim().max(100).optional(),
})

export const bulkAssignEventSchema = z.object({
  guestIds: z.array(z.string()).min(1),
  eventId: z.string(),
  action: z.enum(["add", "remove"]),
})

export const getGuestRsvpLinkSchema = z.object({
  guestId: z.string(),
})

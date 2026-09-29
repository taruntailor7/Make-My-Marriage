import { z } from "zod"

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const createEventSchema = z.object({
  name: z.string().trim().min(1).max(200),
  date: z.coerce.date(),
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  venue: z.string().trim().max(500).optional(),
  eventType: z.enum([
    "haldi",
    "mehendi",
    "sangeet",
    "wedding",
    "reception",
    "other",
  ]),
  notes: z.string().max(2000).optional(),
  dressCode: z.string().max(200).optional(),
})

export const updateEventSchema = z.object({
  eventId: z.string(),
  ...createEventSchema.partial().shape,
})

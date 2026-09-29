import { z } from "zod"

export const submitRsvpSchema = z.object({
  rsvps: z.array(
    z.object({
      eventId: z.string(),
      attending: z.boolean(),
      headcount: z.number().min(1).max(21),
      dietaryNote: z.string().max(500).optional(),
    })
  ),
})

export const confirmGalleryUploadSchema = z.object({
  cloudinaryPublicId: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url(),
  uploadedBy: z.string().trim().max(100).optional(),
})

export const uploadSignSchema = z.object({
  context: z.enum(["gallery", "receipt", "contract", "cover"]),
  eventId: z.string().optional(),
})

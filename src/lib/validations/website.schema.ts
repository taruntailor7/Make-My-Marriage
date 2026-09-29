import { z } from "zod"

export const updateWebsiteContentSchema = z.object({
  sections: z.object({
    story: z
      .object({
        enabled: z.boolean(),
        content: z.string().max(5000),
      })
      .partial()
      .optional(),
    schedule: z.object({ enabled: z.boolean() }).partial().optional(),
    venue: z.object({ enabled: z.boolean() }).partial().optional(),
    registry: z
      .object({
        enabled: z.boolean(),
        content: z.string().max(2000),
      })
      .partial()
      .optional(),
    faq: z
      .object({
        enabled: z.boolean(),
        items: z.array(
          z.object({
            q: z.string().max(500),
            a: z.string().max(2000),
          })
        ),
      })
      .partial()
      .optional(),
    gallery: z.object({ enabled: z.boolean() }).partial().optional(),
    livestream: z
      .object({
        enabled: z.boolean(),
        embedUrl: z.string().url().max(500).nullable(),
      })
      .partial()
      .optional(),
  }),
})

export const setWebsiteTemplateSchema = z.object({
  templateId: z.string(),
})

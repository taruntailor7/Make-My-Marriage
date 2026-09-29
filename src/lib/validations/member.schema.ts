import { z } from "zod"

export const generateInviteLinkSchema = z
  .object({
    role: z.enum(["owner", "family_admin", "event_coordinator"]),
    eventScope: z.array(z.string()).optional(),
  })
  .refine(
    (d) => {
      if (d.role === "event_coordinator")
        return d.eventScope && d.eventScope.length > 0
      return true
    },
    {
      message: "Event coordinators need at least one event",
      path: ["eventScope"],
    }
  )

export const updateMemberRoleSchema = z
  .object({
    memberId: z.string(),
    role: z.enum(["owner", "family_admin", "event_coordinator"]),
    eventScope: z.array(z.string()).optional(),
  })
  .refine(
    (d) => {
      if (d.role === "event_coordinator")
        return d.eventScope && d.eventScope.length > 0
      return true
    },
    {
      message: "Event coordinators need at least one event",
      path: ["eventScope"],
    }
  )

export const revokeMemberSchema = z.object({
  memberId: z.string(),
})

export const revokeInviteTokenSchema = z.object({
  tokenId: z.string(),
})

"use server"

import { actionClient } from "./safe-action"
import { createWeddingSchema, } from "@/lib/validations/wedding.schema"
import { switchWeddingSchema } from "@/lib/validations/auth.schema"
import { Wedding, DEFAULT_BUDGET_CATEGORIES, DEFAULT_FUNDERS, WeddingMember } from "@/lib/db/models"
import { auth } from "@/lib/auth/config"
import { slugify } from "@/lib/utils"

export const createWeddingAction = actionClient
  .schema(createWeddingSchema)
  .action(async ({ parsedInput: { name, slug: inputSlug, startDate, endDate, coverPhoto } }) => {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Not authenticated")

    const slug = inputSlug || slugify(name)

    const wedding = await Wedding.create({
      name,
      slug,
      startDate,
      endDate,
      coverPhoto: coverPhoto || null,
      createdBy: session.user.id,
      budgetCategories: DEFAULT_BUDGET_CATEGORIES,
      funders: DEFAULT_FUNDERS,
    })

    try {
      await WeddingMember.create({
        weddingId: wedding._id,
        userId: session.user.id,
        role: "owner",
        eventScope: [],
      })
    } catch (e) {
      await Wedding.deleteOne({ _id: wedding._id })
      throw e
    }

    return { weddingId: wedding._id.toString(), slug: wedding.slug }
  })

export const switchWeddingAction = actionClient
  .schema(switchWeddingSchema)
  .action(async ({ parsedInput: { weddingId } }) => {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Not authenticated")

    const membership = await WeddingMember.findOne({
      weddingId,
      userId: session.user.id,
    })

    if (!membership) throw new Error("No access to this wedding")

    return { weddingId }
  })

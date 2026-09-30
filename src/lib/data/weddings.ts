import { connectDB } from "@/lib/db/connection"
import { WeddingMember, Wedding } from "@/lib/db/models"
import type { IWedding, IWeddingMember } from "@/lib/db/models"

export interface UserWedding {
  _id: string
  name: string
  slug: string
  startDate: string
  endDate: string
  coverPhoto: string | null
  role: IWeddingMember["role"]
}

export async function getUserWeddings(userId: string): Promise<UserWedding[]> {
  await connectDB()

  const memberships = await WeddingMember.find({ userId }).lean()
  const weddingIds = memberships.map((m) => m.weddingId)
  const weddings = await Wedding.find({ _id: { $in: weddingIds } })
    .sort({ startDate: 1 })
    .lean()

  return weddings.map((w) => {
    const membership = memberships.find(
      (m) => m.weddingId.toString() === w._id.toString()
    )
    return {
      _id: w._id.toString(),
      name: w.name,
      slug: w.slug,
      startDate: w.startDate.toISOString(),
      endDate: w.endDate.toISOString(),
      coverPhoto: w.coverPhoto,
      role: membership?.role ?? "owner",
    }
  })
}

"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { ArrowRight, Calendar } from "lucide-react"
import { switchWeddingAction } from "@/lib/actions/wedding"
import type { UserWedding } from "@/lib/data/weddings"

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  owner: { bg: "bg-[#FFDDB0]", text: "text-[#5D4214]", label: "Owner" },
  family_admin: { bg: "bg-[#D5E0F8]", text: "text-[#3C475A]", label: "Family Admin" },
  event_coordinator: { bg: "bg-[#E8E8E6]", text: "text-[#4E453A]", label: "Coordinator" },
}

export function WeddingCard({ wedding, isActive }: { wedding: UserWedding; isActive: boolean }) {
  const router = useRouter()
  const { update } = useSession()
  const [loading, setLoading] = useState(false)

  const roleStyle = ROLE_STYLES[wedding.role] ?? ROLE_STYLES.owner
  const startStr = new Date(wedding.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
  const endStr = new Date(wedding.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })

  async function handleOpen() {
    setLoading(true)
    try {
      const result = await switchWeddingAction({ weddingId: wedding._id })
      if (result?.serverError) return
      await update({ activeWeddingId: wedding._id })
      router.push("/dashboard")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden relative group hover:shadow-xl transition-all flex flex-col justify-between ${isActive ? "ring-2 ring-[#C8A26B]" : ""}`}>
      {isActive && <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C8A26B] z-20" />}

      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-r from-[#C8A26B] via-[#9C7948] to-[#2F2921] flex items-center justify-between px-6">
        <div className="relative z-10 flex flex-col">
          <span className="text-xs text-white/80 tracking-widest uppercase">Wedding Workspace</span>
          <span className="text-4xl text-white tracking-wider font-light font-serif">
            {wedding.name
              .split(/[\s&]+/)
              .filter((w) => w.length > 1)
              .slice(0, 2)
              .map((w) => w[0])
              .join(" & ")}
          </span>
        </div>
        {isActive && (
          <span className="relative z-10 inline-flex items-center gap-1.5 bg-white text-[#C8A26B] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#C8A26B] animate-pulse" />
            Currently Active
          </span>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1">
            <h2 className="text-lg font-semibold text-[#1A1A1A] truncate">{wedding.name}</h2>
            <span className={`${roleStyle.bg} ${roleStyle.text} text-xs font-semibold px-2.5 py-1 rounded-full shrink-0`}>
              {roleStyle.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#4E453A] text-xs mt-2">
            <Calendar className="w-4 h-4 text-[#C8A26B]" />
            <span>{startStr} – {endStr}</span>
          </div>
        </div>

        <div className="pt-4 mt-4">
          <button
            onClick={handleOpen}
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-1 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 ${
              isActive
                ? "bg-[#C8A26B] text-white hover:bg-[#B8925B]"
                : "bg-[#E8E8E6] text-[#1A1A1A] hover:bg-[#C8A26B] hover:text-white"
            }`}
          >
            {loading ? "Switching..." : <>Open Dashboard <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  )
}

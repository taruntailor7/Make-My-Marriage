import type { Metadata } from "next"
import Link from "next/link"
import { Plus, ArrowRight, Calendar, ChevronRight } from "lucide-react"
import { auth } from "@/lib/auth/config"
import { getUserWeddings } from "@/lib/data/weddings"
import { redirect } from "next/navigation"
import { WeddingCard } from "./wedding-card"

export const metadata: Metadata = {
  title: "My Weddings — Make My Marriage",
}

export default async function WeddingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const weddings = await getUserWeddings(session.user.id)
  const activeWeddingId = session.user.activeWeddingId

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <div className="w-full bg-[#F4F4F2] py-4 px-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-base font-semibold text-[#1A1A1A]">Weddings Directory</span>
            <span className="text-[#4E453A] text-xs hidden sm:inline">/</span>
            <span className="text-xs uppercase tracking-wider text-[#C8A26B] hidden sm:inline font-medium">Portfolio Overview</span>
          </div>
          <Link
            href="/create-wedding"
            className="inline-flex items-center gap-1 bg-[#C8A26B] hover:bg-[#B8925B] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create New Wedding
          </Link>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto py-10 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C8A26B] font-medium">Active Engagements</span>
            <h1 className="font-serif text-[32px] leading-tight font-semibold text-[#1A1A1A] tracking-tight">My Weddings</h1>
            <p className="text-sm text-[#4E453A] mt-1">Switch between weddings you are hosting, coordinating, or attending.</p>
          </div>
        </div>

        {weddings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#C8A26B]/15 flex items-center justify-center text-[#C8A26B] mb-4">
              <Plus className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">No weddings yet</h2>
            <p className="text-sm text-[#4E453A] mb-6">Create your first wedding or join one with an invite link.</p>
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C8A26B] text-white font-medium hover:bg-[#B8925B] transition-all"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {weddings.map((wedding) => (
              <WeddingCard
                key={wedding._id}
                wedding={wedding}
                isActive={activeWeddingId === wedding._id}
              />
            ))}
          </div>
        )}

        {weddings.length > 0 && (
          <Link
            href="/create-wedding"
            className="mt-8 w-full rounded-xl bg-white hover:bg-[#F4F4F2] transition-all p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm group"
          >
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-14 h-14 rounded-full bg-[#E8E8E6] group-hover:bg-[#C8A26B] group-hover:text-white text-[#C8A26B] transition-colors flex items-center justify-center shrink-0">
                <Plus className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] group-hover:text-[#C8A26B] transition-colors">Hosting another celebration?</h3>
                <p className="text-sm text-[#4E453A] mt-0.5">Set up a new wedding workspace with guest list, timeline, and budget tracking.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 bg-[#E2E3E1] px-4 py-2 rounded-lg text-sm font-medium text-[#1A1A1A] group-hover:bg-[#C8A26B] group-hover:text-white transition-all shrink-0">
              Get Started <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}

import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/db/tenant-context"
import { Wedding } from "@/lib/db/models"
import { Sidebar, MobileTabBar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { auth } from "@/lib/auth/config"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await connectDB()

  let weddingName: string
  let userName: string
  let daysToGo: number

  try {
    const ctx = await getTenantContext()
    const wedding = await Wedding.findById(ctx.weddingId).lean()
    if (!wedding) redirect("/get-started")
    weddingName = wedding.name
    daysToGo = Math.max(0, Math.ceil((new Date(wedding.startDate).getTime() - Date.now()) / 86400000))
    const session = await auth()
    userName = session?.user?.name ?? "User"
  } catch {
    redirect("/get-started")
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Sidebar weddingName={weddingName} userName={userName} />
      <DashboardHeader daysToGo={daysToGo} />
      <main className="lg:pl-60 pt-16 pb-16 lg:pb-0 min-h-screen">
        <div className="px-4 sm:px-6 py-4">{children}</div>
      </main>
      <MobileTabBar />
    </div>
  )
}

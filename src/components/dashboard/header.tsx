"use client"

import { usePathname } from "next/navigation"
import { Bell, User } from "lucide-react"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/events": "Events",
  "/tasks": "Tasks",
  "/budget": "Budget",
  "/guests": "Guests",
  "/vendors": "Vendors",
  "/invitations": "Invitations",
  "/gallery": "Gallery",
  "/website": "Website",
  "/settings": "Settings",
}

export function DashboardHeader({ daysToGo }: { daysToGo: number }) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? "Dashboard"

  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 h-16 bg-white/90 backdrop-blur-xl z-40 flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight hidden sm:block">
        {title}
      </div>

      {/* Mobile title */}
      <div className="font-semibold text-lg text-[#1A1A1A] tracking-tight sm:hidden">
        {title}
      </div>

      <div className="flex items-center gap-4">
        {daysToGo > 0 && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFDDB0]/30 text-[#5D4214] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A26B] animate-pulse" />
            {daysToGo} days to go
          </div>
        )}

        <button className="relative p-1.5 text-[#4E453A] hover:text-[#1A1A1A] transition-colors rounded-full hover:bg-[#EEEEEC]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C8A26B]" />
        </button>

        <div className="w-8 h-8 rounded-full bg-[#775929] flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  )
}

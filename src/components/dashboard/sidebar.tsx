"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  LayoutGrid,
  Calendar,
  CheckSquare,
  Wallet,
  Users,
  Briefcase,
  Mail,
  Image,
  Globe,
  Settings,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/budget", icon: Wallet, label: "Budget" },
  { href: "/guests", icon: Users, label: "Guests" },
  { href: "/vendors", icon: Briefcase, label: "Vendors" },
  { href: "/invitations", icon: Mail, label: "Invitations" },
  { href: "/gallery", icon: Image, label: "Gallery" },
  { href: "/website", icon: Globe, label: "Website" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar({ weddingName, userName }: { weddingName: string; userName: string }) {
  const pathname = usePathname()

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#2F3130] z-50 hidden lg:flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Wedding switcher */}
        <div className="px-4 py-6">
          <Link
            href="/weddings"
            className="flex items-center justify-between p-2 rounded-lg bg-white/[0.06] hover:bg-white/10 transition-colors"
          >
            <div className="flex flex-col min-w-0 pr-1">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A26B]" />
                <span className="text-xs uppercase tracking-wider text-[#E9C086] font-medium">Active Plan</span>
              </div>
              <span className="text-base font-semibold text-[#F1F1EF] truncate">{weddingName}</span>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-[#C8C6C5] shrink-0" />
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 px-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm transition-all ${
                  isActive
                    ? "text-[#F1F1EF] bg-white/5 border-l-2 border-[#C8A26B] font-medium"
                    : "text-[#C8C6C5] hover:text-[#F1F1EF] hover:bg-white/5 border-l-2 border-transparent"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User section */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-4 bg-white/[0.02] hover:bg-white/[0.05] transition-colors w-full text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#C8A26B] flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-[#F1F1EF] truncate">{userName}</span>
              <span className="text-xs text-[#C8C6C5]">Log out</span>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-[#C8C6C5]" />
        </div>
      </button>
    </aside>
  )
}

/* ─── Mobile bottom tab bar ─── */
const MOBILE_TABS = [
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/guests", icon: Users, label: "Guests" },
  { href: "/budget", icon: Wallet, label: "Budget" },
  { href: "/settings", icon: Settings, label: "More" },
]

export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-[#E8E5E0] flex items-center justify-around h-14 safe-area-bottom">
      {MOBILE_TABS.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[10px] font-medium transition-colors ${
              isActive ? "text-[#C8A26B]" : "text-[#6B6B6B]"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

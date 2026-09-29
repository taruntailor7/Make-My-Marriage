"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} rounded-lg bg-[#1A1A1A] flex items-center justify-center relative overflow-hidden shadow-sm`}>
      <span className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A] to-[#1E293B] opacity-90" />
      <svg className="w-4 h-4 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="12" r="5" stroke="#C8A26B" />
        <circle cx="15" cy="12" r="5" stroke="#FAF4EB" strokeDasharray="24" strokeDashoffset="6" />
      </svg>
    </div>
  )
}

export { LogoMark }

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8E5E0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-semibold text-lg sm:text-xl tracking-tight text-[#1A1A1A] flex items-center gap-1">
            Make My Marriage
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A26B] inline-block mb-1" />
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#6B6B6B]">
          <a href="#features" className="hover:text-[#1A1A1A] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#1A1A1A] transition-colors">How It Works</a>
          <a href="#dashboard-preview" className="hover:text-[#1A1A1A] transition-colors">Command Center</a>
          <div className="relative group cursor-not-allowed">
            <span className="text-[#9A9A9A] flex items-center gap-1.5">
              Pricing
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#F5F3EF] text-[#6B6B6B] border border-[#E8E5E0]">Soon</span>
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-50 bg-[#1A1A1A] text-[#FAFAF8] text-xs px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
              100% Free during Beta release
            </div>
          </div>
        </nav>

        <div className="hidden sm:flex items-center gap-5">
          <Link href="/login" className="text-[15px] font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Log In</Link>
          <Link href="/signup" className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#C8A26B] hover:bg-[#B8925B] text-white text-[14px] font-medium tracking-wide shadow-sm transition-all">
            Get Started Free
          </Link>
        </div>

        {/* Fix 2: accessible hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#1A1A1A] hover:bg-[#F5F3EF]"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden px-4 pt-2 pb-6 border-b border-[#E8E5E0] bg-white space-y-3">
          <a href="#features" className="block py-2 text-[#6B6B6B] font-medium" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" className="block py-2 text-[#6B6B6B] font-medium" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#dashboard-preview" className="block py-2 text-[#6B6B6B] font-medium" onClick={() => setOpen(false)}>Command Center</a>
          <div className="py-2 text-[#9A9A9A] flex items-center justify-between text-sm">
            <span>Pricing</span>
            <span className="text-[11px] bg-[#F5F3EF] px-2 py-0.5 rounded border border-[#E8E5E0]">Free Beta</span>
          </div>
          <div className="pt-3 border-t border-[#E8E5E0] flex flex-col gap-2.5">
            <Link href="/login" className="w-full text-center py-2 text-sm font-medium text-[#1A1A1A]">Log In</Link>
            <Link href="/signup" className="w-full text-center py-2.5 rounded-lg bg-[#C8A26B] text-white text-sm font-medium">Get Started Free</Link>
          </div>
        </div>
      )}
    </header>
  )
}

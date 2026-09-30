"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Heart,
  CalendarDays,
  Camera,
  CheckSquare,
  Users2,
  Settings2,
  Rocket,
} from "lucide-react"
import { createWeddingAction } from "@/lib/actions/wedding"
import { createWeddingSchema } from "@/lib/validations/wedding.schema"
import { slugify } from "@/lib/utils"

const STEPS = [
  { num: 1, label: "Details" },
  { num: 2, label: "All Set" },
]

export function CreateWeddingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  function handleNameChange(val: string) {
    setName(val)
    setSlug(slugify(val))
  }

  async function handleCreate() {
    setError("")
    const parsed = createWeddingSchema.safeParse({
      name,
      slug: slug || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }

    setLoading(true)
    const result = await createWeddingAction(parsed.data)
    setLoading(false)

    if (result?.serverError) {
      setError(result.serverError)
      return
    }

    setStep(2)
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-6 sm:px-8">
      {/* Tab bar */}
      <div className="flex items-center justify-between bg-[#E8E8E6] p-1.5 rounded-xl mb-10 shadow-sm">
        {STEPS.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => { if (s.num < step) setStep(s.num) }}
            className={`flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
              s.num === step
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : s.num < step
                ? "text-[#1A1A1A] cursor-pointer"
                : "text-[#4E453A]/60"
            }`}
          >
            {s.num}. {s.label}
          </button>
        ))}
      </div>

      {/* Stepper dots */}
      <div className="relative mb-12">
        <div className="flex items-center justify-between relative z-10">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold transition-all ${
                  s.num < step
                    ? "bg-[#C8A26B] text-white shadow-sm"
                    : s.num === step
                    ? "bg-[#C8A26B] text-white shadow-sm ring-4 ring-[#C8A26B]/20"
                    : "bg-[#E8E8E6] text-[#4E453A]/60"
                }`}>
                  {s.num < step ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  s.num <= step ? "text-[#1A1A1A] font-semibold" : "text-[#4E453A]/60"
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-3 bg-[#E8E8E6] rounded-full overflow-hidden">
                  <div className={`h-full bg-[#C8A26B] transition-all duration-500 ${
                    step > s.num ? "w-full" : "w-0"
                  }`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#C8A26B]/10 blur-3xl pointer-events-none" />

        {/* ─── STEP 1: Details ─── */}
        {step === 1 && (
          <div className="space-y-8 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEEEC] text-[#4E453A] text-xs uppercase tracking-wider mb-3">
                <Heart className="w-3 h-3" /> Step 1 of 2
              </span>
              <h1 className="font-serif text-[32px] leading-tight font-semibold text-[#1A1A1A] tracking-tight">
                Tell us about your wedding
              </h1>
              <p className="text-sm text-[#4E453A] mt-1.5">Set up the foundation for your celebrations.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[#FFDAD6] text-[#93000A] text-sm">{error}</div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A1A1A]">Wedding Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Riya & Arjun's Wedding"
                  className="w-full h-11 px-4 rounded-lg bg-[#F4F4F2] text-[#1A1A1A] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A26B] transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#1A1A1A]">Custom URL Slug</label>
                  <span className="text-xs text-[#4E453A]">Public Web Link</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4E453A] text-xs font-mono select-none">
                    makemymarriage.app/w/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full h-11 pl-44 sm:pl-48 pr-4 rounded-lg bg-[#F4F4F2] text-[#1A1A1A] text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A26B] transition-all"
                  />
                </div>
                {slug && (
                  <p className="text-xs text-[#C8A26B] flex items-center gap-1.5 pt-0.5">
                    Your wedding website: <span className="font-medium">makemymarriage.app/w/{slug}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#1A1A1A]">Wedding Starts</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4E453A] pointer-events-none" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#F4F4F2] text-[#1A1A1A] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A26B] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#1A1A1A]">Wedding Ends</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4E453A] pointer-events-none" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#F4F4F2] text-[#1A1A1A] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C8A26B] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1A1A1A]">
                  Cover Photo <span className="text-[#4E453A] font-normal">(Optional)</span>
                </label>
                <div className="group relative rounded-xl bg-[#F4F4F2]/70 hover:bg-[#F4F4F2] transition-all p-8 text-center cursor-pointer">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-[#C8A26B] group-hover:scale-105 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Upload wedding header photo</p>
                    <p className="text-xs text-[#4E453A]">PNG, JPG up to 10MB</p>
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 h-11 rounded-lg bg-[#C8A26B] text-white text-sm font-medium hover:bg-[#B8925B] transition-all shadow-sm disabled:opacity-70"
                >
                  {loading ? "Creating wedding..." : <>Create Wedding <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: All Set ─── */}
        {step === 2 && (
          <div className="space-y-8 relative z-10">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#C8A26B]/20 flex items-center justify-center text-[#C8A26B] mb-3">
                <Rocket className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-[32px] leading-tight font-semibold text-[#1A1A1A] tracking-tight">
                You&apos;re all set!
              </h2>
              <p className="text-sm text-[#4E453A]">
                Your wedding workspace is ready. Pick your next action or dive right in.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-xl bg-[#F4F4F2] flex flex-col justify-between opacity-60">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#C8A26B] shadow-sm">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1A1A1A]">Wedding Checklist</h3>
                    <p className="text-xs text-[#4E453A] mt-1">Apply curated 25+ milestone tasks tailored to your timeline.</p>
                  </div>
                </div>
                <div className="pt-4 text-xs text-[#9A9A9A]">Coming soon</div>
              </div>

              <div className="p-5 rounded-xl bg-[#F4F4F2] flex flex-col justify-between opacity-60">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#C8A26B] shadow-sm">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1A1A1A]">Invite Family</h3>
                    <p className="text-xs text-[#4E453A] mt-1">Share collaborator permissions with partner, parents, or vendors.</p>
                  </div>
                </div>
                <div className="pt-4 text-xs text-[#9A9A9A]">Coming soon</div>
              </div>

              <Link
                href="/dashboard"
                className="group p-5 rounded-xl bg-[#F4F4F2] hover:bg-[#EEEEEC] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#C8A26B] shadow-sm">
                    <Settings2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1A1A1A] group-hover:text-[#C8A26B] transition-colors">Full Dashboard</h3>
                    <p className="text-xs text-[#4E453A] mt-1">Access guest management, budgets, RSVPs, and website design.</p>
                  </div>
                </div>
                <div className="pt-4 flex items-center text-[#C8A26B] text-xs font-medium gap-1 group-hover:translate-x-1 transition-transform">
                  Direct access <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </div>

            <div className="pt-4 flex justify-end">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 h-11 rounded-lg bg-[#C8A26B] text-white text-sm font-medium hover:bg-[#B8925B] transition-all shadow-sm"
              >
                Enter Wedding Workspace <Rocket className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Security footer */}
      <div className="mt-8 flex items-center justify-center gap-6 text-[#4E453A] text-xs">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#775929]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          End-to-end encrypted
        </span>
        <span className="w-1 h-1 rounded-full bg-[#E8E8E6]" />
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#775929]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
          Customizable private RSVP link
        </span>
      </div>
    </div>
  )
}

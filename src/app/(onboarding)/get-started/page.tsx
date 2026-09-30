import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Link2, ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Get Started — Make My Marriage",
}

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Header */}
      <header className="w-full h-16 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C8A26B]" />
          <span className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight">Make My Marriage</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 md:py-24 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[320px] bg-gradient-to-tr from-[#FFDDB0]/20 via-[#D5E0F8]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge + heading */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#C8A26B]/15 text-[#775929] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
                <circle cx="9" cy="12" r="6" />
                <circle cx="15" cy="12" r="6" />
              </svg>
            </div>
            <span className="text-xs uppercase tracking-wider text-[#807569] font-medium">Workspace Initialization</span>
          </div>

          <div className="text-center max-w-xl mx-auto mb-10">
            <h1 className="font-serif text-[32px] leading-tight font-semibold text-[#1A1A1A] tracking-tight">
              Let&apos;s get started
            </h1>
            <p className="text-base text-[#4E453A] mt-1 font-normal">
              Create your first wedding workspace or connect to an existing planning team.
            </p>
          </div>

          {/* Two action cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 items-stretch">
            {/* Card 1: Create */}
            <div className="group relative bg-white rounded-xl p-6 md:p-8 shadow-[0_4px_24px_-4px_rgba(26,26,26,0.06)] hover:shadow-[0_12px_36px_-6px_rgba(119,89,41,0.12)] transition-all flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#FFDDB0]/15 rounded-full blur-2xl group-hover:bg-[#FFDDB0]/30 transition-colors pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#FFDDB0]/30 text-[#775929] flex items-center justify-center">
                    <Plus className="w-7 h-7" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#EEEEEC] text-[#4E453A] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#775929]" />
                    Primary Path
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight">Create a Wedding</h2>
                <p className="text-sm text-[#4E453A] mt-1 mb-6 leading-relaxed">
                  Start planning from scratch — coordinate ceremonies, curate guest lists, invite co-hosts, and track budgets in a single console.
                </p>
                <div className="space-y-1 mb-6">
                  <div className="flex items-center gap-1 text-[#4E453A]">
                    <CheckCircle2 className="w-4 h-4 text-[#775929]" />
                    <span className="text-xs">Custom timeline and multi-event schedules</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#4E453A]">
                    <CheckCircle2 className="w-4 h-4 text-[#775929]" />
                    <span className="text-xs">Granular family and planner access roles</span>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/create-wedding"
                  className="w-full inline-flex items-center justify-center gap-1 h-11 rounded-lg bg-[#C8A26B] text-white text-sm font-medium hover:bg-[#B8925B] transition-all shadow-sm"
                >
                  Create Wedding <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Join */}
            <div className="group relative bg-white rounded-xl p-6 md:p-8 shadow-[0_4px_24px_-4px_rgba(26,26,26,0.06)] hover:shadow-[0_12px_36px_-6px_rgba(26,26,26,0.08)] transition-all flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#D5E0F8]/20 rounded-full blur-2xl group-hover:bg-[#D5E0F8]/40 transition-colors pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#D5E0F8] text-[#545F73] flex items-center justify-center">
                    <Link2 className="w-7 h-7" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#EEEEEC] text-[#4E453A] font-medium">
                    Collaborator
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] tracking-tight">Have an invite link?</h2>
                <p className="text-sm text-[#4E453A] mt-1 mb-4 leading-relaxed">
                  Did a couple or event coordinator send you an access code or URL? Enter it below to link directly to their workspace.
                </p>
                <div className="space-y-1 mb-4">
                  <label htmlFor="invite-input" className="block text-xs text-[#4E453A]">
                    Invite Link or Passcode
                  </label>
                  <input
                    id="invite-input"
                    type="text"
                    placeholder="makemymarriage.app/invite/abc123"
                    className="w-full h-11 px-3.5 bg-[#F4F4F2] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#807569] focus:bg-white focus:outline-none transition-all"
                  />
                  <p className="text-xs text-[#807569] pt-0.5">
                    Paste the unique code from your invitation SMS or email.
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-center gap-1 h-11 rounded-lg bg-[#EEEEEC] text-[#9A9A9A] text-sm font-medium cursor-not-allowed"
                >
                  Join Workspace — Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-6 text-[#4E453A] text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#775929]" />
              Enterprise Security
            </span>
            <span className="text-[#D2C4B6]">·</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#775929]" />
              Real-time Sync
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

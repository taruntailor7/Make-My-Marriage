import Link from "next/link"
import {
  Calendar,
  Users,
  UserCheck,
  Wallet,
  Mail,
  Globe,
  Zap,
  Crown,
  ShieldCheck,
  ClipboardList,
  Check,
  CheckCircle2,
  LayoutDashboard,
  Briefcase,
  ChevronsUpDown,
  Gauge,
  CalendarRange,
  Users2,
  Banknote,
  ExternalLink,
  Settings,
  MapPin,
  Camera,
  Music,
  Link2,
  UtensilsCrossed,
  QrCode,
  MessageCircle,
  Layout,
  Sparkles,
  Wifi,
  Battery,
  Lock,
  Bell,
  Store,
  Smartphone,
  HeartHandshake,
  Receipt,
  CheckSquare,
} from "lucide-react"
import { LandingNav, LogoMark } from "@/components/landing/nav"

/* ─── Hero Dashboard Mockup ─── */
function HeroDashboardMockup() {
  return (
    <div className="w-full max-w-[530px] bg-white rounded-2xl border border-[#E8E5E0] shadow-[0_25px_60px_-15px_rgba(26,26,26,0.12)] overflow-hidden"
      style={{ transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)", transition: "transform 0.4s ease, box-shadow 0.4s ease" }}>
      {/* Window chrome */}
      <div className="bg-[#F7F6F2] px-4 py-3 border-b border-[#E8E5E0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#E0DDD5]" />
          <div className="w-3 h-3 rounded-full bg-[#E0DDD5]" />
          <div className="w-3 h-3 rounded-full bg-[#E0DDD5]" />
        </div>
        <div className="px-3 py-1 bg-white rounded-md border border-[#E8E5E0] text-[11px] text-[#6B6B6B] font-mono tracking-tight flex items-center gap-1.5">
          <Lock className="w-2.5 h-2.5 text-[#C8A26B]" />
          app.makemymarriage.io/riya-arjun
        </div>
        <Bell className="w-3.5 h-3.5 text-[#9A9A9A]" />
      </div>

      {/* Inner dashboard */}
      <div className="flex h-[420px] bg-[#FAFAF8]">
        {/* Mini sidebar */}
        <div className="w-[84px] sm:w-[108px] bg-white border-r border-[#E8E5E0] p-3 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 px-1 py-0.5">
              <div className="w-4 h-4 rounded bg-[#C8A26B]/20 flex items-center justify-center">
                <span className="text-[9px] font-bold text-[#C8A26B]">M</span>
              </div>
              <span className="text-[11px] font-semibold tracking-tight truncate">Workspace</span>
            </div>
            <div className="space-y-1 text-[11px] font-medium">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#FAF4EB] text-[#C8A26B] font-semibold">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </div>
              {[
                { icon: Calendar, label: "Events" },
                { icon: Users, label: "Guests" },
                { icon: Wallet, label: "Budget" },
                { icon: Store, label: "Vendors" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[#6B6B6B]">
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-[#E8E5E0] flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white text-[10px] flex items-center justify-center font-medium">RA</div>
            <div className="hidden sm:block text-[10px] text-[#1A1A1A] truncate font-medium">Couple Admin</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto no-scrollbar space-y-3.5">
          {/* Header card */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E8E5E0]">
            <div>
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#1A1A1A]">Riya & Arjun&apos;s Wedding</h4>
              <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-[#C8A26B]" /> Udaipur, Rajasthan
              </p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#C8A26B] text-white text-[10px] font-semibold tracking-wide">
              48 days to go
            </span>
          </div>

          {/* Events row */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-[#6B6B6B] tracking-wider">Scheduled Events</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { date: "DEC 12", name: "Mehendi", venue: "Poolside Lawn", highlight: false },
                { date: "DEC 13", name: "Sangeet", venue: "Grand Ballroom", highlight: false },
                { date: "DEC 14", name: "Wedding", venue: "Palace Courtyard", highlight: true },
                { date: "DEC 15", name: "Reception", venue: "Lake Terrace", highlight: false },
              ].map((e) => (
                <div key={e.name} className={`bg-white p-2 rounded-lg border ${e.highlight ? "border-[#C8A26B]/60 bg-[#FAF4EB]/30" : "border-[#E8E5E0]"}`}>
                  <div className="text-[9px] text-[#C8A26B] font-bold">{e.date}</div>
                  <div className="text-[11px] font-semibold text-[#1A1A1A] truncate">{e.name}</div>
                  <div className="text-[9px] text-[#9A9A9A]">{e.venue}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-2.5 rounded-xl border border-[#E8E5E0]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#6B6B6B] font-medium">Guests RSVP</span>
                <span className="text-[10px] font-bold text-[#C8A26B]">268 / 324</span>
              </div>
              <div className="text-sm font-bold text-[#1A1A1A]">324 Invited</div>
              <div className="w-full h-1.5 bg-[#F5F3EF] rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-[#C8A26B] rounded-full" style={{ width: "82%" }} />
              </div>
              <div className="text-[9px] text-[#9A9A9A] mt-1">82% Confirmed attendance</div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#E8E5E0]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#6B6B6B] font-medium">Budget Spent</span>
                <span className="text-[10px] font-bold text-[#1E293B]">78%</span>
              </div>
              <div className="text-sm font-bold text-[#1A1A1A]">₹12,50,000</div>
              <div className="w-full h-1.5 bg-[#F5F3EF] rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-[#1E293B] rounded-full" style={{ width: "78%" }} />
              </div>
              <div className="text-[9px] text-[#9A9A9A] mt-1">₹3,50,000 balance remaining</div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white p-2.5 rounded-xl border border-[#E8E5E0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">Priority Tasks</span>
              <span className="text-[9px] text-[#C8A26B] font-semibold">View 18 tasks →</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C8A26B] shrink-0" />
                <span className="line-through text-[#9A9A9A] truncate">Finalize choreographers for Sangeet</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#1A1A1A]">
                <div className="w-3.5 h-3.5 rounded-full border border-[#E8E5E0] shrink-0" />
                <span className="truncate">Review catering contract (Dessert counter)</span>
                <span className="text-[9px] bg-[#F5F3EF] text-[#6B6B6B] px-1 rounded ml-auto shrink-0">Mom</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#1A1A1A]">
                <div className="w-3.5 h-3.5 rounded-full border border-[#E8E5E0] shrink-0" />
                <span className="truncate">Send WhatsApp invites to outstation guests</span>
                <span className="text-[9px] bg-[#FAF4EB] text-[#C8A26B] font-medium px-1 rounded ml-auto shrink-0">Due today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Section 6: Full Dashboard Mockup ─── */
function FullDashboardMockup() {
  return (
    <div className="bg-[#FAFAF8] text-[#1A1A1A] rounded-xl border border-[#E8E5E0] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[560px]">
      {/* Sidebar */}
      <div className="w-full md:w-60 bg-white border-r border-[#E8E5E0] p-4 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Wedding switcher */}
          <div className="p-2.5 rounded-lg border border-[#E8E5E0] bg-[#FAFAF8] flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-md bg-[#C8A26B] text-white font-serif font-bold text-xs flex items-center justify-center shrink-0">
                R&A
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#1A1A1A] truncate">Riya & Arjun</div>
                <div className="text-[10px] text-[#6B6B6B]">Main Wedding · 2025</div>
              </div>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-[#9A9A9A] shrink-0" />
          </div>

          {/* Nav */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9A9A9A] px-2 mb-1.5">Workspace</div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FAF4EB] text-[#C8A26B] font-medium text-xs">
              <span className="flex items-center gap-2.5"><Gauge className="w-4 h-4" /> Command Center</span>
              <span className="w-2 h-2 rounded-full bg-[#C8A26B]" />
            </div>
            {[
              { icon: CalendarRange, label: "6 Wedding Events", badge: "Live" },
              { icon: Users2, label: "Guest Masterlist", badge: "324", badgeGold: true },
              { icon: Banknote, label: "Budget & Expenses", badge: "₹12.5L" },
              { icon: Briefcase, label: "Vendor Contracts", badge: "14" },
              { icon: Globe, label: "Wedding Website", link: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-lg text-[#6B6B6B] font-medium text-xs">
                <span className="flex items-center gap-2.5"><item.icon className="w-4 h-4" /> {item.label}</span>
                {item.link ? (
                  <ExternalLink className="w-3 h-3 text-[#9A9A9A]" />
                ) : (
                  <span className={`text-[10px] ${item.badgeGold ? "text-[#C8A26B] font-semibold" : "text-[#9A9A9A]"} ${!item.badgeGold && item.badge !== "₹12.5L" && item.badge !== "14" ? "bg-[#F5F3EF] px-1.5 py-0.5 rounded" : ""}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User */}
        <div className="pt-4 border-t border-[#E8E5E0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-xs flex items-center justify-center font-medium">RA</div>
            <div className="text-[11px] leading-tight">
              <div className="font-semibold text-[#1A1A1A]">Riya Sharma</div>
              <div className="text-[#C8A26B] text-[10px]">Bride (Co-Owner)</div>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-[#9A9A9A]" />
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-6 overflow-x-hidden">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Timeline", icon: Calendar, value: "6 Events", sub: "Dec 12 - Dec 15", subColor: "text-emerald-600", dot: true },
            { label: "Guests Confirmed", icon: Users, value: "324 Guests", sub: "268 RSVP Confirmed (82%)", subColor: "text-[#C8A26B] font-medium" },
            { label: "Allocated Spend", icon: Receipt, value: "₹12.5L", sub: "78% of ₹16.0L cap", subColor: "text-[#6B6B6B]" },
            { label: "Action Items", icon: CheckSquare, value: "18 Pending", sub: "4 Due this week", subColor: "text-amber-600 font-medium" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-4 rounded-xl border border-[#E8E5E0]">
              <div className="flex items-center justify-between text-[#6B6B6B] mb-1">
                <span className="text-xs font-medium">{s.label}</span>
                <s.icon className="w-4 h-4 text-[#C8A26B]" />
              </div>
              <div className="text-2xl font-bold text-[#1A1A1A]">{s.value}</div>
              <div className={`text-[11px] mt-1 flex items-center gap-1 ${s.subColor}`}>
                {s.dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-white p-5 rounded-xl border border-[#E8E5E0]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-sm text-[#1A1A1A]">Multi-Day Master Timeline</h4>
              <p className="text-xs text-[#6B6B6B]">Coordinated schedules with venues, caterers, and transport</p>
            </div>
            <button className="px-2.5 py-1 text-xs rounded border border-[#E8E5E0] text-[#1A1A1A] font-medium">Add Event +</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { day: "Day 1 · Morning", name: "Haldi Ceremony", time: "9:30 AM · Shanti Villa", guests: "75 Family Guests", status: "✓ Ready", statusColor: "text-emerald-700" },
              { day: "Day 1 · Evening", name: "Mehendi & High Tea", time: "4:00 PM · Lakeview Pavilion", guests: "140 Guests", status: "✓ Artists booked", statusColor: "text-emerald-700" },
              { day: "Day 2 · Night", name: "Grand Sangeet", time: "7:30 PM · The Oberoi Lawn", guests: "290 Guests", status: "Sound check 3PM", statusColor: "text-[#C8A26B]", highlight: true },
              { day: "Day 3 · Auspicious", name: "Pheras & Reception", time: "5:00 PM · City Palace", guests: "324 Guests", status: "Baraat 4:30 PM", statusColor: "text-[#6B6B6B]" },
            ].map((e) => (
              <div key={e.name} className={`p-3.5 rounded-lg border ${e.highlight ? "border-[#C8A26B]/40 bg-[#FAF4EB]/40" : "border-[#E8E5E0] bg-[#FAFAF8]"}`}>
                <div className="text-[10px] font-bold text-[#C8A26B] uppercase tracking-wider mb-1">{e.day}</div>
                <div className="font-bold text-xs text-[#1A1A1A] mb-1">{e.name}</div>
                <div className="text-[11px] text-[#6B6B6B]">{e.time}</div>
                <div className="mt-2 pt-2 border-t border-[#E8E5E0] flex justify-between text-[10px]">
                  <span className="text-[#9A9A9A]">{e.guests}</span>
                  <span className={`font-medium ${e.statusColor}`}>{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E8E5E0]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Recent Collaboration</span>
              <span className="text-[10px] text-[#9A9A9A]">Real-time sync</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white text-[10px] flex items-center justify-center font-medium shrink-0 mt-0.5">VK</div>
                <div>
                  <span className="font-semibold text-[#1A1A1A]">Vikram (Dad)</span> marked caterer advance payment of ₹1,50,000 as <span className="text-emerald-700 font-medium">Paid</span>.
                  <div className="text-[10px] text-[#9A9A9A]">24 minutes ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#C8A26B] text-white text-[10px] flex items-center justify-center font-medium shrink-0 mt-0.5">RS</div>
                <div>
                  <span className="font-semibold text-[#1A1A1A]">Riya</span> added 14 guests from Kolkata relatives list to Sangeet.
                  <div className="text-[10px] text-[#9A9A9A]">2 hours ago</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8E5E0]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Vendor Contracts Due</span>
              <span className="text-[10px] text-[#C8A26B] font-semibold">2 pending sign-off</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#F5F3EF]">
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-[#6B6B6B]" />
                  <span className="font-medium text-[#1A1A1A] truncate">Cinematography Team</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">Contract Signed</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#F5F3EF]">
                <div className="flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-[#6B6B6B]" />
                  <span className="font-medium text-[#1A1A1A] truncate">DJ & Sound Production</span>
                </div>
                <span className="text-[11px] font-bold text-amber-700">Advance Due Tomorrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Phone Mockup (RSVP) ─── */
function PhoneMockup() {
  return (
    <div className="w-full max-w-[340px] bg-[#111111] p-3.5 rounded-[40px] shadow-[0_25px_60px_-15px_rgba(26,26,26,0.2)] border border-[#1A1A1A]">
      <div className="bg-[#FAFAF8] rounded-[30px] overflow-hidden border border-[#E8E5E0] flex flex-col h-[560px]">
        {/* Status bar */}
        <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[10px] text-[#9A9A9A]">
          <span>9:41</span>
          <div className="w-16 h-3 bg-[#1A1A1A] rounded-full mx-auto" />
          <div className="flex items-center gap-1">
            <Wifi className="w-2.5 h-2.5" />
            <Battery className="w-3 h-3" />
          </div>
        </div>

        <div className="p-4 space-y-3.5 overflow-y-auto no-scrollbar">
          <div className="text-center pb-2 border-b border-[#E8E5E0]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C8A26B]">Exclusive Invitation</span>
            <h4 className="font-serif text-base font-bold text-[#1A1A1A] mt-0.5">Riya & Arjun&apos;s Wedding</h4>
            <p className="text-xs text-[#6B6B6B] mt-1">Hi Priya, you&apos;re invited to:</p>
          </div>

          <button className="w-full py-2 px-3 rounded-lg bg-[#C8A26B] text-white text-xs font-semibold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Attending Everything
          </button>

          {[
            { name: "Sangeet Night", date: "Dec 13 · 7:30 PM" },
            { name: "Wedding & Pheras", date: "Dec 14 · 5:00 PM" },
            { name: "Reception Dinner", date: "Dec 15 · 8:00 PM" },
          ].map((event) => (
            <div key={event.name} className="p-2.5 rounded-xl bg-white border border-[#E8E5E0] space-y-1.5">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-[#1A1A1A]">{event.name}</div>
                  <div className="text-[10px] text-[#6B6B6B]">{event.date}</div>
                </div>
                <div className="flex items-center bg-[#F5F3EF] rounded-md p-0.5 text-[10px]">
                  <span className="px-2 py-0.5 bg-[#C8A26B] text-white rounded font-medium">Yes</span>
                  <span className="px-2 py-0.5 text-[#6B6B6B]">No</span>
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[#1A1A1A]">Dietary Preferences</label>
            <div className="w-full text-xs p-2 rounded-lg bg-white border border-[#E8E5E0] text-[#1A1A1A]">
              Vegetarian / Jain meal requested
            </div>
          </div>

          <div className="pt-1">
            <button className="w-full py-2.5 rounded-lg bg-[#1A1A1A] text-[#FAFAF8] text-xs font-medium">
              Submit RSVP (2 Guests)
            </button>
            <div className="text-[10px] text-center text-[#9A9A9A] mt-1.5 flex items-center justify-center gap-1">
              <Check className="w-2.5 h-2.5 text-[#C8A26B]" /> Saved to Host Dashboard
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Data ─── */
const FEATURES = [
  { icon: Calendar, title: "Multi-Event Planning", desc: "Haldi, Mehendi, Sangeet, Wedding, Reception — each event with its own timeline, venue, and guest list.", tag: "Timeline engine & sub-schedules" },
  { icon: Users, title: "Family Collaboration", desc: "Invite parents, siblings, and coordinators. Everyone sees what they need — nothing more, nothing less.", tag: "Granular privacy controls" },
  { icon: UserCheck, title: "Guest Management & RSVP", desc: "Add 500+ guests, assign them to events, send per-event RSVPs, track dietary preferences and headcount.", tag: "Automated WhatsApp RSVP sync" },
  { icon: Wallet, title: "Budget & Vendor Tracking", desc: "Track every expense by category and who paid. Manage vendor contracts, payment schedules, and due dates.", tag: "Multi-payer & milestone reminders" },
  { icon: Mail, title: "Digital Invitations", desc: "Beautiful shareable invite cards for each event. Share on WhatsApp, no app download needed for guests.", tag: "No guest account creation" },
  { icon: Globe, title: "Wedding Website & Photo Gallery", desc: "A personal wedding website with your story, schedule, and a photo gallery guests upload to via QR code.", tag: "High-res guest photo vault" },
]

const ROLES = [
  {
    icon: Crown, title: "Owners", subtitle: "Bride & Groom",
    desc: "Full control over everything — events, budget, guests, vendors, website. Add co-owners for shared planning.",
    perks: ["Complete financial visibility", "Delete & archive rights", "Publish wedding website"],
  },
  {
    icon: ShieldCheck, title: "Family Admins", subtitle: "Parents & Close Family",
    desc: "Full planning access without account-level controls. Help manage events, guests, and budget alongside the couple.",
    perks: ["Add & RSVP family guests", "Record paid vendor advances", "Assign logistics duties"],
  },
  {
    icon: ClipboardList, title: "Event Coordinators", subtitle: "Friends & Helpers",
    desc: "Scoped to specific events only. A friend running the Sangeet sees only what they need — not the full guest list or budget.",
    perks: ["Specific single-event view", "Live check-in at entrance", "Strictly hidden finances"],
  },
]

const GUEST_FEATURES = [
  { icon: Link2, title: "Per-event RSVP via unique link — one tap to confirm", desc: "Send personalized links over WhatsApp or SMS. Guests open a clean, frictionless webpage with zero registration barriers." },
  { icon: UtensilsCrossed, title: "Dietary preferences and plus-ones captured automatically", desc: "Know exact headcount breakdown for Jain, Halal, Vegan, or children's portions before giving final counts to caterers." },
  { icon: QrCode, title: "QR code at the venue for instant photo sharing", desc: "Place tasteful minimal tent cards on dining tables. Guests snap candid phone photos that stream into your private gallery in full resolution." },
  { icon: MessageCircle, title: "Beautiful digital invite cards to share on WhatsApp", desc: "Generate optimized, elegant digital event cards tailored for WhatsApp previews with embedded venue maps and calendar adds." },
  { icon: Layout, title: "Personal wedding website with schedule, venue, and story", desc: "One canonical source of truth for outstation guests to check hotel check-in times, dress codes, shuttle routes, and Google Maps pins." },
]

const TRUST = [
  { icon: ShieldCheck, title: "Private & Secure", desc: "Your guest data never leaves your control" },
  { icon: Smartphone, title: "Works Everywhere", desc: "Phone, tablet, laptop — responsive design" },
  { icon: Zap, title: "Set Up in Minutes", desc: "Create your wedding and plan in < 2 minutes" },
  { icon: HeartHandshake, title: "Free to Start", desc: "No credit card, no trial period, just start" },
]

/* ─── Page ─── */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] antialiased selection:bg-[#C8A26B]/20">

      <LandingNav />

      <main>
        {/* ═══ HERO ═══ */}
        <section className="relative pt-12 pb-20 md:py-24 lg:py-28 overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col items-start z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF4EB] border border-[#E5CCA4]/40 text-[#C8A26B] text-xs sm:text-sm font-medium tracking-wide mb-6">
                  <span className="font-bold">✦</span> Built for Indian Weddings
                </div>
                <h1 className="font-serif text-[42px] sm:text-[54px] lg:text-[62px] leading-[1.12] font-bold text-[#1A1A1A] tracking-tight mb-6">
                  Your entire wedding.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A] to-[#755931]">One place.</span>
                </h1>
                <p className="text-lg sm:text-xl text-[#6B6B6B] leading-relaxed max-w-[480px] mb-8">
                  Manage events, guests, budget, vendors, and invitations — together with your family.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-6">
                  <Link href="/signup" className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-[#C8A26B] hover:bg-[#B8925B] text-white text-base font-medium shadow-md hover:shadow-lg transition-all text-center">
                    Get Started — Free
                  </Link>
                  <a href="#dashboard-preview" className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A]/5 text-base font-medium transition-colors text-center">
                    See How It Works
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-[#6B6B6B] flex items-center gap-2">
                  <span>Free to use</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-[#E8E5E0]" />
                  <span>No credit card required</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-[#E8E5E0]" />
                  <span>Set up in 2 minutes</span>
                </p>
              </div>

              <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#C8A26B]/15 to-transparent rounded-3xl blur-2xl -z-10 opacity-70" />
                <HeroDashboardMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PROBLEM RIBBON ═══ */}
        <section className="w-full bg-[#F5F3EF] border-y border-[#E8E5E0] py-12 md:py-14">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
            <h3 className="font-semibold text-base sm:text-lg text-[#1A1A1A] mb-1 tracking-tight">
              &ldquo;50 relatives. 7 events. 1 WhatsApp group that lost the caterer&rsquo;s number.&rdquo;
            </h3>
            <p className="text-sm text-[#6B6B6B]">Sound familiar? There&rsquo;s a better way.</p>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="py-20 md:py-28 bg-[#FAFAF8]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[40px] font-bold text-[#1A1A1A] mb-4 tracking-tight leading-tight">
                Everything you need. Nothing you don&apos;t.
              </h2>
              <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed">
                Plan every event from Haldi to Reception — with the people who matter most.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white rounded-2xl border border-[#E8E5E0] p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#FAF4EB] border border-[#E5CCA4]/30 flex items-center justify-center text-[#C8A26B] mb-6">
                      <f.icon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2.5">{f.title}</h3>
                    <p className="text-[15px] text-[#6B6B6B] leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#E8E5E0]/60 flex items-center text-xs font-medium text-[#C8A26B]">
                    {f.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" className="py-20 md:py-28 bg-white border-y border-[#E8E5E0]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-20">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[40px] font-bold text-[#1A1A1A] mb-3 tracking-tight">
                Up and running in 3 steps
              </h2>
              <p className="text-base text-[#6B6B6B]">Engineered to turn wedding chaos into quiet confidence in minutes.</p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-9 left-[15%] right-[15%] h-[1px] bg-[#C8A26B]/50 z-0" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
                {[
                  { step: "1", title: "Create your wedding", desc: "Set your wedding name, dates, and add your events — Haldi, Mehendi, Sangeet, Wedding, Reception." },
                  { step: "2", title: "Invite your team", desc: "Share invite links with family and coordinators. Each person gets the right level of access." },
                  { step: "3", title: "Plan everything together", desc: "Assign tasks, track budget, manage guests, send RSVPs, build your wedding website — all in one place." },
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="p-1 bg-white mb-6">
                      <div className="w-16 h-16 rounded-full border-2 border-[#C8A26B] flex items-center justify-center text-[#C8A26B] font-serif text-2xl font-bold bg-[#FAF4EB]/60">
                        {s.step}
                      </div>
                    </div>
                    <h3 className="font-semibold text-xl text-[#1A1A1A] mb-2.5">{s.title}</h3>
                    <p className="text-[15px] text-[#6B6B6B] leading-relaxed max-w-xs">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ DASHBOARD PREVIEW (dark) ═══ */}
        <section id="dashboard-preview" className="py-24 md:py-32 bg-[#111111] text-[#FAFAF8] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#C8A26B]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-[#C8A26B] font-semibold mb-3 inline-block">Centralized Control</span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] font-bold text-[#FAFAF8] mb-4 tracking-tight">
                Your wedding command center
              </h2>
              <p className="text-base sm:text-lg text-[#9A9A9A] leading-relaxed">
                Every event, every guest, every rupee — one dashboard.
              </p>
            </div>
            <div className="relative rounded-2xl border border-white/10 p-2 sm:p-4 bg-white/5 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.8)]"
              style={{ boxShadow: "0 20px 60px -15px rgba(200, 162, 107, 0.18)" }}>
              <FullDashboardMockup />
            </div>
          </div>
        </section>

        {/* ═══ ROLE-BASED ACCESS ═══ */}
        <section className="py-20 md:py-28 bg-[#FAFAF8]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[36px] font-bold text-[#1A1A1A] mb-3 tracking-tight">
                The right access for everyone
              </h2>
              <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed">
                Not everyone needs to see the budget. Smart permissions keep things simple.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ROLES.map((r) => (
                <div key={r.title} className="bg-white rounded-2xl border border-[#E8E5E0] p-8 hover:border-[#C8A26B]/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF4EB] border border-[#E5CCA4]/40 flex items-center justify-center text-[#C8A26B] mb-6">
                    <r.icon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-xl text-[#1A1A1A]">{r.title}</h3>
                    <p className="text-sm font-medium text-[#C8A26B] mt-0.5">{r.subtitle}</p>
                  </div>
                  <p className="text-[15px] text-[#6B6B6B] leading-relaxed mb-6">{r.desc}</p>
                  <div className="space-y-2 pt-4 border-t border-[#E8E5E0]/60 text-xs text-[#1A1A1A] font-medium">
                    {r.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#C8A26B]" /> {perk}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ GUEST EXPERIENCE ═══ */}
        <section className="py-20 md:py-28 bg-white border-y border-[#E8E5E0]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[36px] font-bold text-[#1A1A1A] mb-3 tracking-tight">
                Zero friction for your guests
              </h2>
              <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed">
                No app to download. No account to create. Just a link.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 flex justify-center">
                <PhoneMockup />
              </div>
              <div className="lg:col-span-6 space-y-6">
                {GUEST_FEATURES.map((feat) => (
                  <div key={feat.title} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF4EB] border border-[#E5CCA4]/30 flex items-center justify-center text-[#C8A26B] shrink-0 mt-1">
                      <feat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base sm:text-lg text-[#1A1A1A] mb-1">{feat.title}</h4>
                      <p className="text-[15px] text-[#6B6B6B] leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TRUST SIGNALS ═══ */}
        <section className="py-14 sm:py-16 bg-[#F5F3EF] border-b border-[#E8E5E0]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 text-center">
              {TRUST.map((t) => (
                <div key={t.title} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#E8E5E0] flex items-center justify-center text-[#C8A26B] mb-3 shadow-sm">
                    <t.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-base text-[#1A1A1A] mb-1">{t.title}</h4>
                  <p className="text-sm text-[#6B6B6B]">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-24 md:py-32 bg-[#111111] text-[#FAFAF8] relative overflow-hidden text-center">
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 h-32 bg-[#C8A26B]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[44px] font-bold text-[#FAFAF8] mb-4 tracking-tight leading-tight">
                Your wedding deserves better than a spreadsheet.
              </h2>
              <p className="text-base sm:text-lg text-[#9A9A9A] mb-9 max-w-lg mx-auto">
                Start planning with your family today. It&apos;s free.
              </p>
              <div className="flex flex-col items-center gap-3">
                <Link href="/signup" className="relative inline-flex items-center justify-center px-9 py-4 rounded-xl bg-[#C8A26B] hover:bg-[#B8925B] text-white text-base font-semibold tracking-wide shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ boxShadow: "0 0 50px -10px rgba(200, 162, 107, 0.35)" }}>
                  Get Started — Free
                </Link>
                <span className="text-xs sm:text-sm text-[#9A9A9A]">No credit card required</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#0A0A0A] text-[#FAFAF8] border-t border-[#222222] pt-16 pb-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-12 border-b border-[#222222]">
            <div className="flex items-center gap-2.5">
              <LogoMark className="w-7 h-7" />
              <span className="font-semibold text-lg text-white tracking-tight">Make My Marriage</span>
            </div>
            <p className="text-sm text-[#9A9A9A]">Your entire wedding. One place.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Product</div>
              <ul className="space-y-2 text-sm text-[#9A9A9A]">
                <li><a href="#features" className="hover:text-[#C8A26B] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-[#C8A26B] transition-colors">How It Works</a></li>
                <li><a href="#dashboard-preview" className="hover:text-[#C8A26B] transition-colors">Command Center</a></li>
                <li className="flex items-center gap-1.5 text-[#9A9A9A]/70">
                  <span>Pricing</span>
                  <span className="text-[10px] bg-white/10 text-[#9A9A9A] px-1.5 py-0.5 rounded">Coming Soon</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Legal</div>
              <ul className="space-y-2 text-sm text-[#9A9A9A]">
                <li><a href="#" className="hover:text-[#C8A26B] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#C8A26B] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#C8A26B] transition-colors">Security Standards</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Connect</div>
              <ul className="space-y-2 text-sm text-[#9A9A9A]">
                <li><a href="#" className="hover:text-[#C8A26B] transition-colors">Twitter / X</a></li>
                <li><a href="#" className="hover:text-[#C8A26B] transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-[#C8A26B] transition-colors">LinkedIn</a></li>
                <li><a href="mailto:hello@makemymarriage.com" className="hover:text-[#C8A26B] transition-colors">hello@makemymarriage.com</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Engineering</div>
              <p className="text-xs text-[#9A9A9A] leading-relaxed">
                Crafted for modern couples and Indian families coordinating multi-day festivities with precision.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-[#C8A26B]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 99.99% Systems Uptime
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9A9A9A]">
            <div>© {new Date().getFullYear()} Make My Marriage. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Designed with warm elegance</span>
              <span className="w-1 h-1 rounded-full bg-[#9A9A9A]" />
              <span>Made for modern Indian weddings</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

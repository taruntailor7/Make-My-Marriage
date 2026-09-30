import type { Metadata } from "next"
import { connectDB } from "@/lib/db/connection"
import { getTenantContext } from "@/lib/db/tenant-context"
import { Wedding } from "@/lib/db/models"
import { auth } from "@/lib/auth/config"
import {
  Calendar,
  Users,
  Wallet,
  CheckSquare,
  Clock,
  MapPin,
  Plus,
} from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Dashboard — Make My Marriage",
}

export default async function DashboardPage() {
  await connectDB()
  const ctx = await getTenantContext()
  const wedding = await Wedding.findById(ctx.weddingId).lean()
  if (!wedding) return null

  const [events, guestCount, pendingTasks, overdueTasks, spent, recentTasks] = await Promise.all([
    ctx.findEvents(),
    ctx.countGuests(),
    ctx.countPendingTasks(),
    ctx.countOverdueTasks(),
    ctx.totalSpent(),
    ctx.findRecentTasks(5),
  ])

  const session = await auth()
  const userName = session?.user?.name?.split(" ")[0] ?? "there"
  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date()).slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-sm text-[#4E453A]">
            Here&apos;s what&apos;s happening with your wedding
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/events"
            className="px-4 py-2 h-10 rounded-lg bg-[#C8A26B] hover:bg-[#B8925B] text-white text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Entry
          </Link>
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Timeline"
          icon={<Calendar className="w-5 h-5" />}
          value={`${events.length} Events`}
          sub={events.length > 0
            ? `Scheduled across ${Math.ceil((new Date(wedding.endDate).getTime() - new Date(wedding.startDate).getTime()) / 86400000) + 1} days`
            : "No events yet"
          }
          footer={events.length > 0
            ? `First: ${events[0].name} (${new Date(events[0].date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })})`
            : "Add your first event"
          }
          footerLink="/events"
        />
        <StatCard
          label="RSVP Status"
          icon={<Users className="w-5 h-5" />}
          value={`${guestCount} Guests`}
          sub={guestCount > 0 ? "Invited" : "None added yet"}
          footer={guestCount > 0 ? "Manage guests" : "Add guests"}
          footerLink="/guests"
        />
        <StatCard
          label="Committed Spend"
          icon={<Wallet className="w-5 h-5" />}
          value={spent > 0 ? `₹${spent.toLocaleString("en-IN")}` : "₹0"}
          sub="Total spent"
          footer="View budget"
          footerLink="/budget"
          hidden={ctx.role === "event_coordinator"}
        />
        <StatCard
          label="Milestones"
          icon={<CheckSquare className="w-5 h-5" />}
          value={`${pendingTasks} Tasks`}
          badge={overdueTasks > 0 ? `${overdueTasks} overdue` : undefined}
          sub="Pending"
          footer="Task board →"
          footerLink="/tasks"
        />
      </div>

      {/* Two-column: Events + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#C8A26B]" /> Upcoming Events
            </h2>
            <Link href="/events" className="text-xs text-[#C8A26B] font-medium hover:underline">
              View All →
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <p className="text-sm text-[#4E453A] mb-3">No upcoming events yet</p>
              <Link href="/events" className="text-sm text-[#C8A26B] font-medium hover:underline">
                Add your first event →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event._id.toString()} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#D8E3FB] text-[#3C475A] text-xs font-medium capitalize">
                      {event.eventType}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A1A] group-hover:text-[#C8A26B] transition-colors">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#4E453A] text-xs mt-1">
                    <Clock className="w-3.5 h-3.5 text-[#C8A26B]" />
                    {new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                    {event.startTime && ` • ${event.startTime}`}
                  </div>
                  {event.venue && (
                    <div className="flex items-center gap-1.5 text-[#4E453A] text-xs mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#5F5E5E]" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  )}
                </div>
              ))}

              <Link
                href="/events"
                className="bg-[#F4F4F2] hover:bg-[#EEEEEC] transition-colors rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[140px] group"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#C8A26B] group-hover:scale-105 transition-transform mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C8A26B] transition-colors">+ Add Event</span>
              </Link>
            </div>
          )}
        </div>

        {/* Tasks Due Soon */}
        <div className="lg:col-span-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#C8A26B]" /> Tasks Due Soon
            </h2>
            <Link href="/tasks" className="text-xs text-[#C8A26B] font-medium hover:underline">
              View All Tasks →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            {recentTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-[#4E453A] mb-2">No pending tasks</p>
                <Link href="/tasks" className="text-sm text-[#C8A26B] font-medium hover:underline">
                  Add a task →
                </Link>
              </div>
            ) : (
              recentTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
                return (
                  <div key={task._id.toString()} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F4F4F2] transition-colors">
                    <input
                      type="checkbox"
                      disabled
                      className="w-4 h-4 mt-1 rounded accent-[#C8A26B] shrink-0"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-[#1A1A1A] leading-snug">{task.title}</span>
                      {task.dueDate && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isOverdue
                              ? "bg-[#FFDAD6] text-[#93000A]"
                              : "bg-[#FFDDB0] text-[#5D4214]"
                          }`}>
                            {isOverdue ? "Overdue" : "Due"} — {new Date(task.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  icon,
  value,
  sub,
  badge,
  footer,
  footerLink,
  hidden,
}: {
  label: string
  icon: React.ReactNode
  value: string
  sub: string
  badge?: string
  footer: string
  footerLink: string
  hidden?: boolean
}) {
  if (hidden) return null
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[#4E453A] font-medium">{label}</span>
        <div className="w-10 h-10 rounded-lg bg-[#FFDDB0]/30 text-[#C8A26B] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <div className="text-[32px] leading-none font-bold text-[#1A1A1A]">{value}</div>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-[#FFDAD6] text-[#93000A] text-xs font-semibold">{badge}</span>
          )}
        </div>
        <div className="text-xs text-[#4E453A] mt-1.5">{sub}</div>
      </div>
      <Link
        href={footerLink}
        className="mt-4 pt-3 flex items-center justify-between text-xs text-[#4E453A] bg-[#F4F4F2]/50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl hover:text-[#C8A26B] transition-colors"
      >
        <span>{footer}</span>
      </Link>
    </div>
  )
}

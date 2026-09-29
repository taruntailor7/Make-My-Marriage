import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-xl font-semibold tracking-tight">
            Make My <span className="text-primary">Marriage</span>
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started — Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-20">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <span>✦</span>
            <span>Built for Indian Weddings</span>
          </div>
          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Your entire wedding.
            <br />
            <span className="text-primary">One place.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
            Manage events, guests, budget, vendors, and invitations — together
            with your family.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started — Free
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-border px-6 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
            >
              See How It Works
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free to use • No credit card required • Set up in 2 minutes
          </p>
        </div>
      </section>

      {/* Problem ribbon */}
      <section className="border-y border-border bg-muted py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-base font-medium text-foreground">
            50 relatives. 7 events. 1 WhatsApp group that lost the caterer's
            number.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sound familiar? There's a better way.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need. Nothing you don't.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Plan every event from Haldi to Reception — with the people who
            matter most.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Multi-Event Planning",
              desc: "Haldi, Mehendi, Sangeet, Wedding, Reception — each event with its own timeline, venue, and guest list.",
            },
            {
              title: "Family Collaboration",
              desc: "Invite parents, siblings, and coordinators. Everyone sees what they need — nothing more, nothing less.",
            },
            {
              title: "Guest Management & RSVP",
              desc: "Add 500+ guests, assign them to events, send per-event RSVPs, track dietary preferences and headcount.",
            },
            {
              title: "Budget & Vendor Tracking",
              desc: "Track every expense by category and who paid. Manage vendor contracts, payment schedules, and due dates.",
            },
            {
              title: "Digital Invitations",
              desc: "Beautiful shareable invite cards for each event. Share on WhatsApp, no app download needed for guests.",
            },
            {
              title: "Wedding Website & Gallery",
              desc: "A personal wedding website with your story, schedule, and a photo gallery guests upload to via QR code.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Up and running in 3 steps
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create your wedding",
                desc: "Set your wedding name, dates, and add your events.",
              },
              {
                step: "2",
                title: "Invite your team",
                desc: "Share invite links with family and coordinators. Each person gets the right level of access.",
              },
              {
                step: "3",
                title: "Plan everything together",
                desc: "Assign tasks, track budget, manage guests, send RSVPs, build your wedding website.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-xl font-bold text-primary">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-secondary-foreground sm:text-4xl">
            Your wedding deserves better than a spreadsheet.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-secondary-foreground/60">
            Start planning with your family today. It's free.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started — Free
          </Link>
          <p className="mt-3 text-sm text-secondary-foreground/40">
            No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-sm font-medium">
              Make My <span className="text-primary">Marriage</span>
            </span>
            <p className="text-sm text-muted-foreground">
              © 2025 Make My Marriage. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

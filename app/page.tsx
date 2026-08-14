import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur border-b border-surface">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              R
            </span>
            <span className="font-semibold text-lg tracking-tight">RentalFinder AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink">
            <Link href="#problem" className="hover:text-primary transition-colors duration-150">
              Problem
            </Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors duration-150">
              How it works
            </Link>
            <Link href="#tech" className="hover:text-primary transition-colors duration-150">
              Tech
            </Link>
          </nav>

          <Link
            href="/demo"
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors duration-150 ease-out-quart"
          >
            Try the demo
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted mb-6">
              AI-POWERED RENTAL VIEWINGS · BOOKED FOR YOU
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Book your next rental viewing{" "}
              <span className="italic font-medium text-primary">without the chase.</span>
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed max-w-xl">
              RentalFinder AI interviews you, finds matching properties, and handles the back-and-forth with landlords by voice, email, and WhatsApp. You just show up.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/demo"
                className="px-8 py-3.5 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors duration-150 ease-out-quart"
              >
                Try the demo
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-3.5 rounded-full border border-muted text-ink font-medium hover:border-primary hover:text-primary transition-colors duration-150 ease-out-quart"
              >
                See how it works
              </a>
            </div>
            <p className="mt-6 text-sm text-muted flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-success" />
              No calls to landlords. No spreadsheets. No missed viewings.
            </p>
          </div>

          <div className="relative">
            <Image
              src="/hero-visual.svg"
              alt="RentalFinder AI booking viewings across apartments, calendar, and chat"
              width={600}
              height={450}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="bg-surface py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted mb-4">
              The problem
            </p>
            <h2 className="text-3xl md:text-4xl font-bold leading-snug">
              Renters send dozens of messages and still end up without a viewing.
            </h2>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                stat: "12+",
                label: "Average messages to book one viewing",
                description: "Email, text, voicemail, repeat.",
              },
              {
                stat: "3 days",
                label: "Typical landlord response time",
                description: "By then, the flat is already gone.",
              },
              {
                stat: "40%",
                label: "Of enquiries never get a reply",
                description: "Renters waste hours chasing ghosts.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-bg rounded-2xl p-6 border border-surface"
              >
                <p className="text-3xl font-bold text-primary">{item.stat}</p>
                <p className="mt-2 font-semibold text-ink">{item.label}</p>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted mb-4">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold leading-snug">
              Three steps from &lsquo;I&apos;m looking&rsquo; to &lsquo;viewing booked&rsquo;
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell the bot what you need",
                description:
                  "Budget, neighborhood, move-in date, must-haves. A quick chat, not a 20-field form.",
              },
              {
                step: "02",
                title: "AI finds matches and reaches out",
                description:
                  "SIE routes your request; cloud agents call, email, or WhatsApp landlords on your behalf.",
              },
              {
                step: "03",
                title: "Viewings appear on your dashboard",
                description:
                  "Confirmed times, property details, and reminders — all in one place.",
              },
            ].map((item) => (
              <div key={item.title} className="relative">
                <span className="text-5xl font-bold text-primary/10">{item.step}</span>
                <h3 className="mt-2 text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/demo"
              className="inline-flex px-8 py-3.5 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors duration-150 ease-out-quart"
            >
              Try the live demo
            </Link>
          </div>
        </div>
      </section>

      {/* Tech */}
      <section id="tech" className="bg-surface py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted mb-4">
                Built for the hackathon
              </p>
              <h2 className="text-3xl md:text-4xl font-bold leading-snug">
                SIE routes the request. Alibaba Cloud handles the heavy lifting.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Simple questions are answered locally. Complex matching and landlord outreach are offloaded to Alibaba Cloud. The dashboard shows every routing decision in real time.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Superlinked Inference Engine for smart routing",
                  "Alibaba Cloud for voice, email, and WhatsApp agents",
                  "Next.js + Tailwind frontend deployed on Vercel",
                  "Live dashboard tracks matches, outreach, and viewings",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-ink">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bg rounded-2xl p-6 border border-surface">
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-surface border border-surface">
                  <p className="text-muted">User</p>
                  <p className="mt-1 text-ink">2-bed in Mission, max $3,500, move-in Sep 1</p>
                </div>
                <div className="p-4 rounded-xl bg-primary-subtle border border-primary-subtle">
                  <p className="text-primary font-semibold">SIE router</p>
                  <p className="mt-1 text-ink">Complex matching + outreach → offload to Alibaba Cloud</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-surface">
                  <p className="text-muted">Alibaba Cloud agent</p>
                  <p className="mt-1 text-ink">Voice call to landlord · Email backup · WhatsApp reminder queued</p>
                </div>
                <div className="p-4 rounded-xl bg-success/10 border border-success/10">
                  <p className="text-success font-semibold">Confirmed</p>
                  <p className="mt-1 text-ink">Viewing booked for Sat, Sep 6 at 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Built for the Qwen × Superlinked × Alibaba Cloud hackathon.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/demo" className="text-primary hover:text-primary-hover transition-colors">
              Try the demo
            </Link>
            <a href="#" className="text-muted hover:text-ink transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

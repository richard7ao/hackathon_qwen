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
              The problem
            </Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors duration-150">
              How it works
            </Link>
            <Link href="#voice" className="hover:text-primary transition-colors duration-150">
              Voice agent
            </Link>
            <Link href="#tech" className="hover:text-primary transition-colors duration-150">
              Tech
            </Link>
          </nav>

          <Link
            href="/demo"
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors duration-150 ease-out-quart"
          >
            Go to demo
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-6">
              ONE CHAT · ZERO PHONE TAG · VIEWINGS BOOKED FOR YOU
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Find your next rental{" "}
              <span className="italic font-medium text-primary">without the chase.</span>
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed max-w-xl">
              Tell our AI what you need. It finds matching properties, then calls, emails, and
              WhatsApps landlords on your behalf to book viewings — while you watch it happen on a
              live dashboard. You just show up.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/demo"
                className="px-8 py-3.5 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors duration-150 ease-out-quart"
              >
                Go to demo →
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
            <div className="absolute inset-0 -z-10 bg-primary-subtle rounded-[2rem] blur-2xl opacity-60" />
            <Image
              src="/generated/hero.png"
              alt="RentalFinder AI connecting apartments, a chat conversation, a calendar, and a phone call"
              width={900}
              height={900}
              className="w-full h-auto rounded-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="bg-surface py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <Image
                src="/generated/problem.png"
                alt="A stressed renter buried in messages, emails, and missed calls while hunting for a flat"
                width={800}
                height={800}
                className="w-full h-auto rounded-2xl"
              />
            </div>
            <div className="order-1 md:order-2 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-4">
                The problem
              </p>
              <h2 className="text-3xl md:text-4xl font-bold leading-snug">
                Renting is a second job you never applied for.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                You find a place you like, send a message, and wait. And wait. By the time the
                landlord replies, it&apos;s gone. Multiply that across every listing and every day —
                it&apos;s hours of chasing for a single viewing.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { stat: "12+", label: "messages per viewing" },
                  { stat: "3 days", label: "avg landlord reply" },
                  { stat: "40%", label: "enquiries ignored" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-2xl md:text-3xl font-bold text-primary">{item.stat}</p>
                    <p className="mt-1 text-sm text-muted">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-4">
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
                  "Budget, neighborhood, move-in date, must-haves. A quick chat — not a 20-field form.",
              },
              {
                step: "02",
                title: "AI finds matches and reaches out",
                description:
                  "Superlinked SIE ranks listings to your taste, then the voice agent calls landlords for you.",
              },
              {
                step: "03",
                title: "Viewings land on your dashboard",
                description:
                  "Confirmed times, property details, and reminders — all in one calendar view.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-surface rounded-2xl p-6">
                <span className="inline-flex w-11 h-11 rounded-xl bg-primary text-white items-center justify-center font-bold">
                  {item.step}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/demo"
              className="inline-flex px-8 py-3.5 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors duration-150 ease-out-quart"
            >
              Go to demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Voice agent */}
      <section id="voice" className="bg-surface py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-4">
                The magic moment
              </p>
              <h2 className="text-3xl md:text-4xl font-bold leading-snug">
                An AI voice agent that actually calls the landlord.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                When you like a place, RentalFinder&apos;s voice agent picks up the phone in a natural
                human voice powered by Qwen3-TTS, introduces itself, and negotiates a viewing time —
                then books it straight to your calendar and sends a WhatsApp reminder.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Natural human voice (Qwen3-TTS on Alibaba Cloud)",
                  "Understands the landlord and negotiates a time",
                  "Confirms the viewing and adds it to your calendar",
                  "Sends you a WhatsApp reminder before you go",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-ink">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/demo"
                className="mt-8 inline-flex px-7 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition-colors duration-150 ease-out-quart"
              >
                Hear it in the demo →
              </Link>
            </div>

            <div className="relative">
              <Image
                src="/generated/voice.png"
                alt="AI voice agent as a green sound-wave orb with a headset, booking a viewing"
                width={800}
                height={800}
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tech */}
      <section id="tech" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-4">
                Built for the hackathon
              </p>
              <h2 className="text-3xl md:text-4xl font-bold leading-snug">
                SIE routes the request. Alibaba Cloud powers the voice.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Simple questions are answered locally. Complex matching and landlord outreach run on
                Alibaba Cloud with Qwen models. The dashboard shows every routing decision in real
                time.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Superlinked Inference Engine for smart routing + matching",
                  "Qwen3-TTS voice agent on Alibaba Cloud",
                  "Qwen image generation for these visuals",
                  "Next.js + Tailwind frontend deployed on Vercel",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-ink">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface rounded-2xl p-6">
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-bg border border-surface">
                  <p className="text-muted">User</p>
                  <p className="mt-1 text-ink">2-bed in Mission, max $3,500, move-in Sep 1</p>
                </div>
                <div className="p-4 rounded-xl bg-primary-subtle">
                  <p className="text-primary font-semibold">SIE router</p>
                  <p className="mt-1 text-ink">Complex matching + outreach → offload to Alibaba Cloud</p>
                </div>
                <div className="p-4 rounded-xl bg-bg border border-surface">
                  <p className="text-muted">Qwen3 voice agent</p>
                  <p className="mt-1 text-ink">Calls landlord · Email backup · WhatsApp reminder queued</p>
                </div>
                <div className="p-4 rounded-xl bg-success/10">
                  <p className="text-success font-semibold">Confirmed</p>
                  <p className="mt-1 text-ink">Viewing booked for Sat, Sep 6 at 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-primary rounded-3xl px-8 py-14 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-snug">
              Stop chasing landlords. Start booking viewings.
            </h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto">
              Try the live demo — chat, get matches, and watch the AI voice agent book a viewing.
            </p>
            <Link
              href="/demo"
              className="mt-8 inline-flex px-8 py-3.5 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition-colors duration-150 ease-out-quart"
            >
              Go to demo →
            </Link>
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
              Go to demo
            </Link>
            <a
              href="https://github.com/richard7ao/hackathon_qwen"
              className="text-muted hover:text-ink transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

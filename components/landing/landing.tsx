import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  VideoCamera,
  Lifebuoy,
  ListChecks,
  ChatCircleDots,
  Trophy,
  ShieldCheck,
  LockKey,
  DownloadSimple,
} from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
  Public marketing landing page ("/"). Built from the client's W01 design, with
  the 1:1 Sessions and Community sections removed (those aren't live). Fully
  responsive: single column on phones, two-column feature rows on large screens.
  Static server component — no client JS. Phone mockups are the supplied SVGs in
  /public/landing.
*/

const SHELL = "mx-auto w-full max-w-[1180px] px-6";

/* eslint-disable @next/next/no-img-element */

/*
  Phone mockups are inlined (not loaded via <img src>). The SVGs contain
  drop-shadow filters, and filtered SVGs loaded through <img> are rasterized at
  1x on high-DPI screens — that's what made them look blurry on phones/retina.
  Inlining renders them as live vector at the device's full resolution. Read
  once at render (server component); the three files use unique id suffixes so
  their filter/clip ids don't collide in the shared DOM.
*/
function PhoneMockup({ file, label }: { file: string; label: string }) {
  let svg = readFileSync(join(process.cwd(), "public", "landing", file), "utf8");
  // Drop the fixed pixel size so the CSS (max-w) drives the size and the viewBox
  // keeps it perfectly scalable.
  svg = svg.replace(/(<svg\b[^>]*?)\swidth="\d+"\s+height="\d+"/, '$1 width="100%" height="auto"');
  return (
    <div
      role="img"
      aria-label={label}
      className="mx-auto w-full max-w-[340px] [&>svg]:h-auto [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const PHASES = [
  { n: 1, name: "Steady breath", days: "Days 1–8", body: "Eight mornings learning to steady your breath. Grounding, body scans, and naming what you feel before it names you." },
  { n: 2, name: "Feeling the feelings", days: "Days 9–20", body: "The hardest part. You stop pushing it down and let yourself feel all of it — with something to do every single morning." },
  { n: 3, name: "Rebuilding", days: "Days 21–45", body: "New routines that steady your days, reconnecting with what you enjoy, and strength you can start to feel." },
  { n: 4, name: "Integration", days: "Days 46–60", body: "Keeping what you've built. Fifteen days that make this yours — not a phase you were in." },
];

const DAY_FEATURES = [
  { icon: ListChecks, title: "Three small things that matter", body: "Plus optional extras if you have more in you. One point each — never more than you can carry." },
  { icon: VideoCamera, title: "Short videos walk you through", body: "Two to three minutes each, recorded by the clinician who wrote your day." },
  { icon: Lifebuoy, title: "Your SOS space is one tap away", body: "Free, always — even after the trial, even if you never pay a rupee." },
];

const INSIDE = [
  { icon: ChatCircleDots, tag: "AI companion · always awake", title: "Daylight", body: "For 2am, when there's no one left to text. It's clearly labelled AI — it never pretends to be a person, and it hands you to a helpline the moment you're not safe." },
  { icon: Trophy, tag: "Points · badges · reflections", title: "Progress", body: "A point for every task you finish, and badges that mark the moments worth remembering. Streaks pause when life happens — they never break." },
];

const DOORS = [
  { title: "I'm about to relapse", body: "Two minutes of breathing, and the reason you wrote down on day one." },
  { title: "I just need to talk", body: "Call the person you chose when you signed up, or talk it out with Daylight." },
  { title: "I'm not safe right now", body: "Free 24×7 helplines and emergency numbers, one tap away." },
];

const PRIVACY = [
  { icon: LockKey, title: "End-to-end encrypted", body: "Your reflections and your notebook are encrypted. No one — not even us — can read them." },
  { icon: ShieldCheck, title: "Nothing shared without a yes", body: "Daylight only sees what you type to it, and your private notebook is never used to train anything." },
  { icon: DownloadSimple, title: "Yours to take, or erase", body: "Download everything you've shared, or permanently delete your account and all of your data, whenever you want." },
];

const PLAN_INCLUDES = [
  "All 60 days, and every video inside them",
  "Daylight, the AI companion, whenever you need it",
  "Points, badges and your private notebook",
  "Your SOS space — free forever, even without the program",
  "Cancel nothing. There is nothing to cancel.",
];

const FAQS = [
  { q: "Is this therapy?", a: "No. It's a structured 60-day program written by a clinical psychologist. It doesn't replace treatment and it never pretends to." },
  { q: "How long does a day take?", a: "About fifteen minutes. Three essentials that matter, plus optional extras on the days you have more in you." },
  { q: "What if I miss days?", a: "Nothing breaks. Streaks pause instead of resetting, and you come back to a gentler task. There are no lockouts and no guilt screens anywhere in the program." },
  { q: "Is Daylight a therapist?", a: "No, and it never claims to be. It's clearly labelled AI, it's there for the hours between the mornings, and it points you to help the moment you're not safe." },
  { q: "Is it really one payment?", a: "Yes. ₹999 once, for all sixty days. Nothing renews and nothing auto-charges." },
  { q: "Who can see what I write?", a: "Only you. Your reflections and notebook are encrypted and never shared." },
  { q: "Do I have to talk to anyone?", a: "No. The whole program works without a single conversation. Daylight is there only if you want it." },
  { q: "What if I'm in crisis?", a: "Your SOS space is free and always open, with 24×7 helplines and emergency numbers. If you're in immediate danger, call 112." },
];

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow text-[var(--color-accent)]", className)}>{children}</p>;
}

export function Landing() {
  const year = new Date().getFullYear();

  return (
    <div className="bg-[var(--color-canvas)] text-[var(--color-ink)]">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/90 backdrop-blur">
        <div className={cn(SHELL, "flex h-20 items-center justify-between")}>
          <Link href="/" aria-label="Break It Thru home" className="flex items-center">
            <img src="/logo.svg" alt="Break It Thru" className="h-14 w-auto" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-[var(--color-ink-muted)] md:flex">
            <a href="#how" className="hover:text-[var(--color-ink)]">How it works</a>
            <a href="#inside" className="hover:text-[var(--color-ink)]">What&apos;s inside</a>
            <a href="#pricing" className="hover:text-[var(--color-ink)]">Pricing</a>
            <a href="#faq" className="hover:text-[var(--color-ink)]">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-medium text-[var(--color-ink)] hover:opacity-70 sm:inline">Log in</Link>
            <Link href="/signup" className={buttonVariants({ variant: "primary", size: "sm" })}>Start free</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className={cn(SHELL, "grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24")}>
        <div className="order-2 lg:order-1">
          <Eyebrow>A 60-day recovery program</Eyebrow>
          <h1 className="font-display mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
            A way through,<br />written down.
          </h1>
          <p className="mt-6 max-w-md text-lg text-[var(--color-ink-muted)]">
            Sixty days, authored by one clinical psychologist. Three small things a day, and short videos that walk you through each one.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>Start free — 4 days, no card</Link>
            <a href="#how" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)] hover:opacity-70">
              See how the 60 days work <ArrowRight size={16} />
            </a>
          </div>
          <p className="mt-6 text-sm text-[var(--color-ink-faint)]">
            No card to start · ₹999 once, nothing renews · Private by default
          </p>
        </div>
        <div className="order-1 lg:order-2">
          <PhoneMockup file="hero.svg" label="The Break It Thru app on a phone" />
        </div>
      </section>

      {/* ── Bridge ──────────────────────────────────────────── */}
      <section className="bg-[var(--color-brand-subtle)]/50 py-20 lg:py-24">
        <div className={cn(SHELL, "text-center")}>
          <h2 className="font-display mx-auto max-w-3xl text-3xl leading-tight sm:text-4xl">
            Most mornings, the hardest part isn&apos;t feeling bad. It&apos;s not knowing what to do next.
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted)]">Break It Thru is sixty mornings that already know.</p>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="how" className={cn(SHELL, "py-20 lg:py-28")}>
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">Four phases. Sixty mornings.</h2>
          <p className="mt-4 text-[var(--color-ink-muted)]">
            The program moves the way recovery actually does — steady yourself first, then let yourself feel it, then rebuild, then keep it. You never have to decide what today should be.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((p) => (
            <div key={p.n} className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <p className="eyebrow flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                Phase {p.n} · {p.days}
              </p>
              <h3 className="font-display mt-3 text-xl">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What a day looks like ───────────────────────────── */}
      <section id="inside" className="bg-[var(--color-surface)]/60 py-20 lg:py-28">
        <div className={cn(SHELL, "grid items-center gap-12 lg:grid-cols-2")}>
          <div className="order-2 lg:order-1">
            <PhoneMockup file="day.svg" label="A day inside the program" />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>What a day looks like</Eyebrow>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">Three small things.<br />About fifteen minutes.</h2>
            <p className="mt-4 text-[var(--color-ink-muted)]">
              You open the app and today is already decided. No blank page, no deciding what you should be working on.
            </p>
            <ul className="mt-8 space-y-6">
              {DAY_FEATURES.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="mt-0.5 text-[var(--color-accent)]"><f.icon size={22} weight="fill" /></span>
                  <div>
                    <h3 className="font-semibold text-[var(--color-ink)]">{f.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--color-accent-subtle)] bg-[var(--color-accent-subtle)]/40 p-5">
              <p className="font-semibold text-[var(--color-accent-subtle-ink)]">Miss a day? Nothing breaks.</p>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                Streaks pause — they never break. You come back to a gentler reset task, not a guilt screen. There is no punishment anywhere in this program.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who wrote it ────────────────────────────────────── */}
      <section className="bg-[var(--color-brand-subtle)]/50 py-20 lg:py-28">
        <div className={cn(SHELL, "text-center")}>
          <Eyebrow>Who wrote it</Eyebrow>
          <h2 className="font-display mx-auto mt-3 max-w-2xl text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
            Every one of the sixty days was written by a clinician.
          </h2>
          <p className="mt-4 text-[var(--color-ink-muted)]">Not generated. Not automated. Not assembled from a blog post.</p>
          <figure className="mx-auto mt-10 max-w-2xl rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
            <blockquote className="font-display text-xl leading-relaxed sm:text-2xl">
              &ldquo;I built these 60 days so you&apos;re never guessing what to do next. Start small — I&apos;ve got the structure.&rdquo;
            </blockquote>
            <figcaption className="mt-6 text-sm">
              <span className="block font-semibold text-[var(--color-ink)]">Dr. Ananya Rao</span>
              <span className="block text-[var(--color-ink-muted)]">Clinical Psychologist · Author of the 60-day program</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Also inside ─────────────────────────────────────── */}
      <section className={cn(SHELL, "py-20 lg:py-28")}>
        <div className="max-w-2xl">
          <Eyebrow>Also inside</Eyebrow>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">For the hours between the mornings.</h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {INSIDE.map((c) => (
            <div key={c.title} className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]"><c.icon size={22} weight="fill" /></span>
              <p className="eyebrow mt-4">{c.tag}</p>
              <h3 className="font-display mt-1 text-2xl">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOS ─────────────────────────────────────────────── */}
      <section className="bg-[var(--color-brand-ink)] py-20 text-[var(--color-brand-fg)] lg:py-28">
        <div className={cn(SHELL, "grid items-center gap-12 lg:grid-cols-2")}>
          <div>
            <PhoneMockup file="sos.svg" label="The SOS space" />
          </div>
          <div>
            <Eyebrow>If tonight is bad</Eyebrow>
            <h2 className="font-display mt-3 text-3xl text-white sm:text-4xl lg:text-[2.75rem]">Three doors,<br />always open.</h2>
            <p className="mt-4 max-w-md text-white/70">
              Your SOS space is free forever — before you pay, after you finish, even if you never buy the program at all. It has its own address you can reach in one tap.
            </p>
            <div className="mt-8 space-y-3">
              {DOORS.map((d) => (
                <div key={d.title} className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-5">
                  <h3 className="font-semibold text-white">{d.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{d.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-white/45">In immediate danger? Call 112. · Nothing you do here is ever shared.</p>
          </div>
        </div>
      </section>

      {/* ── Privacy ─────────────────────────────────────────── */}
      <section className={cn(SHELL, "py-20 text-center lg:py-28")}>
        <Eyebrow>Privacy</Eyebrow>
        <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">Private by default. Not by settings.</h2>
        <p className="mt-4 text-[var(--color-ink-muted)]">You decide what&apos;s shared, and what stays only yours.</p>
        <div className="mx-auto mt-12 grid max-w-4xl gap-10 text-left sm:grid-cols-3">
          {PRIVACY.map((p) => (
            <div key={p.title}>
              <span className="text-[var(--color-accent)]"><p.icon size={24} weight="fill" /></span>
              <h3 className="mt-3 font-semibold text-[var(--color-ink)]">{p.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-[var(--color-ink-faint)]">
          Handled under India&apos;s DPDP Act, 2023.{" "}
          <Link href="/legal/privacy" className="font-medium text-[var(--color-accent)] hover:opacity-80">Read our privacy policy →</Link>
        </p>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="bg-[var(--color-brand-subtle)]/50 py-20 lg:py-28">
        <div className={cn(SHELL, "text-center")}>
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">₹999. Once.</h2>
          <p className="mt-4 text-[var(--color-ink-muted)]">Not a subscription. Nothing renews, nothing auto-charges.</p>
          <div className="mx-auto mt-12 max-w-xl rounded-[var(--radius-xl)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-8 text-left shadow-[var(--shadow-card)]">
            <p className="eyebrow">The 60-day program</p>
            <p className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-5xl">₹999</span>
              <span className="text-sm text-[var(--color-ink-muted)]">one payment · all 60 days · no renewal</span>
            </p>
            <ul className="mt-6 space-y-3">
              {PLAN_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
                  <CheckCircle size={20} weight="fill" className="mt-px shrink-0 text-[var(--color-success)]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-8 w-full")}>Start free — 4 days, no card</Link>
            <p className="mt-4 text-center text-xs text-[var(--color-ink-faint)]">
              You won&apos;t be asked for a card until Day 5. If you stop there, you&apos;re never charged.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className={cn(SHELL, "py-20 lg:py-28")}>
        <div className="max-w-2xl">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">The things worth asking first.</h2>
        </div>
        <div className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {FAQS.map((f) => (
            <div key={f.q} className="border-t border-[var(--color-line)] pt-5">
              <h3 className="font-semibold text-[var(--color-ink)]">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="bg-[var(--color-brand-ink)] py-24 text-center text-[var(--color-brand-fg)]">
        <div className={SHELL}>
          <h2 className="font-display mx-auto max-w-2xl text-4xl text-white sm:text-5xl">Tomorrow morning is already written.</h2>
          <p className="mt-5 text-white/70">Four days free. No card, nothing to lose. Just the first step, whenever you&apos;re ready.</p>
          <Link href="/signup" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-8")}>Start free — 4 days, no card</Link>
          <p className="mt-6 text-sm text-white/45">₹999 once after the trial · Nothing renews · SOS is free forever</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-[var(--color-brand-ink)] text-[var(--color-brand-fg)]">
        <div className={cn(SHELL, "border-t border-white/10 py-14")}>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2 md:col-span-1">
              <img src="/logo-on-dark.svg" alt="Break It Thru" className="h-20 w-auto" />
              <p className="mt-4 max-w-xs text-sm text-white/50">A 60-day recovery program, written by a clinician. Encouragement, never punishment.</p>
            </div>
            <FooterCol title="Product" links={[
              { label: "How it works", href: "#how" },
              { label: "What's inside", href: "#inside" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
              { label: "Log in", href: "/login" },
            ]} />
            <FooterCol title="Support" links={[
              { label: "SOS — always free", href: "/sos" },
              { label: "24×7 helplines", href: "/sos/helplines" },
              { label: "Contact us", href: "/support" },
              { label: "Help with a payment", href: "/support" },
            ]} />
            <FooterCol title="Legal" links={[
              { label: "Terms of service", href: "/legal/terms" },
              { label: "Privacy policy", href: "/legal/privacy" },
              { label: "Refunds & cancellation", href: "/legal/refund" },
              { label: "DPDP Act compliance", href: "/legal/privacy" },
            ]} />
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} Break It Thru · operated by Yash Goyal, Gurgaon, India</p>
            <p className="text-white/60">If you&apos;re in immediate danger, call 112.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/35">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

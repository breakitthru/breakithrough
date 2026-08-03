import Link from "next/link";

// Split-canvas auth. Login is Google-only (JWT sessions); no phone/OTP.
// The Google button currently links into the demo; when OAuth keys are wired it
// becomes a signIn("google") call.
export default function LoginPage() {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden flex-col justify-between bg-[var(--color-brand-ink)] p-14 text-[var(--color-brand-fg)] lg:flex">
        <div className="flex h-12 w-28 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-white/25 text-sm text-white/50">
          Logo
        </div>
        <div>
          <h1 className="font-display text-[3rem] leading-[1.05]">
            Sixty days.
            <br />
            One at a time.
          </h1>
          <p className="mt-5 max-w-sm text-white/70">
            A programme written by a clinician — not generated, not automated.
          </p>
          <ul className="mt-6 space-y-2 text-white/70">
            <li>· Four days free — no card, no pressure.</li>
            <li>· Three small tasks a day, written for you.</li>
            <li>· SOS and helplines — free, always.</li>
          </ul>
        </div>
        <blockquote className="max-w-sm border-t border-white/15 pt-5 text-white/60">
          <p className="font-display italic">
            &ldquo;I built these 60 days so you&rsquo;re never guessing what to do next.&rdquo;
          </p>
          <footer className="mt-2 text-sm">Dr. Ananya Rao · Clinical Psychologist</footer>
        </blockquote>
      </div>

      {/* Right — sign in */}
      <div className="flex flex-col justify-center px-8 py-16 sm:px-20">
        <div className="mx-auto w-full max-w-sm">
          <p className="text-right text-sm text-[var(--color-ink-muted)]">
            New here or returning, one button.
          </p>
          <h2 className="font-display mt-10 text-[2.5rem] leading-tight text-[var(--color-ink)]">
            Start your 60 days.
          </h2>
          <p className="mt-3 text-[var(--color-ink-muted)]">
            Four days free — no card, no pressure. Just the first step, whenever you&rsquo;re ready.
          </p>

          <Link
            href="/welcome/intake/1"
            className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-sunken)]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285F4] ring-1 ring-[var(--color-line)]">
              G
            </span>
            Continue with Google
          </Link>

          <p className="mt-6 text-center text-xs text-[var(--color-ink-faint)]">
            By continuing, you agree to our{" "}
            <span className="underline">Terms</span> and{" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

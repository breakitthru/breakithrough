import Link from "next/link";
import { redirect } from "next/navigation";
import { isGoogleConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { SplitCanvas } from "@/components/onboarding/split-canvas";
import { SignupForm } from "@/components/auth/forms";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.onboardedAt ? "/today" : "/welcome/intake/1");

  return (
    <SplitCanvas
      leftTitle={
        <>
          Sixty days.
          <br />
          One at a time.
        </>
      }
      leftBody="A programme written by a clinician — not generated, not automated."
      bullets={[
        "Four days free — no card, no pressure.",
        "Three small tasks a day, written for you.",
        "SOS and helplines — free, always.",
      ]}
      quote={{
        text: "I built these 60 days so you're never guessing what to do next.",
        author: "Dr. Ananya Rao · Clinical Psychologist",
      }}
    >
      <p className="text-right text-sm text-[var(--color-ink-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--color-ink)] underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
      <h1 className="font-display mt-8 text-[2.5rem] leading-tight text-[var(--color-ink)]">
        Start your 60 days.
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        Four days free — no card, no pressure. Just the first step, whenever you're ready.
      </p>
      <div className="mt-8">
        <SignupForm googleEnabled={isGoogleConfigured} />
      </div>
      <p className="mt-6 text-center text-xs text-[var(--color-ink-faint)]">
        By continuing, you agree to our <span className="underline">Terms</span> and{" "}
        <span className="underline">Privacy Policy</span>.
      </p>
    </SplitCanvas>
  );
}

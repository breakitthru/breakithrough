import Link from "next/link";
import { ArrowLeft, Warning } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Delete account (D87) — explain before the irreversible action (DPDP).
export default function DeleteAccountPage() {
  return (
    <div className="mx-auto max-w-[600px]">
      <Link
        href="/profile/privacy"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Privacy center
      </Link>

      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-crisis-subtle)] text-[var(--color-crisis)]">
        <Warning size={26} weight="fill" />
      </span>
      <h1 className="font-display mt-5 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        Delete your account?
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        This is permanent. Take a moment — here&rsquo;s exactly what happens.
      </p>

      <Card className="mt-6 p-6">
        <p className="eyebrow mb-3">Erased forever</p>
        <ul className="space-y-1.5 text-[var(--color-ink)]">
          <li>· Your reflections, chats and progress</li>
          <li>· Your points, badges and profile</li>
        </ul>
        <p className="eyebrow mb-3 mt-6">Kept only as the law requires</p>
        <ul className="space-y-1.5 text-[var(--color-ink-muted)]">
          <li>· Payment records (Income Tax Act)</li>
          <li>· A pseudonymous record that the account was deleted</li>
        </ul>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <Link href="/profile/privacy">
          <Button variant="ghost">Keep my account</Button>
        </Link>
        <Link href="/account-deleted">
          <Button variant="crisis">Delete permanently</Button>
        </Link>
      </div>
    </div>
  );
}

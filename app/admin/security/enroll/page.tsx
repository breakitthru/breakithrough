import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { requireStaffRaw } from "@/lib/admin";
import { ensureTotpSecret, confirmTotpEnrollment } from "@/lib/admin-actions";
import { totpQrDataUrl } from "@/lib/totp";
import { TotpForm } from "@/components/admin/totp-form";

export default async function EnrollPage() {
  const user = await requireStaffRaw();
  if (user.totpConfirmedAt) redirect("/admin/security/verify");

  const secret = await ensureTotpSecret();
  const qr = await totpQrDataUrl(secret, user.email ?? "staff");

  return (
    <div className="mx-auto max-w-[460px] py-8">
      <p className="eyebrow">Security</p>
      <h1 className="font-display mt-1 text-[2.25rem] leading-tight text-[var(--color-ink)]">
        Set up two-factor.
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Every staff sign-in needs a code from an authenticator app. Scan this once, then enter the
        six-digit code to finish.
      </p>

      <Card className="mt-6 flex flex-col items-center gap-4 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="Authenticator QR code" width={220} height={220} className="rounded-[var(--radius-md)]" />
        <div className="w-full rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-4 py-2 text-center">
          <p className="text-[0.7rem] uppercase tracking-wide text-[var(--color-ink-faint)]">Manual key</p>
          <p className="break-all font-mono text-sm text-[var(--color-ink)]">{secret}</p>
        </div>
        <div className="w-full">
          <TotpForm action={confirmTotpEnrollment} cta="Confirm & continue" />
        </div>
      </Card>
    </div>
  );
}

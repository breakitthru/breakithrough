import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { requireStaffRaw, isTwoFactorVerified } from "@/lib/admin";
import { verifyTotpCode } from "@/lib/admin-actions";
import { TotpForm } from "@/components/admin/totp-form";

export default async function VerifyPage() {
  const user = await requireStaffRaw();
  if (!user.totpConfirmedAt) redirect("/admin/security/enroll");
  if (await isTwoFactorVerified(user.id)) redirect("/admin");

  return (
    <div className="mx-auto max-w-[420px] py-8">
      <p className="eyebrow">Security</p>
      <h1 className="font-display mt-1 text-[2.25rem] leading-tight text-[var(--color-ink)]">
        Enter your code.
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Open your authenticator app and enter the current six-digit code for Break It Through.
      </p>
      <Card className="mt-6 p-6">
        <TotpForm action={verifyTotpCode} cta="Verify" />
      </Card>
    </div>
  );
}

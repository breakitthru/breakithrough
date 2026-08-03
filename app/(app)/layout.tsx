import { Sidebar } from "@/components/app/sidebar";
import { DaylightDock } from "@/components/app/daylight-dock";
import { requireOnboardedUser } from "@/lib/session";

/*
  Authenticated member-app shell (desktop). Requires a signed-in, onboarded user;
  otherwise redirects to /login or /welcome. SOS lives in its own group so it can
  be reached without this gate.
*/
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOnboardedUser();
  const name = user.displayName ?? user.name ?? "there";

  return (
    <div className="min-h-dvh bg-[var(--color-canvas)]">
      <Sidebar
        user={{
          displayName: name,
          avatarInitial: name.charAt(0).toUpperCase(),
          trustedName: user.trustedName,
        }}
      />
      <main className="ml-[264px] min-h-dvh">
        <div className="mx-auto w-full max-w-[1180px] px-10 py-10">{children}</div>
      </main>
      <DaylightDock />
    </div>
  );
}

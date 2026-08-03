import { Sidebar } from "@/components/app/sidebar";
import { DaylightDock } from "@/components/app/daylight-dock";
import { demoUser } from "@/lib/mock";

/*
  Authenticated member-app shell (desktop layout).
  For now it renders against the demo user; once auth + DB are wired this reads
  the real session user. SOS lives outside this layout so it works logged-out.
*/
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = {
    displayName: demoUser.displayName,
    avatarInitial: demoUser.avatarInitial,
    trustedName: demoUser.trustedName,
  };

  return (
    <div className="min-h-dvh bg-[var(--color-canvas)]">
      <Sidebar user={user} />
      <main className="ml-[264px] min-h-dvh">
        <div className="mx-auto w-full max-w-[1180px] px-10 py-10">{children}</div>
      </main>
      <DaylightDock />
    </div>
  );
}

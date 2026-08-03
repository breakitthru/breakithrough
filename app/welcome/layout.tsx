import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

// Onboarding must be signed-in (so answers persist), and already-onboarded users
// are sent to the app.
export default async function WelcomeLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.onboardedAt) redirect("/today");
  return <>{children}</>;
}

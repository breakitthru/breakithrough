import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Landing } from "@/components/landing/landing";

// Public marketing landing. Signed-in, onboarded members are sent straight to
// their program; everyone else (including logged-out visitors) sees the landing.
export default async function RootPage() {
  const user = await getCurrentUser();
  if (user?.onboardedAt) redirect("/today");
  return <Landing />;
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

// Route people to the right place based on their auth + onboarding state.
export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(user.onboardedAt ? "/today" : "/welcome/intake/1");
}

import { redirect } from "next/navigation";

// Root: for now, send people straight into the app (demo mode).
// Later this checks the session and routes to /login vs /today.
export default function RootPage() {
  redirect("/today");
}

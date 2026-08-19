"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CookiePreferencesLink } from "@/components/cookie-preferences";

/*
  Global site footer. Rendered once from the root layout so it appears on every
  page. Hidden inside the admin panel (its own internal chrome), and offset to
  clear the fixed sidebar on the authenticated member shell.
*/

// Route prefixes that render the member shell with the 264px fixed sidebar.
const APP_SHELL = [
  "/today",
  "/journey",
  "/reflections",
  "/progress",
  "/profile",
  "/notifications",
  "/checkout",
  "/trial",
  "/community",
  "/daylight",
];

const LINK = "text-white/60 transition-colors hover:text-white";

export function SiteFooter() {
  const pathname = usePathname();
  // Admin has its own chrome; the marketing landing ("/") ships its own full footer.
  if (pathname.startsWith("/admin") || pathname === "/") return null;

  const inShell = APP_SHELL.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "bg-[var(--color-brand-ink)] text-[0.8rem]",
        // Inside the member shell the bottom tab bar replaces the footer on
        // phones; on desktop the footer clears the fixed sidebar.
        inShell && "hidden lg:block lg:pl-[264px]",
      )}
    >
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-8 py-5 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Link href="/legal/terms" className={LINK}>Terms of Use</Link>
            <span className="text-white/20">|</span>
            <Link href="/legal/privacy" className={LINK}>Privacy Policy</Link>
            <span className="text-white/20">|</span>
            <Link href="/legal/refund" className={LINK}>Refund Policy</Link>
            <span className="text-white/20">|</span>
            <Link href="/legal/shipping" className={LINK}>Shipping</Link>
            <span className="text-white/20">|</span>
            <Link href="/legal/cancellation" className={LINK}>Cancellation</Link>
            <span className="text-white/20">|</span>
            <Link href="/support" className={LINK}>Support</Link>
            <span className="text-white/20">|</span>
            <CookiePreferencesLink className={LINK} />
          </nav>
          <p className="text-white/40">
            © {year} Break It Thru, operated by Yash Goyal, Gurgaon, Haryana, India
          </p>
        </div>
      </div>
    </footer>
  );
}

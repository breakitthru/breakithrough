import Link from "next/link";
import { getConfig } from "@/lib/config";
import { BrandLogo } from "@/components/brand-logo";

/*
  SOS shell — deliberately OUTSIDE the authenticated app group so it works
  without login and without payment (a safety requirement). No sidebar, no gate.
*/
export default async function SosLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfig();
  return (
    <div className="min-h-dvh bg-[var(--color-canvas)]">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/today" className="flex items-center">
          <BrandLogo
            logoUrl={config.logoUrl}
            logoSize={config.logoSize}
            alt="Break It Thru"
            fallback={
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="Break It Thru" className="h-10 w-auto" />
              </>
            }
          />
        </Link>
      </header>
      <div className="mx-auto max-w-[840px] px-6 pb-16">{children}</div>
    </div>
  );
}

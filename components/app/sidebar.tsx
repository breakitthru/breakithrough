"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Path,
  Notebook,
  Lifebuoy,
  Phone,
  CaretRight,
  SquaresFour,
  ShoppingBag,
} from "@phosphor-icons/react";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

const ICONS = {
  today: House,
  journey: Path,
  reflections: Notebook,
  shop: ShoppingBag,
} as const;

export function Sidebar({
  user,
  isAdmin = false,
  logoUrl,
  logoSize,
}: {
  user: { displayName: string; avatarInitial: string; trustedName?: string | null };
  isAdmin?: boolean;
  logoUrl?: string;
  logoSize?: number;
}) {
  const pathname = usePathname();
  // Highlight the tapped item immediately, before the new page finishes loading.
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => setPending(null), [pathname]);
  const current = pending ?? pathname;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col bg-[var(--color-brand-ink)] px-4 py-6 text-[var(--color-brand-fg)]">
      {/* Logo */}
      <div className="mx-1 mb-8 flex items-center">
        <BrandLogo
          logoUrl={logoUrl}
          logoSize={logoSize}
          alt="Logo"
          fallback={
            <div className="flex h-14 w-full items-center justify-center rounded-[var(--radius-md)] border border-dashed border-white/25 text-sm text-white/50">
              Logo
            </div>
          }
        />
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active = current === item.href || current.startsWith(item.href + "/");
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setPending(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.95rem] transition-colors",
                active
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={22} weight={active ? "fill" : "regular"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Admin panel — only for staff/owner accounts */}
      {isAdmin && (
        <div className="mb-2 border-t border-white/10 pt-4">
          <Link
            href="/admin"
            onClick={() => setPending("/admin")}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.95rem] transition-colors",
              current.startsWith("/admin")
                ? "bg-white/10 font-medium text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white",
            )}
          >
            <SquaresFour size={22} />
            Admin panel
          </Link>
        </div>
      )}

      {/* Safety + trusted contact */}
      <div className="mb-4 border-t border-white/10 pt-4">
        <Link
          href="/sos"
          onClick={() => setPending("/sos")}
          className={cn(
            "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.95rem] font-medium transition-colors",
            current === "/sos"
              ? "bg-white/10 text-[var(--color-accent)]"
              : "text-[var(--color-accent)] hover:bg-white/5",
          )}
        >
          <Lifebuoy size={22} weight="fill" />
          SOS
        </Link>
        {user.trustedName ? (
          <a
            href="#"
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[0.95rem] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Phone size={22} />
            Call {user.trustedName}
          </a>
        ) : null}
      </div>

      {/* Account */}
      <Link
        href="/profile"
        onClick={() => setPending("/profile")}
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-pill)] px-2 py-2 transition-colors hover:bg-white/5",
          current.startsWith("/profile") && "bg-white/10",
        )}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-fg)]">
          {user.avatarInitial}
        </span>
        <span className="flex-1 text-[0.95rem] text-white/90">{user.displayName}</span>
        <CaretRight size={18} className="text-white/50" />
      </Link>
    </aside>
  );
}

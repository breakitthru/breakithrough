"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  CalendarBlank,
  Sparkle,
  UsersThree,
  ShieldCheck,
  ChatCircleDots,
  Megaphone,
  VideoCamera,
  CurrencyInr,
  IdentificationBadge,
  ClipboardText,
  Gear,
  ShoppingBag,
  Package,
  type Icon,
} from "@phosphor-icons/react";
import { ADMIN_NAV } from "./nav";
import { roleCan } from "@/lib/permissions";
import type { StaffRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

const ICONS: Record<string, Icon> = {
  overview: SquaresFour,
  program: CalendarBlank,
  daylight: Sparkle,
  members: UsersThree,
  announcements: Megaphone,
  safety: ShieldCheck,
  community: ChatCircleDots,
  sessions: VideoCamera,
  money: CurrencyInr,
  shop: ShoppingBag,
  orders: Package,
  staff: IdentificationBadge,
  audit: ClipboardText,
  settings: Gear,
};

const ROLE_LABEL: Record<StaffRole, string> = {
  OWNER: "Owner",
  OPS: "Ops",
  CLINICIAN: "Clinician",
  MODERATOR: "Moderator",
  SPECIALIST: "Specialist",
};

export function AdminSidebar({
  role,
  displayName,
  avatarInitial,
  logoUrl,
  logoSize,
}: {
  role: StaffRole;
  displayName: string;
  avatarInitial: string;
  logoUrl?: string;
  logoSize?: number;
}) {
  const pathname = usePathname();
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => setPending(null), [pathname]);
  const current = pending ?? pathname;

  const isActive = (href: string) =>
    href === "/admin" ? current === "/admin" : current === href || current.startsWith(href + "/");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col bg-[var(--color-brand-ink)] px-4 py-5 text-[var(--color-brand-fg)]">
      {/* Brand */}
      <div className="mx-1 mb-6 flex items-center gap-2.5">
        <BrandLogo
          logoUrl={logoUrl}
          logoSize={logoSize}
          alt="Break It Thru"
          fallback={
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-on-dark.svg" alt="Break It Thru" className="h-11 w-auto" />
            </>
          }
        />
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-white/45">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {ADMIN_NAV.map((group, gi) => {
          const visible = group.items.filter((it) => it.comingSoon || !it.permission || roleCan(role, it.permission));
          if (visible.length === 0) return null;
          return (
            <div key={gi} className="flex flex-col gap-1">
              {group.label && (
                <p className="mb-0.5 px-3 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/35">
                  {group.label}
                </p>
              )}
              {visible.map((item) => {
                const Icon = ICONS[item.icon] ?? SquaresFour;
                if (item.comingSoon) {
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[0.9rem] text-white/30"
                      aria-disabled
                      title="Coming soon"
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={20} />
                        {item.label}
                      </span>
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wide text-white/40">
                        Soon
                      </span>
                    </div>
                  );
                }
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setPending(item.href)}
                    className={cn(
                      "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[0.9rem] transition-colors",
                      active ? "bg-white/10 font-medium text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon size={20} weight={active ? "fill" : "regular"} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer: environment + account */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wide text-[var(--color-success)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" /> Production
        </span>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-fg)]">
            {avatarInitial}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[0.9rem] text-white/90">{displayName}</p>
            <p className="text-[0.7rem] text-white/45">{ROLE_LABEL[role]}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

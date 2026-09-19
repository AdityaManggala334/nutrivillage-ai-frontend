"use client";

import {
  CalendarRange,
  LayoutDashboard,
  Leaf,
  ListTree,
  MapPin,
  Salad,
  ScrollText,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const GROUPS = [
  {
    title: "Utama",
    links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Data Master",
    links: [
      { href: "/admin/bahan", label: "Bahan Pangan", icon: Salad },
      { href: "/admin/nutrisi", label: "Nutrisi", icon: ListTree },
      { href: "/admin/menu", label: "Menu & Resep", icon: ScrollText },
      { href: "/admin/musim", label: "Musim", icon: CalendarRange },
      { href: "/admin/lokal", label: "Komoditas Lokal", icon: MapPin },
    ],
  },
  {
    title: "Harga & Scraper",
    links: [
      { href: "/admin/harga", label: "Verifikasi Harga", icon: Tags },
      { href: "/admin/monitoring", label: "Monitoring Scraper", icon: Leaf },
    ],
  },
] as const;

export interface AdminNavProps {
  readonly orientation?: "vertical" | "horizontal";
}

/** Navigasi panel admin (FR-22 s.d. FR-34). */
export function AdminNav({ orientation = "vertical" }: AdminNavProps) {
  const pathname = usePathname();
  const isHorizontal = orientation === "horizontal";

  return (
    <div className={cn(isHorizontal ? "flex gap-4 overflow-x-auto" : "space-y-5")}>
      {GROUPS.map((group) => (
        <div key={group.title} className={cn(isHorizontal && "shrink-0")}>
          {!isHorizontal ? (
            <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-stone-500 uppercase">
              {group.title}
            </p>
          ) : null}
          <div className={cn("flex gap-1", isHorizontal ? "flex-row" : "flex-col")}>
            {group.links.map((item) => {
              const isActive =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm shadow-brand-900/30"
                      : "text-stone-400 hover:bg-stone-800 hover:text-white",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

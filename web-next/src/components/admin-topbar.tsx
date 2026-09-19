"use client";

import { ArrowLeft, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui";
import { initialsOf, useSession } from "@/hooks/use-session";

const TITLES: ReadonlyArray<{ prefix: string; title: string }> = [
  { prefix: "/admin/bahan", title: "Bahan Pangan" },
  { prefix: "/admin/nutrisi", title: "Nutrisi" },
  { prefix: "/admin/harga", title: "Verifikasi Harga" },
  { prefix: "/admin/menu", title: "Menu & Resep" },
  { prefix: "/admin/musim", title: "Musim Komoditas" },
  { prefix: "/admin/lokal", title: "Komoditas Lokal" },
  { prefix: "/admin/monitoring", title: "Monitoring Scraper" },
  { prefix: "/admin", title: "Dashboard Admin" },
];

/** Topbar panel admin + navigasi mobile. */
export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const current =
    TITLES.find((item) => pathname.startsWith(item.prefix)) ?? {
      prefix: "/admin",
      title: "Dashboard Admin",
    };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={menuOpen ? "Tutup menu admin" : "Buka menu admin"}
            className="text-stone-500 lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
          <div>
            <p className="text-[11px] font-medium tracking-wide text-brand-700 uppercase dark:text-brand-400">
              Panel Admin
            </p>
            <h1 className="max-w-[55vw] truncate text-base font-bold text-stone-900 sm:max-w-none dark:text-stone-50">
              {current.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="hidden items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 sm:inline-flex dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Ke aplikasi
          </Link>
          <div className="mx-1 hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-200">
              {user ? initialsOf(user.name) : "?"}
            </div>
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
              {user?.name ?? "Admin"}
            </span>
          </div>
          <Button intent="ghost" size="icon" aria-label="Keluar" onClick={handleLogout}>
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-stone-200 bg-stone-900 px-4 py-4 lg:hidden dark:border-stone-800">
          <AdminNav orientation="horizontal" />
        </div>
      ) : null}
    </header>
  );
}

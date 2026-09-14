"use client";

import {
  Bell,
  Calendar,
  Compass,
  Heart,
  History,
  Home,
  Leaf,
  LogOut,
  Menu,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { initialsOf, useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

/**
 * Chrome dashboard (FR-07): sidebar + topbar. Digabung dalam satu modul klien
 * agar batas "use client" tetap di daun hierarki dan mudah dipelihara.
 */

interface NavLink {
  readonly label: string;
  readonly href: string;
  readonly icon: typeof Home;
  readonly badge?: string;
}

const MENU_LINKS: readonly NavLink[] = [
  { label: "Beranda", href: "/dashboard", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Meal Planner", href: "/meal-planner", icon: Calendar },
  { label: "Daftar Belanja", href: "/shopping-list", icon: ShoppingCart, badge: "0" },
];

const ACTIVITY_LINKS: readonly NavLink[] = [
  { label: "Riwayat", href: "/history", icon: History },
  { label: "Favorit", href: "/favorites", icon: Heart },
];

const ACCOUNT_LINKS: readonly NavLink[] = [
  { label: "Profil", href: "/onboarding", icon: User },
];

function NavItem({ item }: { item: NavLink }) {
  const pathname = usePathname();
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const isActive =
    item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={() => setSidebarOpen(false)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
        isActive
          ? "bg-brand-600 text-white shadow-sm"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50",
      )}
    >
      <Icon
        className={cn("size-[19px]", isActive ? "text-white" : "text-stone-500")}
        aria-hidden="true"
      />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span className="min-w-5 rounded-full bg-white/25 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function NavSection({ title, links }: { title: string; links: readonly NavLink[] }) {
  return (
    <div>
      <p className="mt-8 mb-2 px-3 text-[10px] font-bold tracking-wider text-stone-400 uppercase first:mt-0">
        {title}
      </p>
      <div className="space-y-1">
        {links.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

/** Sidebar dashboard — desain disamakan Modul 1-4, toggle via Zustand. */
export function DashboardSidebar() {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const router = useRouter();
  const { data: user } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <>
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          className="fixed inset-0 z-30 bg-stone-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[245px] flex-col border-r border-stone-200 bg-white transition-transform lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[88px] items-center px-7">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Leaf className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[16px] font-bold tracking-tight text-stone-900">NutriVillage</p>
              <p className="text-[10px] font-medium text-stone-400">AI</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <NavSection title="Menu" links={MENU_LINKS} />
          <NavSection title="Aktivitas" links={ACTIVITY_LINKS} />
          <NavSection title="Akun" links={ACCOUNT_LINKS} />
        </nav>

        <div className="border-t border-stone-100 p-4">
          <ThemeToggle variant="menu" />

          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
              {user ? initialsOf(user.name) : "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-800">
                {user?.name ?? "Pengguna"}
              </p>
              <p className="text-[11px] text-stone-400">
                {user?.role === "guest" ? "Tamu" : "Pengguna"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Keluar dari akun"
              disabled={isLoggingOut}
              className="text-stone-400 hover:text-red-600"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/** Topbar dashboard — versi mobile + desktop. */
export function DashboardTopbar() {
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const { data: user } = useSession();

  return (
    <>
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur lg:hidden dark:border-stone-800 dark:bg-stone-900/95">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Buka menu navigasi"
            onClick={() => setSidebarOpen(true)}
            className="text-stone-600"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Leaf className="size-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-stone-900">NutriVillage AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Notifikasi" className="relative text-stone-500">
            <Bell className="size-5" aria-hidden="true" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800">
            {user ? initialsOf(user.name) : "?"}
          </div>
        </div>
      </header>

      {/* Desktop topbar */}
      <header className="hidden h-[72px] items-center justify-between border-b border-stone-200 bg-white px-8 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-50 text-stone-500">
            <Compass className="size-[18px]" aria-hidden="true" />
          </div>
          <p className="text-sm text-stone-500">Dashboard</p>
        </div>

        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative text-stone-500 hover:text-stone-800"
          >
            <Bell className="size-5" aria-hidden="true" />
            <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
          <div className="h-6 w-px bg-stone-200" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800">
              {user ? initialsOf(user.name) : "?"}
            </div>
            <span className="text-xs font-semibold text-stone-700">
              {user?.name ?? "Pengguna"}
            </span>
          </div>
        </div>
      </header>
    </>
  );
}

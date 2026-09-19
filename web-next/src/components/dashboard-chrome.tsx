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
  ShieldCheck,
  ShoppingCart,
  User,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNotifications } from "@/hooks/use-notifications";
import { initialsOf, useSession } from "@/hooks/use-session";
import { cn, formatDateId } from "@/lib/utils";
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
  { label: "Profil", href: "/profile", icon: User },
  { label: "Notifikasi", href: "/notifications", icon: Bell },
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

          {user?.role === "admin" ? (
            <div className="mt-8">
              <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                Admin
              </p>
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl bg-stone-800 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                <ShieldCheck className="size-[19px]" aria-hidden="true" /> Panel Admin
              </Link>
            </div>
          ) : null}
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

const KIND_DOT: Record<"info" | "success" | "warning", string> = {
  info: "bg-sky-500",
  success: "bg-brand-500",
  warning: "bg-harvest-500",
};

/** Ikon lonceng + popup notifikasi (Radix Popover). Klik item → /notifications. */
function NotificationBell() {
  const { data, isPending, isError } = useNotifications();
  const notifications = data ?? [];
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Buka notifikasi"
          className="relative rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 dark:hover:bg-stone-800"
        >
          <Bell className="size-5" aria-hidden="true" />
          {unread > 0 ? (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500" />
          ) : null}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200 bg-white p-2 shadow-xl focus:outline-none dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
              Notifikasi
            </span>
            <span className="text-[11px] text-stone-400">{unread} belum dibaca</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isPending ? (
              <div className="space-y-2 p-2">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800"
                  />
                ))}
              </div>
            ) : isError ? (
              <p className="px-3 py-4 text-sm text-red-600">Gagal memuat notifikasi.</p>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-stone-400">
                Belum ada notifikasi.
              </p>
            ) : (
              notifications.slice(0, 5).map((item) => (
                <Popover.Close key={item.id} asChild>
                  <Link
                    href="/notifications"
                    className="flex gap-2.5 rounded-xl px-2 py-2 transition hover:bg-stone-50 dark:hover:bg-stone-800/60"
                  >
                    <span
                      className={cn("mt-1.5 size-2 shrink-0 rounded-full", KIND_DOT[item.kind])}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                        {item.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-stone-500 dark:text-stone-400">
                        {item.message}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-stone-400">
                        {formatDateId(item.createdAt)}
                      </span>
                    </span>
                  </Link>
                </Popover.Close>
              ))
            )}
          </div>

          <Popover.Close asChild>
            <Link
              href="/notifications"
              className="mt-1 block rounded-xl px-2 py-2 text-center text-xs font-semibold text-brand-700 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950/40"
            >
              Lihat semua notifikasi
            </Link>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
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
          <NotificationBell />
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
          <NotificationBell />
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

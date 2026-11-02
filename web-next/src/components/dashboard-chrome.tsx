"use client";

import {
  Bell,
  Calendar,
  ChevronDown,
  Compass,
  Heart,
  History,
  Home,
  Leaf,
  LogOut,
  Menu,
  School,
  Settings,
  ShieldCheck,
  ShoppingCart,
  User,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

interface NavGroup {
  readonly title: string;
  readonly links: readonly NavLink[];
}

const FAMILY_NAV: readonly NavGroup[] = [
  {
    title: "Menu",
    links: [
      { label: "Beranda", href: "/dashboard", icon: Home },
      { label: "Explore", href: "/explore", icon: Compass },
      { label: "Meal Planner", href: "/meal-planner", icon: Calendar },
      { label: "Daftar Belanja", href: "/shopping-list", icon: ShoppingCart },
    ],
  },
  {
    title: "Aktivitas",
    links: [
      { label: "Riwayat", href: "/history", icon: History },
      { label: "Favorit", href: "/favorites", icon: Heart },
    ],
  },
  {
    title: "Akun",
    links: [
      { label: "Profil", href: "/profile", icon: User },
      { label: "Notifikasi", href: "/notifications", icon: Bell },
    ],
  },
];

const SPPG_NAV: readonly NavGroup[] = [
  {
    title: "SPPG",
    links: [
      { label: "Dashboard SPPG", href: "/sppg", icon: Home },
      { label: "Data Sekolah", href: "/sppg/schools", icon: School },
    ],
  },
  {
    title: "Menu Massal",
    links: [
      { label: "Explore Menu", href: "/sppg/explore", icon: Compass },
      { label: "Meal Planner", href: "/sppg/meal-planner", icon: Calendar },
      { label: "Daftar Belanja", href: "/sppg/shopping-list", icon: ShoppingCart },
    ],
  },
  {
    title: "Akun",
    links: [
      { label: "Pengaturan", href: "/sppg/settings", icon: Settings },
      { label: "Notifikasi", href: "/notifications", icon: Bell },
    ],
  },
];

const ROLE_LABEL: Readonly<Record<string, string>> = {
  user: "Masyarakat",
  petugas_sppg: "Petugas SPPG",
  admin: "Admin",
  guest: "Tamu",
};

/** Tujuan baris akun di sidebar & dropdown topbar, menyesuaikan peran. */
const accountTarget = (role?: string): { href: string; label: string } => {
  if (role === "petugas_sppg") return { href: "/sppg/settings", label: "Pengaturan" };
  if (role === "admin") return { href: "/admin", label: "Pengaturan" };
  return { href: "/profile", label: "Profil" };
};

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
  const { data: user } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // Reload penuh: menjamin semua cache/state user sebelumnya terhapus.
    window.location.assign("/login");
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
          "glass-strong fixed inset-y-0 left-0 z-40 flex w-[245px] flex-col border-x-0 border-t-0 border-r border-white/40 transition-transform lg:translate-x-0 dark:border-white/10",
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
          {(user?.role === "petugas_sppg" ? SPPG_NAV : FAMILY_NAV).map((group) => (
            <NavSection key={group.title} title={group.title} links={group.links} />
          ))}

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
            <Link
              href={accountTarget(user?.role).href}
              onClick={() => setSidebarOpen(false)}
              className="min-w-0 flex-1 rounded-lg py-1 transition hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label={`Buka ${accountTarget(user?.role).label}`}
            >
              <p className="truncate text-sm font-semibold text-stone-800">
                {user?.name ?? "Pengguna"}
              </p>
              <p className="truncate text-[11px] text-stone-400">
                {user ? (ROLE_LABEL[user.role] ?? "Pengguna") : "Pengguna"}
              </p>
            </Link>
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
          className="glass-strong z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-2 focus:outline-none"
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

/**
 * Dropdown akun pada topbar (desktop & mobile): nama + peran, tautan Profil /
 * Pengaturan sesuai peran, dan aksi Keluar.
 */
function AccountMenu({ compact }: { readonly compact?: boolean }) {
  const { data: user } = useSession();
  const target = accountTarget(user?.role);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  };

  const menuLinkClass =
    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800";

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Menu akun"
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800">
            {user ? initialsOf(user.name) : "?"}
          </span>
          {!compact ? (
            <span className="hidden max-w-32 truncate text-xs font-semibold text-stone-700 lg:inline dark:text-stone-200">
              {user?.name ?? "Pengguna"}
            </span>
          ) : null}
          <ChevronDown className="size-3.5 text-stone-400" aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="glass-strong z-50 w-64 max-w-[calc(100vw-2rem)] rounded-2xl p-2 focus:outline-none"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
              {user?.name ?? "Pengguna"}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-400">
              {user ? `${user.email} • ${ROLE_LABEL[user.role] ?? "Pengguna"}` : "Tamu"}
            </p>
          </div>

          <div className="my-1 h-px bg-stone-200/70 dark:bg-stone-700/60" />

          <Popover.Close asChild>
            <Link href="/profile" className={menuLinkClass}>
              <User className="size-4" aria-hidden="true" /> Profil
            </Link>
          </Popover.Close>

          {target.href !== "/profile" ? (
            <Popover.Close asChild>
              <Link href={target.href} className={menuLinkClass}>
                <Settings className="size-4" aria-hidden="true" /> {target.label}
              </Link>
            </Popover.Close>
          ) : null}

          {user?.role === "admin" ? (
            <Popover.Close asChild>
              <Link href="/admin" className={menuLinkClass}>
                <ShieldCheck className="size-4" aria-hidden="true" /> Panel Admin
              </Link>
            </Popover.Close>
          ) : null}

          <div className="my-1 h-px bg-stone-200/70 dark:bg-stone-700/60" />

          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut className="size-4" aria-hidden="true" /> Keluar
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Topbar dashboard — versi mobile + desktop. */
export function DashboardTopbar() {
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  return (
    <>
      {/* Mobile header */}
      <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between border-x-0 border-t-0 border-b border-white/50 px-4 lg:hidden dark:border-white/10">
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
          <AccountMenu compact />
        </div>
      </header>

      {/* Desktop topbar */}
      <header className="glass sticky top-0 z-30 hidden h-[72px] items-center justify-between border-x-0 border-t-0 border-b border-white/50 px-8 lg:flex dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-50 text-stone-500">
            <Compass className="size-[18px]" aria-hidden="true" />
          </div>
          <p className="text-sm text-stone-500">Dashboard</p>
        </div>

        <div className="flex items-center gap-5">
          <NotificationBell />
          <div className="h-6 w-px bg-stone-200" />
          <AccountMenu />
        </div>
      </header>
    </>
  );
}

import { Leaf, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin-nav";
import { AdminTopbar } from "@/components/admin-topbar";
import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/constants";

/**
 * Nested layout sisi Admin (FR-22 s.d. FR-34). Terpisah dari layout pengguna
 * karena alur admin berada di luar alur utama pengguna (SKPL BAB VII).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  // RBAC: panel admin hanya untuk role admin. Pengguna biasa dialihkan ke dashboard.
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const role = cookieStore.get(ROLE_COOKIE)?.value;
  if (!session) redirect("/login?redirect=/admin&auth_error=1");
  if (role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <div className="flex w-full">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-stone-900 p-4 lg:flex">
          <Link href="/" className="mb-6 flex items-center gap-2.5 px-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold text-white">NutriVillage AI</span>
              <span className="block text-[11px] text-stone-400">Panel Admin</span>
            </span>
          </Link>

          <nav className="flex-1 overflow-y-auto" aria-label="Navigasi admin">
            <AdminNav />
          </nav>

          <div className="mt-4 rounded-xl bg-stone-800/70 p-3 text-[11px] leading-relaxed text-stone-400">
            <p className="flex items-center gap-1.5 font-semibold text-stone-200">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> Mode Demo
            </p>
            <p className="mt-1">Data master bersifat tiruan untuk keperluan praktikum.</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <AdminTopbar />
          <main id="konten-utama" className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardSidebar, DashboardTopbar } from "@/components/dashboard-chrome";
import { SESSION_COOKIE } from "@/lib/constants";
import { getUserByToken } from "@/server/auth";

/**
 * Layout area Petugas Lapangan.
 *
 * Peran dibaca dari sesi yang JWT-nya sudah diverifikasi — cookie peran di
 * middleware hanya pengalih cepat, bukan batas keamanan.
 */
export default async function LapanganLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) redirect("/login?redirect=/lapangan&auth_error=1");

  const user = getUserByToken(session);
  if (!user) redirect("/login?redirect=/lapangan&auth_error=1");
  if (user.role !== "petugas_lapangan" && user.role !== "admin") redirect("/dashboard");

  return (
    <div className="relative isolate min-h-screen bg-[#f6f8f5] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-mesh absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/30" />
        <div className="animate-mesh absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-harvest-200/40 blur-3xl [animation-delay:-10s]" />
      </div>
      <DashboardSidebar />
      <div className="lg:pl-[245px]">
        <DashboardTopbar />
        <main id="konten-utama" className="mx-auto max-w-[900px] px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { DashboardSidebar, DashboardTopbar } from "@/components/dashboard-chrome";

/**
 * Layout area Petugas SPPG. Memakai chrome dashboard yang sama (navigasi
 * menyesuaikan peran) sehingga identitas visual tetap konsisten.
 */
export default function SppgLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-screen bg-[#f6f8f5] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-mesh absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/30" />
        <div className="animate-mesh absolute top-1/2 -left-24 h-96 w-96 rounded-full bg-harvest-200/40 blur-3xl [animation-delay:-8s] dark:bg-harvest-900/20" />
        <div className="animate-mesh absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl [animation-delay:-14s]" />
      </div>
      <DashboardSidebar />
      <div className="lg:pl-[245px]">
        <DashboardTopbar />
        <main id="konten-utama" className="mx-auto max-w-[1450px] px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

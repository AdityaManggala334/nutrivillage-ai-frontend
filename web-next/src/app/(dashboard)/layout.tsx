import type { ReactNode } from "react";
import { DashboardSidebar, DashboardTopbar } from "@/components/dashboard-chrome";

/**
 * Modul 6: Nested Layout tingkat kedua (setelah Root Layout).
 * Layout ini dipertahankan (tidak re-render) saat navigasi antar
 * /dashboard, /explore, /history, dan /meal-planner.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafbf9] text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <DashboardSidebar />
      <div className="lg:pl-[245px]">
        <DashboardTopbar />
        <main
          id="konten-utama"
          className="mx-auto max-w-[1450px] px-4 py-6 md:px-8 md:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

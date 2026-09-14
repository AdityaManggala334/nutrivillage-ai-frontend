import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard-home";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Ringkasan profil keluarga, rekomendasi menu terakhir, dan akses cepat ke Explore, Meal Planner, serta Riwayat.",
  robots: { index: false, follow: false },
};

/** FR-07: halaman utama (Home/Dashboard). */
export default function DashboardPage() {
  return <DashboardHome />;
}

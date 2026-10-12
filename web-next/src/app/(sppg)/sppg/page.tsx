import type { Metadata } from "next";
import { SppgDashboard } from "@/components/sppg/sppg-dashboard";

export const metadata: Metadata = {
  title: "Dashboard SPPG",
  description:
    "Ringkasan sekolah yang dikelola, jumlah siswa per kelompok penerima, dan akses cepat ke perencanaan menu massal.",
  robots: { index: false, follow: false },
};

/** Dashboard khusus Petugas SPPG MBG. */
export default function SppgHomePage() {
  return <SppgDashboard />;
}

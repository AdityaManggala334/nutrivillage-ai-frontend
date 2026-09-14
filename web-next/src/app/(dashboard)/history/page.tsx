import type { Metadata } from "next";
import { HistoryList } from "@/components/history-list";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Riwayat Rekomendasi",
  description:
    "Lihat kembali rekomendasi menu dan jadwal yang pernah dibuat, filter berdasarkan favorit atau bulan ini.",
};

/** FR-13 & FR-14: halaman riwayat. Filter (Zustand) + data (TanStack Query). */
export default function HistoryPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Arsip Menu"
        title="Riwayat Rekomendasi"
        description="Semua menu yang Anda simpan dari Explore dan Meal Planner tersimpan di sini. Gunakan filter dan pencarian untuk menemukan kembali."
      />
      <HistoryList />
    </div>
  );
}

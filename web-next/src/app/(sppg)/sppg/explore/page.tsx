import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { SppgExplore } from "@/components/sppg/sppg-explore";

export const metadata: Metadata = {
  title: "Explore Menu SPPG",
  description:
    "Rekomendasi menu massal berdasarkan sekolah, kelompok penerima, jumlah porsi, dan batas anggaran bahan pangan.",
  robots: { index: false, follow: false },
};

/** Explore khusus Petugas SPPG. */
export default function SppgExplorePage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Rekomendasi Menu Massal"
        title="Explore Menu SPPG"
        description="Pilih sekolah dan kelompok penerima, tetapkan anggaran bahan pangan per porsi, lalu susun rekomendasi menu sesuai jumlah porsi."
      />
      <SppgExplore />
    </div>
  );
}

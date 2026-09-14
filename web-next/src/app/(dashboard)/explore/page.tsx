import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore-client";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Explore Menu",
  description:
    "Masukkan anggaran, jumlah anggota keluarga, tujuan gizi, preferensi, dan alergi untuk mendapatkan 3-5 rekomendasi menu bergizi pangan lokal Madiun.",
};

/** FR-08 & FR-10: halaman Explore. RSC shell + Client Component interaktif. */
export default function ExplorePage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Rekomendasi Menu"
        title="Explore Menu"
        description="Atur parameter kebutuhan keluarga, lalu sistem akan menyusun rekomendasi menu bergizi dengan skor nutrisi, anggaran, dan pangan lokal."
      />
      <ExploreClient />
    </div>
  );
}

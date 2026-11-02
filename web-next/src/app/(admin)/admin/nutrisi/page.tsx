import type { Metadata } from "next";
import { AdminNutrition } from "@/components/admin-nutrition";
import { AdminPageHeader } from "@/components/admin-table";

export const metadata: Metadata = {
  title: "Kelola Nutrisi",
  robots: { index: false, follow: false },
};

/**
 * FR-22 & FR-30: gizi bahan yang dipakai mesin rekomendasi.
 *
 * Angka di halaman ini adalah angka yang benar-benar dihitung mesin — bukan
 * salinan. Menyimpan satu baris langsung mengubah rekomendasi berikutnya dan
 * menghitung ulang gizi seluruh menu yang memakai bahan tersebut.
 */
export default function AdminNutritionPage() {
  return (
    <div>
      <AdminPageHeader
        title="Data Nutrisi & Harga Bahan"
        description="Gizi per 100 g, BDD, alergen, slot MBG, dan harga per kg. Geser tabel ke samping untuk melihat seluruh kolom. Sumber acuan: TKPI Kemenkes RI."
      />
      <AdminNutrition />
    </div>
  );
}

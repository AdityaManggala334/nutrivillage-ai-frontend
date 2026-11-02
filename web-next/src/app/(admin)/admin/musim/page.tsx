import type { Metadata } from "next";
import { AdminSeasons } from "@/components/admin-seasons";
import { AdminPageHeader } from "@/components/admin-table";
import { listAdminIngredients, listSeasons } from "@/server/admin-master";

export const metadata: Metadata = {
  title: "Kelola Musim",
  robots: { index: false, follow: false },
};

/** FR-22: pengelolaan data musim komoditas. */
export default async function AdminSeasonsPage() {
  const [seasons, ingredients] = await Promise.all([
    listSeasons(),
    listAdminIngredients(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Musim Komoditas"
        description="Tambah, ubah, dan hapus data musim. Data ini menjadi salah satu bobot penilaian rekomendasi."
      />
      <AdminSeasons items={seasons} ingredients={ingredients} />
    </div>
  );
}

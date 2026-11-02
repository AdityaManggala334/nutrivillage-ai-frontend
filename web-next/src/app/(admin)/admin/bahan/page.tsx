import type { Metadata } from "next";
import { AdminIngredients } from "@/components/admin-ingredients";
import { AdminPageHeader } from "@/components/admin-table";
import { listAdminIngredients } from "@/server/admin-master";

export const metadata: Metadata = {
  title: "Kelola Bahan Pangan",
  robots: { index: false, follow: false },
};

/** FR-22 & FR-30: pengelolaan data master bahan pangan. */
export default async function AdminIngredientsPage() {
  const ingredients = await listAdminIngredients();

  return (
    <div>
      <AdminPageHeader
        title="Bahan Pangan"
        description="Tambah, ubah, dan hapus bahan. Perubahan langsung dipakai mesin rekomendasi."
      />
      <AdminIngredients items={ingredients} />
    </div>
  );
}

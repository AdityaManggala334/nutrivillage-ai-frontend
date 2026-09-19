import type { Metadata } from "next";
import { AdminPageHeader, AdminTable, AdminCell } from "@/components/admin-table";
import { formatRupiah } from "@/lib/utils";
import { getAdminIngredients } from "@/server/admin-data";

export const metadata: Metadata = {
  title: "Kelola Bahan Pangan",
  robots: { index: false, follow: false },
};

/** FR-22 & FR-30: pengelolaan data master bahan pangan. */
export default async function AdminIngredientsPage() {
  const ingredients = await getAdminIngredients();

  return (
    <div>
      <AdminPageHeader
        title="Bahan Pangan"
        description="Data master bahan pangan beserta status lokal dan musim."
      />
      <AdminTable headers={["Nama", "Kategori", "Satuan", "Lokal", "Musim", "Harga Terakhir"]}>
        {ingredients.map((item) => (
          <tr key={item.id}>
            <AdminCell>{item.name}</AdminCell>
            <AdminCell>{item.category}</AdminCell>
            <AdminCell>{item.unit}</AdminCell>
            <AdminCell>{item.isLocal ? "Ya" : "Tidak"}</AdminCell>
            <AdminCell>{item.isInSeason ? "Ya" : "Tidak"}</AdminCell>
            <AdminCell>{formatRupiah(item.latestPrice)}</AdminCell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

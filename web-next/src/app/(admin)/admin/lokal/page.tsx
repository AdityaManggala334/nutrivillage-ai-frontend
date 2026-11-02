import type { Metadata } from "next";
import { AdminLocal } from "@/components/admin-local";
import { AdminPageHeader } from "@/components/admin-table";
import {
  listAdminIngredients,
  listLocalCommodities,
  listRegionOptions,
} from "@/server/admin-master";

export const metadata: Metadata = {
  title: "Komoditas Lokal",
  robots: { index: false, follow: false },
};

/** FR-22: pengelolaan data komoditas lokal. */
export default async function AdminLocalPage() {
  const [commodities, ingredients, regions] = await Promise.all([
    listLocalCommodities(),
    listAdminIngredients(),
    listRegionOptions(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Komoditas Lokal"
        description="Tambah, ubah, dan hapus ketersediaan lokal per bahan dan wilayah."
      />
      <AdminLocal items={commodities} ingredients={ingredients} regions={regions} />
    </div>
  );
}

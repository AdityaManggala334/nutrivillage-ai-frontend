import type { Metadata } from "next";
import { AdminPageHeader, AdminTable, AdminCell } from "@/components/admin-table";
import { getLocalCommodities } from "@/server/admin-data";

export const metadata: Metadata = {
  title: "Komoditas Lokal",
  robots: { index: false, follow: false },
};

/** FR-22: pengelolaan data komoditas lokal. */
export default async function AdminLocalPage() {
  const commodities = await getLocalCommodities();

  return (
    <div>
      <AdminPageHeader
        title="Komoditas Lokal"
        description="Daftar komoditas lokal yang diprioritaskan dalam rekomendasi."
      />
      <AdminTable headers={["Komoditas", "Wilayah", "Status Lokal"]}>
        {commodities.map((item) => (
          <tr key={item.id}>
            <AdminCell>{item.name}</AdminCell>
            <AdminCell>{item.region}</AdminCell>
            <AdminCell>{item.isLocal ? "Lokal" : "Luar daerah"}</AdminCell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

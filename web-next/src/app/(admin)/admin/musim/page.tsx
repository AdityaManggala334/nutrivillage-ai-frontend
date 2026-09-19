import type { Metadata } from "next";
import { AdminPageHeader, AdminTable, AdminCell } from "@/components/admin-table";
import { getSeasons } from "@/server/admin-data";

export const metadata: Metadata = {
  title: "Kelola Musim",
  robots: { index: false, follow: false },
};

/** FR-22: pengelolaan data musim komoditas. */
export default async function AdminSeasonsPage() {
  const seasons = await getSeasons();

  return (
    <div>
      <AdminPageHeader
        title="Musim Komoditas"
        description="Data musim dipakai sebagai salah satu bobot penilaian rekomendasi."
      />
      <AdminTable headers={["Komoditas", "Bulan Musim"]}>
        {seasons.map((season) => (
          <tr key={season.id}>
            <AdminCell>{season.commodity}</AdminCell>
            <AdminCell>{season.months.join(", ")}</AdminCell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

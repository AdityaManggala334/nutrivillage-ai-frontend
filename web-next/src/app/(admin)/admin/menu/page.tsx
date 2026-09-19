import type { Metadata } from "next";
import { AdminPageHeader, AdminTable, AdminCell } from "@/components/admin-table";
import { formatRupiah } from "@/lib/utils";
import { getAdminRecipes } from "@/server/admin-data";

export const metadata: Metadata = {
  title: "Kelola Menu & Resep",
  robots: { index: false, follow: false },
};

/** FR-22 & FR-30: pengelolaan data master menu/resep. */
export default async function AdminRecipesPage() {
  const recipes = await getAdminRecipes();

  return (
    <div>
      <AdminPageHeader
        title="Menu & Resep"
        description="Daftar menu beserta estimasi biaya dan status pangan lokal."
      />
      <AdminTable headers={["Nama Menu", "Kategori", "Porsi", "Estimasi Biaya", "Lokal", "Musim"]}>
        {recipes.map((recipe) => (
          <tr key={recipe.id}>
            <AdminCell>{recipe.name}</AdminCell>
            <AdminCell>{recipe.category}</AdminCell>
            <AdminCell>{recipe.servings}</AdminCell>
            <AdminCell>{formatRupiah(recipe.estimatedCost)}</AdminCell>
            <AdminCell>{recipe.isLocal ? "Ya" : "Tidak"}</AdminCell>
            <AdminCell>{recipe.inSeason ? "Ya" : "Tidak"}</AdminCell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

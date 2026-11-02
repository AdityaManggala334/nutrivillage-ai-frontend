import type { Metadata } from "next";
import { AdminRecipes } from "@/components/admin-recipes";
import { AdminPageHeader } from "@/components/admin-table";
import { listAdminIngredients, listAdminRecipes, listFoodSafety } from "@/server/admin-master";

export const metadata: Metadata = {
  title: "Kelola Menu & Resep",
  robots: { index: false, follow: false },
};

/** FR-22 & FR-30: pengelolaan data master menu/resep. */
export default async function AdminRecipesPage() {
  const [recipes, ingredients, safetyEntries] = await Promise.all([
    listAdminRecipes(),
    listAdminIngredients(),
    listFoodSafety(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Menu & Resep"
        description="Tambah, ubah, dan hapus menu beserta komposisi bahan. Gizi menu dihitung ulang otomatis."
      />
      <AdminRecipes items={recipes} ingredients={ingredients} safetyEntries={safetyEntries} />
    </div>
  );
}

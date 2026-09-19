import type { Metadata } from "next";
import { AdminPageHeader, AdminTable, AdminCell } from "@/components/admin-table";
import { MOCK_RECIPES } from "@/server/mock-data";

export const metadata: Metadata = {
  title: "Kelola Nutrisi",
  robots: { index: false, follow: false },
};

/** FR-22 & FR-30: data nutrisi (mengacu TKPI pada SKPL). */
export default function AdminNutritionPage() {
  const recipes = MOCK_RECIPES;

  return (
    <div>
      <AdminPageHeader
        title="Data Nutrisi"
        description="Kandungan gizi tiap menu. Sumber data mengacu pada TKPI (NFR-06)."
      />
      <AdminTable headers={["Menu", "Kalori", "Protein", "Karbohidrat", "Lemak", "Serat"]}>
        {recipes.map((recipe) => (
          <tr key={recipe.id}>
            <AdminCell>{recipe.name}</AdminCell>
            <AdminCell>{recipe.nutrition.calories} kkal</AdminCell>
            <AdminCell>{recipe.nutrition.protein} g</AdminCell>
            <AdminCell>{recipe.nutrition.carbohydrates} g</AdminCell>
            <AdminCell>{recipe.nutrition.fat} g</AdminCell>
            <AdminCell>{recipe.nutrition.fiber} g</AdminCell>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

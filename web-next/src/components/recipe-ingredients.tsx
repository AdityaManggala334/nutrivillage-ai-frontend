import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatRupiah } from "@/lib/utils";
import type { Recipe } from "@/schemas/domain";

export interface RecipeIngredientsProps {
  readonly recipe: Recipe;
}

/** FR-11: daftar bahan + estimasi harga. React Server Component. */
export function RecipeIngredients({ recipe }: RecipeIngredientsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bahan &amp; Estimasi Harga</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {recipe.ingredients.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-stone-700 dark:text-stone-200">
                {item.name}{" "}
                <span className="text-stone-400">
                  {item.quantity} {item.unit}
                </span>
              </span>
              <span className="font-medium text-stone-700 dark:text-stone-200">
                {formatRupiah(item.estimatedPrice)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3 text-sm font-semibold text-stone-900 dark:border-stone-800 dark:text-stone-50">
          <span>Total estimasi</span>
          <span>{formatRupiah(recipe.estimatedCost)}</span>
        </p>
      </CardContent>
    </Card>
  );
}

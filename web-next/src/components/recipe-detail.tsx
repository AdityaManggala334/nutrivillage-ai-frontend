import { ArrowLeft, Clock, Users } from "lucide-react";
import Link from "next/link";
import { NutritionFacts } from "@/components/nutrition-facts";
import { PriceDisclaimer } from "@/components/price-disclaimer";
import { PriceFreshnessBadge } from "@/components/price-freshness-badge";
import { RecipeActions } from "@/components/recipe-actions";
import { RecipeImage } from "@/components/recipe-image";
import { RecipeIngredients } from "@/components/recipe-ingredients";
import { RecipeSteps } from "@/components/recipe-steps";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatRupiah } from "@/lib/utils";
import type { Recipe } from "@/schemas/domain";

export interface RecipeDetailProps {
  readonly recipe: Recipe;
}

/**
 * FR-11: detail resep lengkap (gizi, bahan + estimasi harga, cara masak).
 * React Server Component: tidak ada JS klien selain RecipeActions.
 */
export function RecipeDetail({ recipe }: RecipeDetailProps) {
  return (
    <div className="space-y-6">
      <Link
        href="/explore"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke Explore
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <RecipeImage
            imageKey={recipe.imageKey}
            alt={recipe.imageAlt}
            className="h-56 w-full rounded-2xl sm:h-72"
            priority
          />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{recipe.category}</Badge>
              {recipe.isLocal ? <Badge tone="harvest">Pangan lokal</Badge> : null}
              {recipe.inSeason ? <Badge tone="info">Musim ini</Badge> : null}
              <PriceFreshnessBadge recipe={recipe} />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl dark:text-stone-50">
              {recipe.name}
            </h1>
            <p className="max-w-2xl text-stone-600 dark:text-stone-300">{recipe.description}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-600 dark:text-stone-300">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4 text-brand-600" aria-hidden="true" />
                {recipe.servings} porsi keluarga
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-brand-600" aria-hidden="true" />
                Estimasi biaya {formatRupiah(recipe.estimatedCost)}
              </span>
            </div>
            <PriceDisclaimer />
          </div>

          <NutritionFacts nutrition={recipe.nutrition} servings={recipe.servings} />

          <RecipeSteps recipe={recipe} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <RecipeIngredients recipe={recipe} />

          <Card>
            <CardHeader>
              <CardTitle>Aksi Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <RecipeActions recipeId={recipe.id} recipeName={recipe.name} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

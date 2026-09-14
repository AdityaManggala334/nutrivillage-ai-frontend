import Link from "next/link";
import { Flame, Leaf, MapPin, Wallet } from "lucide-react";
import { PriceFreshnessBadge } from "@/components/price-freshness-badge";
import { RecipeImage } from "@/components/recipe-image";
import { Badge, Card, CardContent, CardFooter, CardHeader } from "@/components/ui";
import { formatRupiah } from "@/lib/utils";
import type { Recipe, RecommendationScores } from "@/schemas/domain";

export interface RecipeCardProps {
  readonly recipe: Recipe;
  readonly scores?: RecommendationScores;
  readonly rank?: number;
  readonly children?: React.ReactNode;
}

/**
 * FR-10: kartu hasil rekomendasi. RSC presentational — dipakai ulang di
 * Explore, Riwayat, dan Meal Planner tanpa JS klien.
 */
export function RecipeCard({ recipe, scores, rank, children }: RecipeCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <RecipeImage
          imageKey={recipe.imageKey}
          alt={recipe.imageAlt}
          className="h-36 w-full"
          priority={rank === 1}
        />
        {typeof rank === "number" ? (
          <span className="absolute top-3 left-3 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-brand-700 shadow">
            #{rank}
          </span>
        ) : null}
        {typeof scores?.total === "number" ? (
          <span className="absolute top-3 right-3 rounded-full bg-brand-700/90 px-2.5 py-1 text-xs font-semibold text-white shadow">
            Skor {scores.total}
          </span>
        ) : null}
      </div>

      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="brand">
            <MapPin className="size-3" aria-hidden="true" /> {recipe.category}
          </Badge>
          {recipe.isLocal ? (
            <Badge tone="harvest">
              <Leaf className="size-3" aria-hidden="true" /> Pangan lokal
            </Badge>
          ) : null}
          {recipe.inSeason ? <Badge tone="info">Musim ini</Badge> : null}
          <PriceFreshnessBadge recipe={recipe} />
        </div>
        <Link
          href={`/recipes/${recipe.id}`}
          className="text-base font-semibold text-stone-900 hover:text-brand-700 dark:text-stone-50 dark:hover:text-brand-300"
        >
          {recipe.name}
        </Link>
        <p className="line-clamp-2 text-sm text-stone-500 dark:text-stone-400">
          {recipe.description}
        </p>
      </CardHeader>

      <CardContent className="mt-auto flex flex-wrap gap-4 text-xs text-stone-600 dark:text-stone-300">
        <span className="inline-flex items-center gap-1">
          <Wallet className="size-3.5 text-brand-600" aria-hidden="true" />
          {formatRupiah(recipe.estimatedCost)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Flame className="size-3.5 text-harvest-500" aria-hidden="true" />
          {recipe.nutrition.calories} kkal
        </span>
        <span>{recipe.nutrition.protein} g protein</span>
        <span>{recipe.servings} porsi</span>
      </CardContent>

      {children ? (
        <CardFooter className="flex-wrap">{children}</CardFooter>
      ) : null}
    </Card>
  );
}

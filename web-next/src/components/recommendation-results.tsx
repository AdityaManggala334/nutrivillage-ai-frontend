"use client";

import { Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { RecipeCard } from "@/components/recipe-card";
import { SaveRecipeButton } from "@/components/save-recipe-button";
import { Button, ButtonLink, RecipeCardSkeleton } from "@/components/ui";
import { useRecommendations } from "@/hooks/use-recommendations";
import type { ExploreFormData } from "@/schemas/explore";

export interface RecommendationResultsProps {
  readonly payload: ExploreFormData | null;
}

/** FR-10: area hasil 3-5 kartu rekomendasi (Server State via TanStack Query). */
export function RecommendationResults({ payload }: RecommendationResultsProps) {
  const { data, isPending, isError, error, refetch, isFetching } = useRecommendations(payload);

  if (!payload) {
    return (
      <EmptyState
        title="Belum ada rekomendasi"
        description="Isi parameter kebutuhan keluarga lalu tekan tombol Generate Rekomendasi untuk melihat 3-5 menu bergizi."
      />
    );
  }

  if (isPending) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {[0, 1, 2].map((index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat rekomendasi"
        message={error instanceof Error ? error.message : "Terjadi kesalahan tak terduga."}
        action={
          <Button intent="danger" onClick={() => void refetch()} loading={isFetching}>
            Coba lagi
          </Button>
        }
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="Tidak ada menu yang cocok"
        description="Semua menu melebihi anggaran atau mengandung alergi yang dipilih. Coba naikkan anggaran atau kurangi pantangan."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 dark:text-stone-400" role="status">
        Ditemukan <strong>{data.length} menu</strong> sesuai kebutuhan keluarga Anda.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.map((recommendation) => (
          <RecipeCard
            key={recommendation.id}
            recipe={recommendation.recipe}
            scores={recommendation.scores}
            rank={recommendation.rank}
          >
            <SaveRecipeButton recipeId={recommendation.recipe.id} note={recommendation.explanation} />
            <ButtonLink
              intent="outline"
              size="sm"
              href={`/recipes/${recommendation.recipe.id}`}
            >
              <Search className="size-4" aria-hidden="true" /> Detail
            </ButtonLink>
          </RecipeCard>
        ))}
      </div>
    </div>
  );
}

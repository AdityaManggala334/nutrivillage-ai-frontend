"use client";

import { Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { RecipeCard } from "@/components/recipe-card";
import { SaveRecipeButton } from "@/components/save-recipe-button";
import { Button, ButtonLink, RecipeCardSkeleton } from "@/components/ui";
import { useRecommendations } from "@/hooks/use-recommendations";
import type { Recommendation } from "@/schemas/domain";
import type { ExploreFormData } from "@/schemas/explore";
import {
  asyncError,
  asyncLoading,
  asyncSuccess,
  matchAsyncState,
  type AsyncState,
} from "@/types/async-state";

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

  // Discriminated Union: status query dipetakan ke AsyncState lalu ditangani exhaustive.
  const state: AsyncState<readonly Recommendation[]> = isPending
    ? asyncLoading("Memuat rekomendasi...")
    : isError
      ? asyncError(error instanceof Error ? error.message : "Terjadi kesalahan tak terduga.")
      : asyncSuccess(data ?? []);

  return matchAsyncState(state, {
    idle: () => null,
    loading: () => (
      <div
        aria-busy="true"
        aria-live="polite"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {[0, 1, 2].map((index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    ),
    error: (message) => (
      <ErrorState
        title="Gagal memuat rekomendasi"
        message={message}
        action={
          <Button intent="danger" onClick={() => void refetch()} loading={isFetching}>
            Coba lagi
          </Button>
        }
      />
    ),
    success: (items) =>
      items.length === 0 ? (
        <EmptyState
          title="Tidak ada menu yang cocok"
          description="Semua menu melebihi anggaran atau mengandung alergi yang dipilih. Coba naikkan anggaran atau kurangi pantangan."
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-stone-500 dark:text-stone-400" role="status">
            Ditemukan <strong>{items.length} menu</strong> sesuai kebutuhan keluarga Anda.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((recommendation) => (
              <RecipeCard
                key={recommendation.id}
                recipe={recommendation.recipe}
                scores={recommendation.scores}
                rank={recommendation.rank}
              >
                <SaveRecipeButton
                  recipeId={recommendation.recipe.id}
                  note={recommendation.explanation}
                />
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
      ),
  });
}

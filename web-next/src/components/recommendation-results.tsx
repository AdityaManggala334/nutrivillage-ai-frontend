"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { MealPlanResults } from "@/components/meal-plan-results";
import { Button, Skeleton } from "@/components/ui";
import { useRecommendations } from "@/hooks/use-recommendations";
import type { ExploreFormData } from "@/schemas/explore";

export interface RecommendationResultsProps {
  readonly payload: ExploreFormData | null;
}

/** FR-10: area hasil paket makan (satu paket per waktu makan). */
export function RecommendationResults({ payload }: RecommendationResultsProps) {
  const { data, isPending, isError, error, refetch, isFetching } = useRecommendations(payload);

  if (!payload) {
    return (
      <EmptyState
        title="Belum ada rekomendasi"
        description="Isi parameter kebutuhan keluarga lalu tekan tombol Generate Rekomendasi untuk melihat paket makan bergizi beserta biayanya."
      />
    );
  }

  if (isPending) {
    return (
      <div aria-busy="true" aria-live="polite" className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Rekomendasi belum dapat dimuat"
        message={error instanceof Error ? error.message : "Terjadi kesalahan tak terduga."}
        action={
          <Button intent="danger" onClick={() => void refetch()} loading={isFetching}>
            Coba Lagi
          </Button>
        }
      />
    );
  }

  if (!data) return null;
  return <MealPlanResults plan={data} />;
}

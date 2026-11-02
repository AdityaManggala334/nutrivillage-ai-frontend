"use client";

import { useIsFetching } from "@tanstack/react-query";
import { ExploreForm } from "@/components/explore-form";
import { RecommendationResults } from "@/components/recommendation-results";
import { queryKeys } from "@/lib/query-keys";
import { useExploreHydration, useExploreStore } from "@/stores/explore-store";

/**
 * Komponen klien tipis untuk halaman Explore. Memisahkan form (Client UI State
 * lokal) dari hasil (Server State TanStack Query).
 *
 * E1: payload terakhir dipersist lewat Zustand sehingga hasil tetap muncul
 * saat kembali dari halaman detail resep / reload.
 */
export function ExploreClient() {
  useExploreHydration();
  const payload = useExploreStore((state) => state.payload);
  const setPayload = useExploreStore((state) => state.setPayload);
  const fetchingCount = useIsFetching({ queryKey: queryKeys.recommendations.all });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="glass h-fit rounded-2xl p-5">
        <ExploreForm onGenerate={setPayload} isLoading={payload !== null && fetchingCount > 0} />
      </div>
      <div className="min-w-0">
        <RecommendationResults payload={payload} />
      </div>
    </div>
  );
}

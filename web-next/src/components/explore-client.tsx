"use client";

import { useIsFetching } from "@tanstack/react-query";
import { useState } from "react";
import { ExploreForm } from "@/components/explore-form";
import { RecommendationResults } from "@/components/recommendation-results";
import { queryKeys } from "@/lib/query-keys";
import type { ExploreFormData } from "@/schemas/explore";

/**
 * Komponen klien tipis untuk halaman Explore. Memisahkan form (Client UI State
 * lokal) dari hasil (Server State TanStack Query).
 */
export function ExploreClient() {
  const [payload, setPayload] = useState<ExploreFormData | null>(null);
  const fetchingCount = useIsFetching({ queryKey: queryKeys.recommendations.all });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <ExploreForm onGenerate={setPayload} isLoading={payload !== null && fetchingCount > 0} />
      </div>
      <div className="min-w-0">
        <RecommendationResults payload={payload} />
      </div>
    </div>
  );
}

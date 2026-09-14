"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiSend } from "@/lib/api-client";
import { hashObject } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";
import { RecommendationSchema } from "@/schemas/domain";
import type { ExploreFormData } from "@/schemas/explore";

export const RecommendationListSchema = z.array(RecommendationSchema);

/**
 * Modul 7: hasil rekomendasi diperlakukan sebagai Server State.
 * Query hanya berjalan saat `payload` tersedia (setelah user submit form),
 * hasilnya di-cache berdasarkan hash parameter agar tidak fetch berulang
 * (stale-while-revalidate: staleTime 5 menit).
 */
export function useRecommendations(payload: ExploreFormData | null) {
  const hash = payload ? hashObject(payload) : "idle";

  return useQuery({
    queryKey: queryKeys.recommendations.byHash(hash),
    queryFn: () => {
      if (!payload) throw new Error("Parameter rekomendasi belum diisi");
      return apiSend("/api/recommendations", "POST", payload, RecommendationListSchema);
    },
    enabled: payload !== null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
  });
}

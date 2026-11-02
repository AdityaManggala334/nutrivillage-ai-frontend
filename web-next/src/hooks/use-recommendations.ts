"use client";

import { useQuery } from "@tanstack/react-query";
import { apiSend } from "@/lib/api-client";
import { hashObject } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";
import { MealPlanSchema } from "@/schemas/meal-plan";
import type { ExploreFormData } from "@/schemas/explore";

/**
 * Modul 7: rencana paket makan diperlakukan sebagai Server State.
 * Query hanya berjalan saat `payload` tersedia (setelah user submit form),
 * hasilnya di-cache berdasarkan hash parameter agar tidak fetch berulang.
 */
export function useRecommendations(payload: ExploreFormData | null) {
  const hash = payload ? hashObject(payload) : "idle";

  return useQuery({
    queryKey: queryKeys.recommendations.byHash(hash),
    queryFn: () => {
      if (!payload) throw new Error("Parameter rekomendasi belum diisi");
      return apiSend("/api/recommendations", "POST", payload, MealPlanSchema);
    },
    enabled: payload !== null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
  });
}

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
    // Payload yang sama selalu menghasilkan rekomendasi yang sama, sehingga
    // hasil dipertahankan lebih lama: hemat kuota Generate (FR-35) ketika
    // pengguna kembali dari halaman detail resep (E1: payload dipersist).
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
}

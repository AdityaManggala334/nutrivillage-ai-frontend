"use client";

import { useQuery } from "@tanstack/react-query";
import { apiSend } from "@/lib/api-client";
import { hashObject } from "@/lib/utils";
import { SppgPlanSchema } from "@/schemas/sppg-plan";
import type { SppgPlanInput } from "@/server/sppg-plan";

/** Rencana MBG per jenjang; dihitung dari basis data gizi & harga terkini. */
export function useSppgPlan(payload: SppgPlanInput | null) {
  const hash = payload ? hashObject(payload) : "idle";
  return useQuery({
    queryKey: ["recommendations", "sppg", hash],
    queryFn: () => {
      if (!payload) throw new Error("Parameter SPPG belum diisi");
      return apiSend("/api/recommendations/sppg", "POST", payload, SppgPlanSchema);
    },
    enabled: payload !== null,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  NutritionRowListSchema,
  NutritionRowSchema,
  type NutritionRowUpdate,
} from "@/schemas/admin";

/** Tabel bahan + gizi + harga untuk dasbor admin (Server State). */
export function useAdminNutrition() {
  return useQuery({
    queryKey: queryKeys.adminNutrition.list(),
    queryFn: ({ signal }) => apiGet("/api/admin/nutrition", NutritionRowListSchema, signal),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateNutritionMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: NutritionRowUpdate }) =>
      apiSend(`/api/admin/nutrition/${id}`, "PATCH", input, NutritionRowSchema),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.adminNutrition.all });
    },
  });
}

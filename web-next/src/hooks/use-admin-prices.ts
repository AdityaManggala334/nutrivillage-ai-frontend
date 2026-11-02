"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiDelete, apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  AdminPriceListSchema,
  AdminPriceSchema,
  type AdminPriceCreate,
  type AdminPriceUpdate,
  type PriceStatus,
} from "@/schemas/admin";

const IngredientOptionListSchema = z.array(
  z.object({ id: z.number().int().positive(), name: z.string(), unit: z.string() }),
);

export function usePriceIngredients() {
  return useQuery({
    queryKey: ["admin-prices", "ingredients"],
    queryFn: ({ signal }) =>
      apiGet("/api/admin/ingredients", IngredientOptionListSchema, signal),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAdminPrices() {
  return useQuery({
    queryKey: queryKeys.adminPrices.list(),
    queryFn: ({ signal }) => apiGet("/api/admin/prices", AdminPriceListSchema, signal),
    staleTime: 1000 * 30,
  });
}

function usePriceMutation<TInput>(
  run: (input: TInput) => Promise<unknown>,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.adminPrices.all });
      void client.invalidateQueries({ queryKey: queryKeys.adminNutrition.all });
    },
  });
}

export function useCreatePriceMutation() {
  return usePriceMutation((input: AdminPriceCreate) =>
    apiSend("/api/admin/prices", "POST", input, AdminPriceSchema),
  );
}

export function useUpdatePriceMutation() {
  return usePriceMutation(
    ({ id, input }: { id: number; input: AdminPriceUpdate }) =>
      apiSend(`/api/admin/prices/${id}`, "PATCH", input, AdminPriceSchema),
  );
}

export function useVerifyPriceMutation() {
  return usePriceMutation(
    ({ id, status }: { id: number; status: Exclude<PriceStatus, "pending"> }) =>
      apiSend(`/api/admin/prices/${id}`, "PATCH", { status }, AdminPriceSchema),
  );
}

export function useDeletePriceMutation() {
  return usePriceMutation((id: number) =>
    apiDelete(`/api/admin/prices/${id}`, z.object({ ok: z.boolean() })),
  );
}

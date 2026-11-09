"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiDelete, apiGet, apiSend } from "@/lib/api-client";
import {
  FieldIngredientSchema,
  FieldPriceSchema,
  type FieldPrice,
} from "@/schemas/field";

const KEY = ["field-prices"] as const;

/** Bahan yang bisa dipilih petugas di pasar. */
export function useFieldIngredients() {
  return useQuery({
    queryKey: [...KEY, "ingredients"],
    queryFn: ({ signal }) =>
      apiGet("/api/field/ingredients", FieldIngredientSchema.array(), signal),
    staleTime: 1000 * 60 * 10,
  });
}

/** Kiriman petugas ini (admin melihat semua), bisa disaring per status. */
export function useFieldPrices(status?: string) {
  return useQuery({
    queryKey: [...KEY, status ?? "all"],
    queryFn: ({ signal }) =>
      apiGet(
        `/api/field/prices${status ? `?status=${status}` : ""}`,
        FieldPriceSchema.array(),
        signal,
      ),
  });
}

export function useSendPriceMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      ingredient_id: number;
      price: number;
      unit: string;
      source: string;
      recorded_date?: string;
    }) => apiSend("/api/field/prices", "POST", body, FieldPriceSchema),
    onSuccess: () => void client.invalidateQueries({ queryKey: KEY }),
  });
}

/** Tarik kembali kiriman yang masih menunggu persetujuan. */
export function useWithdrawPriceMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiDelete(`/api/field/prices/${id}`, z.literal(undefined)),
    onSuccess: () => void client.invalidateQueries({ queryKey: KEY }),
  });
}

export type { FieldPrice };

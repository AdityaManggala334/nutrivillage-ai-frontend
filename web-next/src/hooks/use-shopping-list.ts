"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { ShoppingListSchema } from "@/schemas/domain";

/** FR-16: daftar belanja tersimpan (Server State). */
export function useShoppingList() {
  return useQuery({
    queryKey: queryKeys.shoppingList.current(),
    queryFn: ({ signal }) => apiGet("/api/shopping-list", ShoppingListSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/** FR-16: centang / batal centang bahan dengan invalidasi cache. */
export function useToggleShoppingItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { itemId: string; checked: boolean }) =>
      apiSend("/api/shopping-list", "PATCH", input, ShoppingListSchema),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.shoppingList.current(), data);
    },
  });
}

/** FR-16: hapus bahan dari daftar belanja. */
export function useDeleteShoppingItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiDelete(`/api/shopping-list?itemId=${encodeURIComponent(itemId)}`, ShoppingListSchema),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.shoppingList.current(), data);
    },
  });
}

/** FR-17: simpan catatan tambahan. */
export function useUpdateShoppingNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: string) =>
      apiSend("/api/shopping-list", "PATCH", { note }, ShoppingListSchema),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.shoppingList.current(), data);
    },
  });
}

/** FR-29: generate ulang daftar belanja dari jadwal Meal Planner. */
export function useRegenerateShoppingListMutation(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiSend("/api/shopping-list", "POST", { weekId }, ShoppingListSchema),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.shoppingList.current(), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList.all });
    },
  });
}

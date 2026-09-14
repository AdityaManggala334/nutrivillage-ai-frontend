"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiDelete, apiGet, apiSend } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  DayOfWeekSchema,
  MealPlanEntrySchema,
  MealPlanSchema,
  MealSlotSchema,
  ShoppingListSchema,
} from "@/schemas/domain";

const RemoveResultSchema = z.object({ entryId: z.string() });

export const AssignMealInputSchema = z.object({
  weekId: z.string().min(1),
  day: DayOfWeekSchema,
  slot: MealSlotSchema,
  recipeId: z.string().min(1),
  note: z.string(),
});

export type AssignMealInput = z.infer<typeof AssignMealInputSchema>;

/** Modul 7: Server State jadwal mingguan. */
export function useMealPlan(weekId: string) {
  return useQuery({
    queryKey: queryKeys.mealPlans.detail(weekId),
    queryFn: ({ signal }) =>
      apiGet(`/api/meal-plans?week=${weekId}`, MealPlanSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/** FR-26/FR-28: assign / ubah menu pada slot jadwal + invalidasi cache. */
export function useAssignMealMutation(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AssignMealInput) =>
      apiSend("/api/meal-plans", "POST", AssignMealInputSchema.parse(input), MealPlanEntrySchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(weekId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList.byWeek(weekId) });
    },
  });
}

export function useRemoveMealMutation(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) =>
      apiDelete(`/api/meal-plans?week=${weekId}&entryId=${entryId}`, RemoveResultSchema),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.detail(weekId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList.byWeek(weekId) });
    },
  });
}

/** FR-29: generate shopping list dari jadwal, lalu simpan ke cache. */
export function useGenerateShoppingListMutation(weekId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiSend("/api/shopping-list", "POST", { weekId }, ShoppingListSchema),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.shoppingList.byWeek(weekId), data);
    },
  });
}

/** FR-15: tambahkan bahan dari satu resep (hasil Explore / detail) ke daftar belanja. */
export function useAddRecipeToShoppingListMutation() {
  return useMutation({
    mutationFn: (recipeId: string) =>
      apiSend("/api/shopping-list", "POST", { recipeId }, ShoppingListSchema),
  });
}

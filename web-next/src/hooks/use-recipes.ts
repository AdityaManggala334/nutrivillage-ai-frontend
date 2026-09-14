"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiGet } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { RecipeSchema } from "@/schemas/domain";

export const RecipeListSchema = z.array(RecipeSchema);

/** Modul 7: fetch katalog resep (Server State) dengan caching 5 menit. */
export function useRecipes() {
  return useQuery({
    queryKey: queryKeys.recipes.list(),
    queryFn: ({ signal }) => apiGet("/api/recipes", RecipeListSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

/** Fetch detail resep (dipakai untuk lookup klien, mis. recipe picker). */
export function useRecipe(id: string) {
  return useQuery({
    queryKey: queryKeys.recipes.detail(id),
    queryFn: ({ signal }) => apiGet(`/api/recipes/${id}`, RecipeSchema, signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

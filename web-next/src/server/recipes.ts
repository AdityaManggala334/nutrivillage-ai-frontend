import "server-only";

import { RecipeSchema, type Recipe } from "@/schemas/domain";
import {
  backendGetRecipe,
  backendListRecipes,
  type BackendRecipe,
} from "@/server/backend-api";

/** Pemetaan resep dari backend (snake_case) ke model frontend. */
export function toRecipe(payload: BackendRecipe): Recipe {
  const nutrition = payload.nutrition ?? {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
  };
  return RecipeSchema.parse({
    id: String(payload.id),
    name: payload.name,
    category: payload.category,
    description: payload.description?.trim() ? payload.description : payload.name,
    servings: payload.servings,
    cookingSteps:
      payload.steps && payload.steps.length > 0
        ? payload.steps
        : ["Langkah memasak belum diisi."],
    ingredients: (payload.ingredients ?? []).map((item) => ({
      id: String(item.id),
      name: item.name,
      quantity: Number(item.quantity),
      unit: item.unit,
      estimatedPrice: Number(item.estimated_price),
    })),
    nutrition: {
      calories: Number(nutrition.calories),
      protein: Number(nutrition.protein),
      carbohydrates: Number(nutrition.carbohydrates),
      fat: Number(nutrition.fat),
      fiber: Number(nutrition.fiber),
    },
    estimatedCost: Number(payload.estimated_cost),
    imageAlt: payload.image_alt ?? `Foto ${payload.name}`,
    imageKey: payload.image_key ?? "default",
    isLocal: payload.is_local,
    inSeason: payload.in_season,
    tags: payload.tags ?? [],
    priceUpdatedAt: payload.price_updated_at ?? new Date().toISOString(),
  });
}

/** Katalog resep dari database (FR-10). */
export async function listRecipesFromDb(): Promise<Recipe[]> {
  let payloads: Awaited<ReturnType<typeof backendListRecipes>>;
  try {
    payloads = await backendListRecipes();
  } catch {
    // Backend belum tersedia → tampilkan katalog kosong alih-alih error 500.
    return [];
  }
  const recipes: Recipe[] = [];
  for (const payload of payloads) {
    if (!payload.ingredients || payload.ingredients.length === 0) continue;
    try {
      recipes.push(toRecipe(payload));
    } catch {
      // Lewati resep yang datanya belum lengkap agar daftar tetap tampil.
    }
  }
  return recipes;
}

/** Detail satu resep dari database. */
export async function getRecipeFromDb(id: string): Promise<Recipe | null> {
  try {
    const payload = await backendGetRecipe(id);
    return toRecipe(payload);
  } catch {
    return null;
  }
}

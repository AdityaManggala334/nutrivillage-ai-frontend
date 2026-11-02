import "server-only";

import { RecipeSchema, type Recipe } from "@/schemas/domain";
import { backendPublicRecipe, backendPublicRecipes, type BackendRecipeRow } from "@/server/backend-api";

/** Resep publik dari database (bukan mock). */

function toRecipe(row: BackendRecipeRow): Recipe {
  const nutrition = row.nutrition;
  return RecipeSchema.parse({
    id: String(row.id),
    name: row.name,
    category: row.category,
    description: row.description?.trim() || row.name,
    servings: row.servings,
    cookingSteps: row.steps.length > 0 ? row.steps : ["Belum ada langkah memasak."],
    ingredients:
      row.ingredients.length > 0
        ? row.ingredients.map((line) => ({
            id: String(line.id),
            name: line.name,
            quantity: line.quantity,
            unit: line.unit,
            estimatedPrice: line.estimated_price,
          }))
        : [{ id: "0", name: "Belum ada bahan", quantity: 1, unit: "-", estimatedPrice: 0 }],
    nutrition: {
      calories: nutrition?.calories ?? 0,
      protein: nutrition?.protein ?? 0,
      carbohydrates: nutrition?.carbohydrates ?? 0,
      fat: nutrition?.fat ?? 0,
      fiber: nutrition?.fiber ?? 0,
    },
    estimatedCost: row.estimated_cost,
    imageAlt: row.image_alt?.trim() || row.name,
    imageKey: row.image_key || "menu",
    imageUrl: row.image_url,
    isLocal: row.is_local,
    inSeason: row.in_season,
    tags: row.tags,
    priceUpdatedAt: row.price_updated_at ?? row.updated_at,
  });
}

export async function listPublicRecipes(): Promise<Recipe[]> {
  return (await backendPublicRecipes()).map(toRecipe);
}

export async function getPublicRecipe(id: number): Promise<Recipe | null> {
  try {
    return toRecipe(await backendPublicRecipe(id));
  } catch {
    return null;
  }
}

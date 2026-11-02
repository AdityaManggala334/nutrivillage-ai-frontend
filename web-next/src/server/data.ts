import "server-only";

import { cache } from "react";
import { clamp } from "@/lib/utils";
import type { ExploreFormData } from "@/schemas/explore";
import type { Recommendation, RecommendationGoal, Recipe } from "@/schemas/domain";
import { toRecommendationId } from "@/types/branded";
import { getRecipeFromDb, listRecipesFromDb } from "@/server/recipes";

/**
 * Recommendation Engine (FR-09, FR-10, FR-25) di sisi server.
 *
 * Data riwayat, meal planner, dan daftar belanja berada di database
 * (`server/history.ts` & `server/planning.ts`) — modul ini tidak lagi
 * menyimpan data in-memory. Hanya boleh dipanggil dari Server Components /
 * Route Handlers.
 */

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/* ------------------------------------------------------------------ */
/* Resep                                                               */
/* ------------------------------------------------------------------ */

export async function listRecipes(): Promise<Recipe[]> {
  return listRecipesFromDb();
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  return getRecipeFromDb(id);
}

/**
 * Deduplikasi per-request (React cache): generateMetadata & page memanggil
 * resep yang sama tanpa fetch ganda.
 */
export const getRecipeForRequest = cache(getRecipeById);

/* ------------------------------------------------------------------ */
/* Recommendation Engine (FR-09, FR-10, FR-25)                         */
/* ------------------------------------------------------------------ */

interface WeightSet {
  readonly nutrition: number;
  readonly budget: number;
  readonly local: number;
  readonly season: number;
}

const GOAL_WEIGHTS: Readonly<Record<RecommendationGoal, WeightSet>> = {
  hemat: { nutrition: 0.25, budget: 0.45, local: 0.15, season: 0.15 },
  seimbang: { nutrition: 0.4, budget: 0.3, local: 0.15, season: 0.15 },
  "tinggi-protein": { nutrition: 0.5, budget: 0.2, local: 0.15, season: 0.15 },
  "rendah-lemak": { nutrition: 0.5, budget: 0.2, local: 0.15, season: 0.15 },
};

const ALLERGY_TAG_MAP: Readonly<Record<string, string>> = {
  Kacang: "kacang",
  Seafood: "ikan",
  Telur: "telur",
  Santan: "santan",
  Gluten: "gluten",
  Susu: "susu",
  Kedelai: "kedelai",
};

const matchesAllergy = (recipe: Recipe, allergies: readonly string[]): boolean =>
  allergies.some((allergy) => {
    const tag = ALLERGY_TAG_MAP[allergy];
    return tag !== undefined && recipe.tags.includes(tag);
  });

const preferenceBoost = (recipe: Recipe, preferences: readonly string[]): number => {
  if (preferences.length === 0) return 0;
  const matches = preferences.filter((preference) =>
    recipe.tags.includes(preference.toLowerCase()),
  ).length;
  return (matches / preferences.length) * 12;
};

const buildRecommendation = (
  recipe: Recipe,
  rank: number,
  data: ExploreFormData,
): Recommendation => {
  const weights = GOAL_WEIGHTS[data.goal];

  const proteinFactor = clamp(recipe.nutrition.protein / 30, 0, 1);
  const fiberFactor = clamp(recipe.nutrition.fiber / 9, 0, 1);
  const fatPenalty = data.goal === "rendah-lemak" ? clamp(recipe.nutrition.fat / 40, 0, 1) : 0;

  const nutritionScore = clamp(
    60 + proteinFactor * 25 + fiberFactor * 20 - fatPenalty * 35 + preferenceBoost(recipe, data.preferences),
    45,
    99,
  );
  const budgetScore = clamp(
    100 - (recipe.estimatedCost / data.dailyBudget) * 60,
    45,
    99,
  );
  const localScore = recipe.isLocal ? 95 : 62;
  const seasonScore = recipe.inSeason ? 92 : 66;

  const total =
    nutritionScore * weights.nutrition +
    budgetScore * weights.budget +
    localScore * weights.local +
    seasonScore * weights.season;

  return {
    id: toRecommendationId(`rekomendasi-${recipe.id}-${rank}`),
    recipe,
    scores: {
      nutrition: Math.round(nutritionScore),
      budget: Math.round(budgetScore),
      local: Math.round(localScore),
      season: Math.round(seasonScore),
      total: Math.round(total),
    },
    rank,
    explanation: `${recipe.name} direkomendasikan karena menyumbang sekitar ${recipe.nutrition.protein} g protein dan ${recipe.nutrition.fiber} g serat dengan estimasi biaya Rp${recipe.estimatedCost.toLocaleString("id-ID")} per porsi keluarga, masih dalam anggaran harian Anda.`,
  };
};

/** Menghasilkan 3-5 rekomendasi. Budget & alergi menjadi hard constraint. */
export async function generateRecommendations(
  data: ExploreFormData,
): Promise<Recommendation[]> {
  await delay(1200);

  const catalog = await listRecipes();
  const eligible = catalog.filter(
    (recipe) =>
      recipe.estimatedCost <= data.dailyBudget && !matchesAllergy(recipe, data.allergies),
  );

  return eligible
    .map((recipe, index) => buildRecommendation(recipe, index + 1, data))
    .sort((a, b) => b.scores.total - a.scores.total)
    .slice(0, 5)
    .map((recommendation, index) => ({ ...recommendation, rank: index + 1 }));
}

/* ------------------------------------------------------------------ */
/* Riwayat (FR-12 s.d. FR-14), Meal Planner (FR-26 s.d. FR-28),        */
/* dan Daftar Belanja (FR-15 s.d. FR-17, FR-29) kini tersimpan di      */
/* database: lihat `server/history.ts` & `server/planning.ts`.         */
/* Modul ini tidak lagi menyimpan data apa pun secara in-memory.       */
/* ------------------------------------------------------------------ */

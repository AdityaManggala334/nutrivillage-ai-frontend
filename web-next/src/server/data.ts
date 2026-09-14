import "server-only";

import { cache } from "react";
import { clamp } from "@/lib/utils";
import type { ExploreFormData } from "@/schemas/explore";
import type {
  DayOfWeek,
  HistoryEntry,
  MealPlan,
  MealPlanEntry,
  MealSlot,
  Recommendation,
  RecommendationGoal,
  Recipe,
  ShoppingItem,
  ShoppingList,
} from "@/schemas/domain";
import { MOCK_RECIPES } from "./mock-data";

/**
 * Lapisan akses data sisi server (mock). Mensimulasikan latensi jaringan,
 * Recommendation Engine, dan penyimpanan in-memory untuk riwayat & meal plan.
 * Hanya boleh dipanggil dari Server Components / Route Handlers.
 */

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const nowIso = (): string => new Date().toISOString();

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

/* ------------------------------------------------------------------ */
/* Resep                                                               */
/* ------------------------------------------------------------------ */

export async function listRecipes(): Promise<Recipe[]> {
  await delay(200);
  return [...MOCK_RECIPES];
}

/** Sengaja lebih lambat untuk mendemonstrasikan Streaming SSR + Suspense. */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  await delay(900);
  return MOCK_RECIPES.find((recipe) => recipe.id === id) ?? null;
}

export function findRecipeSync(id: string): Recipe | null {
  return MOCK_RECIPES.find((recipe) => recipe.id === id) ?? null;
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
    id: `rekomendasi-${recipe.id}-${rank}`,
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

  const eligible = MOCK_RECIPES.filter(
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
/* Riwayat (FR-12, FR-13, FR-14) — penyimpanan in-memory               */
/* ------------------------------------------------------------------ */

const historyStore: HistoryEntry[] = [
  {
    id: "riwayat-seed-1",
    kind: "recommendation",
    recipe: MOCK_RECIPES[0]!,
    savedAt: daysAgo(2),
    favorite: true,
    note: "Favorit keluarga, sambal pecelnya ditambah.",
  },
  {
    id: "riwayat-seed-2",
    kind: "recommendation",
    recipe: MOCK_RECIPES[4]!,
    savedAt: daysAgo(20),
    favorite: false,
    note: "",
  },
  {
    id: "riwayat-seed-3",
    kind: "meal-plan",
    recipe: MOCK_RECIPES[3]!,
    savedAt: daysAgo(40),
    favorite: false,
    note: "Dijadwalkan untuk makan malam.",
  },
];

export type HistoryFilter = "all" | "favorite" | "month";

export async function listHistory(filter: HistoryFilter): Promise<HistoryEntry[]> {
  await delay(500);
  const sorted = [...historyStore].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
  if (filter === "favorite") return sorted.filter((entry) => entry.favorite);
  if (filter === "month") {
    const now = new Date();
    return sorted.filter((entry) => {
      const saved = new Date(entry.savedAt);
      return saved.getMonth() === now.getMonth() && saved.getFullYear() === now.getFullYear();
    });
  }
  return sorted;
}

export async function saveHistoryEntry(input: {
  recipeId: string;
  kind: HistoryEntry["kind"];
  note: string;
}): Promise<HistoryEntry> {
  await delay(400);
  const recipe = findRecipeSync(input.recipeId);
  if (!recipe) throw new Error("Resep tidak ditemukan");

  const existing = historyStore.find(
    (entry) => entry.recipe.id === recipe.id && entry.kind === input.kind,
  );
  if (existing) return existing;

  const entry: HistoryEntry = {
    id: `riwayat-${crypto.randomUUID()}`,
    kind: input.kind,
    recipe,
    savedAt: nowIso(),
    favorite: false,
    note: input.note,
  };
  historyStore.unshift(entry);
  return entry;
}

export async function deleteHistoryEntry(id: string): Promise<{ id: string }> {
  await delay(300);
  const index = historyStore.findIndex((entry) => entry.id === id);
  if (index >= 0) historyStore.splice(index, 1);
  return { id };
}

export async function toggleHistoryFavorite(id: string): Promise<HistoryEntry> {
  await delay(250);
  const entry = historyStore.find((item) => item.id === id);
  if (!entry) throw new Error("Riwayat tidak ditemukan");
  entry.favorite = !entry.favorite;
  return entry;
}

/* ------------------------------------------------------------------ */
/* Meal Planner (FR-26, FR-27, FR-28) — penyimpanan in-memory          */
/* ------------------------------------------------------------------ */

const mealPlanStore = new Map<string, MealPlanEntry[]>([
  [
    "pekan-ini",
    [
      {
        id: "meal-seed-1",
        day: "senin",
        slot: "sarapan",
        recipe: MOCK_RECIPES[6]!,
        note: "",
      },
      {
        id: "meal-seed-2",
        day: "selasa",
        slot: "makan-malam",
        recipe: MOCK_RECIPES[5]!,
        note: "",
      },
    ],
  ],
]);

const WEEK_LABEL = "Pekan Ini (Senin - Minggu)";

export async function getMealPlan(weekId: string): Promise<MealPlan> {
  await delay(450);
  return {
    weekId,
    weekLabel: WEEK_LABEL,
    entries: mealPlanStore.get(weekId) ?? [],
  };
}

export async function assignMealPlanEntry(input: {
  weekId: string;
  day: DayOfWeek;
  slot: MealSlot;
  recipeId: string;
  note: string;
}): Promise<MealPlanEntry> {
  await delay(350);
  const recipe = findRecipeSync(input.recipeId);
  if (!recipe) throw new Error("Resep tidak ditemukan");

  const entries = mealPlanStore.get(input.weekId) ?? [];
  const withoutSlot = entries.filter(
    (entry) => !(entry.day === input.day && entry.slot === input.slot),
  );
  const entry: MealPlanEntry = {
    id: `meal-${crypto.randomUUID()}`,
    day: input.day,
    slot: input.slot,
    recipe,
    note: input.note,
  };
  mealPlanStore.set(input.weekId, [...withoutSlot, entry]);
  return entry;
}

export async function removeMealPlanEntry(input: {
  weekId: string;
  entryId: string;
}): Promise<{ entryId: string }> {
  await delay(300);
  const entries = mealPlanStore.get(input.weekId) ?? [];
  mealPlanStore.set(
    input.weekId,
    entries.filter((entry) => entry.id !== input.entryId),
  );
  return { entryId: input.entryId };
}

/* ------------------------------------------------------------------ */
/* Shopping List dari Meal Planner (FR-29)                             */
/* ------------------------------------------------------------------ */

const buildShoppingList = (title: string, recipes: readonly Recipe[]): ShoppingList => {
  const aggregated = new Map<string, ShoppingItem>();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = `${ingredient.name}__${ingredient.unit}`;
      const existing = aggregated.get(key);
      if (existing) {
        aggregated.set(key, {
          ...existing,
          quantity: existing.quantity + ingredient.quantity,
          estimatedPrice: existing.estimatedPrice + ingredient.estimatedPrice,
        });
      } else {
        aggregated.set(key, {
          id: key,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          estimatedPrice: ingredient.estimatedPrice,
          checked: false,
        });
      }
    }
  }

  const items = [...aggregated.values()];
  return {
    id: `belanja-${crypto.randomUUID()}`,
    title,
    items,
    totalEstimatedCost: items.reduce((total, item) => total + item.estimatedPrice, 0),
    generatedAt: nowIso(),
  };
};

export async function generateShoppingList(weekId: string): Promise<ShoppingList> {
  await delay(700);
  const entries = mealPlanStore.get(weekId) ?? [];
  return buildShoppingList(
    `Daftar Belanja ${WEEK_LABEL}`,
    entries.map((entry) => entry.recipe),
  );
}

/** FR-15: daftar belanja dari satu resep (hasil Explore / detail resep). */
export async function generateShoppingListFromRecipe(recipeId: string): Promise<ShoppingList> {
  await delay(500);
  const recipe = findRecipeSync(recipeId);
  if (!recipe) throw new Error("Resep tidak ditemukan");
  return buildShoppingList(`Daftar Belanja ${recipe.name}`, [recipe]);
}

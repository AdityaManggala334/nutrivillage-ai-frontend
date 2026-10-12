import "server-only";

import { cache } from "react";
import { clamp } from "@/lib/utils";
import type { ExploreFormData } from "@/schemas/explore";
import type {
  MealPlan,
  MealPlanEntry,
  Recommendation,
  RecommendationGoal,
  Recipe,
  ShoppingItem,
  ShoppingList,
} from "@/schemas/domain";
import { toRecommendationId } from "@/types/branded";
import { getRecipeFromDb, listRecipesFromDb } from "@/server/recipes";

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

interface DataStores {
  /** Jadwal makan per pengguna+pekan (`userId::weekId`). */
  mealPlanByUser: Map<string, MealPlanEntry[]>;
  /** Daftar belanja per pengguna. */
  shoppingByUser: Map<string, ShoppingList>;
}

/**
 * Store di `globalThis` agar dibagi oleh SELURUH Route Handler dalam satu
 * proses (mencegah data hilang saat modul di-instantiate terpisah per route).
 * Semua store DIKUNCI per `userId` supaya data antarpengguna tidak tercampur.
 */
const globalForData = globalThis as unknown as { __nutrivillageData?: DataStores };

const dataStores: DataStores =
  globalForData.__nutrivillageData ??
  (globalForData.__nutrivillageData = {
    mealPlanByUser: new Map<string, MealPlanEntry[]>(),
    shoppingByUser: new Map<string, ShoppingList>(),
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
/* Riwayat (FR-12, FR-13, FR-14)                                       */
/* ------------------------------------------------------------------ */
/* Riwayat & favorit kini tersimpan di database melalui `server/history.ts`
   (endpoint `/api/history`). Modul ini tidak lagi menyimpan riwayat in-memory. */

/* ------------------------------------------------------------------ */
/* Meal Planner (FR-26, FR-27, FR-28) — in-memory per pengguna         */
/* ------------------------------------------------------------------ */

const WEEK_LABEL = "Pekan Ini (Senin - Minggu)";

// Catatan: meal planner kini mulai KOSONG (tanpa seed mock). Resep diambil dari
// database, dan akan diintegrasikan penuh ke tabel `meal_plans` pada fase berikutnya.

const mealKey = (userId: string, weekId: string): string => `${userId}::${weekId}`;

/** Jadwal milik seorang pengguna pada satu pekan; mulai kosong. */
const mealFor = (userId: string, weekId: string): MealPlanEntry[] => {
  const key = mealKey(userId, weekId);
  let list = dataStores.mealPlanByUser.get(key);
  if (!list) {
    list = [];
    dataStores.mealPlanByUser.set(key, list);
  }
  return list;
};

export async function getMealPlan(userId: string, weekId: string): Promise<MealPlan> {
  await delay(450);
  return {
    weekId,
    weekLabel: WEEK_LABEL,
    entries: mealFor(userId, weekId),
  };
}

/** Utility Type: sebagian field MealPlanEntry + field tambahan untuk input assign. */
export type AssignMealPlanInput = Pick<MealPlanEntry, "day" | "slot" | "note"> & {
  readonly weekId: string;
  readonly recipeId: string;
};

export async function assignMealPlanEntry(
  userId: string,
  input: AssignMealPlanInput,
): Promise<MealPlanEntry> {
  await delay(350);
  const recipe = await getRecipeById(input.recipeId);
  if (!recipe) throw new Error("Resep tidak ditemukan");

  const entries = mealFor(userId, input.weekId);
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
  withoutSlot.push(entry);
  dataStores.mealPlanByUser.set(mealKey(userId, input.weekId), withoutSlot);
  return entry;
}

export async function removeMealPlanEntry(
  userId: string,
  input: {
    weekId: string;
    entryId: string;
  },
): Promise<{ entryId: string }> {
  await delay(300);
  const entries = mealFor(userId, input.weekId);
  dataStores.mealPlanByUser.set(
    mealKey(userId, input.weekId),
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
    note: '',
    totalEstimatedCost: items.reduce((total, item) => total + item.estimatedPrice, 0),
    generatedAt: nowIso(),
  };
};

const recomputeTotal = (list: ShoppingList): ShoppingList => ({
  ...list,
  totalEstimatedCost: list.items.reduce((total, item) => total + item.estimatedPrice, 0),
});

const mergeIntoList = (list: ShoppingList, recipes: readonly Recipe[]): ShoppingList => {
  const map = new Map(list.items.map((item) => [item.id, item]));
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = `${ingredient.name}__${ingredient.unit}`;
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          quantity: existing.quantity + ingredient.quantity,
          estimatedPrice: existing.estimatedPrice + ingredient.estimatedPrice,
        });
      } else {
        map.set(key, {
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
  return recomputeTotal({ ...list, items: [...map.values()], generatedAt: nowIso() });
};

const shoppingFor = (userId: string): ShoppingList => {
  let list = dataStores.shoppingByUser.get(userId);
  if (!list) {
    list = buildShoppingList(`Daftar Belanja ${WEEK_LABEL}`, []);
    dataStores.shoppingByUser.set(userId, list);
  }
  return list;
};

export function getShoppingListSync(userId: string): ShoppingList {
  return shoppingFor(userId);
}

export async function getShoppingList(userId: string): Promise<ShoppingList> {
  await delay(300);
  return shoppingFor(userId);
}

export async function generateShoppingList(
  userId: string,
  weekId: string,
): Promise<ShoppingList> {
  await delay(700);
  const entries = mealFor(userId, weekId);
  const list = buildShoppingList(
    `Daftar Belanja ${WEEK_LABEL}`,
    entries.map((entry) => entry.recipe),
  );
  dataStores.shoppingByUser.set(userId, list);
  return list;
}

/** FR-15: tambahkan bahan dari satu resep (hasil Explore / detail resep) ke daftar belanja. */
export async function generateShoppingListFromRecipe(
  userId: string,
  recipeId: string,
): Promise<ShoppingList> {
  await delay(500);
  const recipe = await getRecipeById(recipeId);
  if (!recipe) throw new Error("Resep tidak ditemukan");
  const base = shoppingFor(userId);
  const list = mergeIntoList(base, [recipe]);
  dataStores.shoppingByUser.set(userId, list);
  return list;
}

/** FR-16: centang / batal centang bahan. */
export async function toggleShoppingItem(
  userId: string,
  itemId: string,
): Promise<ShoppingList> {
  await delay(200);
  const list = shoppingFor(userId);
  const next: ShoppingList = {
    ...list,
    items: list.items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item,
    ),
  };
  dataStores.shoppingByUser.set(userId, next);
  return next;
}

/** FR-16: hapus bahan dari daftar. */
export async function deleteShoppingItem(
  userId: string,
  itemId: string,
): Promise<ShoppingList> {
  await delay(250);
  const list = shoppingFor(userId);
  const next = recomputeTotal({
    ...list,
    items: list.items.filter((item) => item.id !== itemId),
  });
  dataStores.shoppingByUser.set(userId, next);
  return next;
}

/** FR-17: simpan catatan tambahan pada daftar belanja. */
export async function updateShoppingNote(
  userId: string,
  note: string,
): Promise<ShoppingList> {
  await delay(200);
  const list = shoppingFor(userId);
  const next = { ...list, note };
  dataStores.shoppingByUser.set(userId, next);
  return next;
}

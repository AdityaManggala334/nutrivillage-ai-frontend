import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Enums domain (SKPL: kelompok usia, slot makan, hari, tujuan gizi)   */
/* ------------------------------------------------------------------ */

export const AgeGroupSchema = z.enum(["balita", "anak", "dewasa", "lansia"]);
export const MealSlotSchema = z.enum(["sarapan", "makan-siang", "makan-malam"]);
export const DayOfWeekSchema = z.enum([
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
  "minggu",
]);
export const RecommendationGoalSchema = z.enum([
  "hemat",
  "seimbang",
  "tinggi-protein",
  "rendah-lemak",
]);

export type AgeGroup = z.infer<typeof AgeGroupSchema>;
export type MealSlot = z.infer<typeof MealSlotSchema>;
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;
export type RecommendationGoal = z.infer<typeof RecommendationGoalSchema>;

/* ------------------------------------------------------------------ */
/* Resep & gizi                                                        */
/* ------------------------------------------------------------------ */

export const NutritionInfoSchema = z.object({
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbohydrates: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative(),
});

export const RecipeIngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  estimatedPrice: z.number().nonnegative(),
});

export const RecipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  servings: z.number().int().positive(),
  cookingSteps: z.array(z.string().min(1)).min(1),
  ingredients: z.array(RecipeIngredientSchema).min(1),
  nutrition: NutritionInfoSchema,
  estimatedCost: z.number().nonnegative(),
  imageAlt: z.string().min(1),
  /** Kunci palet gradien untuk placeholder foto (tanpa aset eksternal). */
  imageKey: z.string().min(1),
  isLocal: z.boolean(),
  inSeason: z.boolean(),
  tags: z.array(z.string()),
  /** FR-33 / NFR-06: tanggal verifikasi harga oleh admin (ISO-8601). */
  priceUpdatedAt: z.string().min(1),
});

export type NutritionInfo = z.infer<typeof NutritionInfoSchema>;
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;

/* ------------------------------------------------------------------ */
/* Rekomendasi (FR-10)                                                 */
/* ------------------------------------------------------------------ */

export const RecommendationScoresSchema = z.object({
  nutrition: z.number().min(0).max(100),
  budget: z.number().min(0).max(100),
  local: z.number().min(0).max(100),
  season: z.number().min(0).max(100),
  total: z.number().min(0).max(100),
});

export const RecommendationSchema = z.object({
  id: z.string().min(1),
  recipe: RecipeSchema,
  scores: RecommendationScoresSchema,
  rank: z.number().int().positive(),
  explanation: z.string().min(1),
});

export type RecommendationScores = z.infer<typeof RecommendationScoresSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;

/* ------------------------------------------------------------------ */
/* Riwayat (FR-12, FR-13, FR-14)                                       */
/* ------------------------------------------------------------------ */

export const HistoryEntrySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["recommendation", "meal-plan"]),
  recipe: RecipeSchema,
  /** ISO-8601 date string. */
  savedAt: z.string().min(1),
  favorite: z.boolean(),
  note: z.string(),
});

export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

export const HistoryFilterSchema = z.enum(["all", "favorite", "month"]);
export type HistoryFilter = z.infer<typeof HistoryFilterSchema>;

/* ------------------------------------------------------------------ */
/* Meal Planner (FR-26, FR-27, FR-28)                                  */
/* ------------------------------------------------------------------ */

export const MealPlanEntrySchema = z.object({
  id: z.string().min(1),
  day: DayOfWeekSchema,
  slot: MealSlotSchema,
  recipe: RecipeSchema,
  note: z.string(),
});

export const MealPlanSchema = z.object({
  weekId: z.string().min(1),
  weekLabel: z.string().min(1),
  entries: z.array(MealPlanEntrySchema),
});

export type MealPlanEntry = z.infer<typeof MealPlanEntrySchema>;
export type MealPlan = z.infer<typeof MealPlanSchema>;

/* ------------------------------------------------------------------ */
/* Shopping List (FR-15, FR-29)                                        */
/* ------------------------------------------------------------------ */

export const ShoppingItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  estimatedPrice: z.number().nonnegative(),
  checked: z.boolean(),
});

export const ShoppingListSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  items: z.array(ShoppingItemSchema),
  totalEstimatedCost: z.number().nonnegative(),
  generatedAt: z.string().min(1),
});

export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;
export type ShoppingList = z.infer<typeof ShoppingListSchema>;

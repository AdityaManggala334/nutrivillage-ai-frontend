import { z } from "zod";

/**
 * Hasil mesin rekomendasi: PAKET makan per waktu (bukan "5 hidangan teratas").
 * Skema ini memvalidasi keluaran backend sebelum masuk cache TanStack Query.
 */

export const MealItemSchema = z.object({
  slot: z.string(),
  recipeId: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
  closing: z.array(z.string()),
  cost: z.number().nonnegative(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  calciumMg: z.number().nonnegative(),
  ironMg: z.number().nonnegative(),
  vitaminAMcg: z.number().nonnegative(),
  vitaminCMcg: z.number().nonnegative(),
  sugarG: z.number().nonnegative(),
  sodiumMg: z.number().nonnegative(),
  allergens: z.array(z.string()),
  scores: z.object({
    nutrition: z.number(),
    budget: z.number(),
    seasonal: z.number(),
    local: z.number(),
    total: z.number(),
  }),
});
export type MealItem = z.infer<typeof MealItemSchema>;

export const MealSummarySchema = z.object({
  components: z.number().int().nonnegative(),
  cost: z.number().nonnegative(),
  energyPct: z.number(),
  proteinPct: z.number(),
  sugarG: z.number().nonnegative(),
  sodiumMg: z.number().nonnegative(),
  withinBudget: z.boolean(),
  compliant: z.boolean(),
});
export type MealSummary = z.infer<typeof MealSummarySchema>;

export const MemberTargetSchema = z.object({
  name: z.string(),
  age: z.number(),
  gender: z.string(),
  weightKg: z.number(),
  heightCm: z.number(),
  bmi: z.number(),
  nutritionStatus: z.string(),
  energy: z.number(),
  energyAkg: z.number(),
  protein: z.number(),
  basis: z.string(),
  zHeightForAge: z.number().nullable(),
  zWeightForAge: z.number().nullable(),
  zBmiForAge: z.number().nullable(),
});
export type MemberTarget = z.infer<typeof MemberTargetSchema>;

export const MealPlanSchema = z.object({
  status: z.enum(["ok", "infeasible"]),
  reason: z.string().nullable(),
  suggestion: z.string().nullable(),
  budgetPerPortion: z.number().nonnegative(),
  dailyBudget: z.number().nonnegative(),
  totalDailyCost: z.number().nonnegative(),
  withinBudget: z.boolean(),
  requiredSlots: z.array(z.string()),
  target: z.object({
    dailyEnergy: z.number(),
    dailyProtein: z.number(),
    energyPerPortion: z.number(),
    proteinPerPortion: z.number(),
    members: z.array(MemberTargetSchema),
  }),
  meals: z.array(
    z.object({
      label: z.string(),
      budgetPerPortion: z.number().nonnegative(),
      items: z.array(MealItemSchema),
      summary: MealSummarySchema,
    }),
  ),
  snacks: z.array(
    z.object({
      label: z.string(),
      recipeId: z.number().int().positive(),
      name: z.string(),
      slot: z.string(),
      cost: z.number().nonnegative(),
      calories: z.number().nonnegative(),
      protein: z.number().nonnegative(),
    }),
  ),
  warnings: z.array(z.string()),
  adjustments: z.array(z.string()),
  shopping: z.array(
    z.object({
      name: z.string(),
      grams: z.number().nonnegative(),
      cost: z.number().nonnegative(),
    }),
  ),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;

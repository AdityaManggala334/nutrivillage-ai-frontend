import { z } from "zod";
import { MealItemSchema } from "./meal-plan";

/** Paket MBG per kelompok penerima manfaat (hasil endpoint /recommendations/sppg). */

export const SppgPlanSchema = z.object({
  status: z.enum(["ok", "infeasible"]),
  school: z.string(),
  region: z.string(),
  studentCount: z.number().int().nonnegative(),
  totalCost: z.number().nonnegative(),
  allergies: z.array(z.string()),
  warnings: z.array(z.string()),
  reason: z.string().nullable(),
  suggestion: z.string().nullable(),
  groups: z.array(
    z.object({
      level: z.string(),
      label: z.string(),
      students: z.number().int().nonnegative(),
      budgetPerPortion: z.number().nonnegative(),
      targetKcal: z.number(),
      targetProtein: z.number(),
      items: z.array(MealItemSchema),
      costPerPortion: z.number().nonnegative(),
      energyPct: z.number(),
      proteinPct: z.number(),
      withinBudget: z.boolean(),
      batchCost: z.number().nonnegative(),
      batchBudget: z.number().nonnegative(),
    }),
  ),
});
export type SppgPlan = z.infer<typeof SppgPlanSchema>;

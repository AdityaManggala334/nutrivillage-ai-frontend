import { z } from "zod";

/** Skema data untuk halaman sisi Admin (FR-22 s.d. FR-34). */

export const PriceStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type PriceStatus = z.infer<typeof PriceStatusSchema>;

export const AdminIngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  isLocal: z.boolean(),
  isInSeason: z.boolean(),
  latestPrice: z.number().nonnegative(),
});
export type AdminIngredient = z.infer<typeof AdminIngredientSchema>;

export const AdminPriceSchema = z.object({
  id: z.string().min(1),
  ingredientName: z.string().min(1),
  price: z.number().nonnegative(),
  unit: z.string().min(1),
  source: z.string().min(1),
  recordedAt: z.string().min(1),
  status: PriceStatusSchema,
});
export type AdminPrice = z.infer<typeof AdminPriceSchema>;

export const AdminRecipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  servings: z.number().int().positive(),
  estimatedCost: z.number().nonnegative(),
  isLocal: z.boolean(),
  inSeason: z.boolean(),
});
export type AdminRecipe = z.infer<typeof AdminRecipeSchema>;

export const SeasonSchema = z.object({
  id: z.string().min(1),
  commodity: z.string().min(1),
  months: z.array(z.string().min(1)),
});
export type Season = z.infer<typeof SeasonSchema>;

export const LocalCommoditySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  region: z.string().min(1),
  isLocal: z.boolean(),
});
export type LocalCommodity = z.infer<typeof LocalCommoditySchema>;

export const ScraperLogSchema = z.object({
  id: z.string().min(1),
  runAt: z.string().min(1),
  status: z.enum(["success", "failed"]),
  source: z.string().min(1),
  message: z.string().min(1),
  itemsScraped: z.number().int().nonnegative(),
});
export type ScraperLog = z.infer<typeof ScraperLogSchema>;

export const AdminStatsSchema = z.object({
  ingredients: z.number().int().nonnegative(),
  recipes: z.number().int().nonnegative(),
  pendingPrices: z.number().int().nonnegative(),
  approvedPrices: z.number().int().nonnegative(),
  users: z.number().int().nonnegative(),
  scraperFailures: z.number().int().nonnegative(),
});
export type AdminStats = z.infer<typeof AdminStatsSchema>;

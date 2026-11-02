import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import {
  AdminIngredientSchema,
  AdminRecipeSchema,
  AdminStatsSchema,
  FoodSafetyInfoSchema,
  LocalCommoditySchema,
  ScraperLogSchema,
  SeasonSchema,
  type AdminIngredient,
  type AdminIngredientInput,
  type AdminLocalInput,
  type AdminRecipe,
  type AdminRecipeInput,
  type AdminSeasonInput,
  type AdminStats,
  type FoodSafetyInfo,
  type FoodSafetyInput,
  type FoodSafetyVerification,
  type LocalCommodity,
  type ScraperLog,
  type Season,
} from "@/schemas/admin";
import {
  BackendError,
  backendAdminFoodSafety,
  backendAdminIngredients,
  backendAdminLocal,
  backendAdminRecipes,
  backendAdminScraperRuns,
  backendAdminSeasons,
  backendAdminStats,
  backendCreateFoodSafety,
  backendCreateIngredient,
  backendCreateLocal,
  backendCreateRecipe,
  backendCreateSeason,
  backendDeleteFoodSafety,
  backendDeleteIngredient,
  backendDeleteLocal,
  backendDeleteRecipe,
  backendDeleteSeason,
  backendPrices,
  backendPublicFoodSafety,
  backendRegions,
  backendUpdateFoodSafety,
  backendUpdateIngredient,
  backendUpdateLocal,
  backendUpdateRecipe,
  backendUpdateSeason,
  backendVerifyFoodSafety,
  type BackendFoodSafetyPayload,
  type BackendFoodSafetyRow,
  type BackendIngredientPayload,
  type BackendLocalPayload,
  type BackendRecipePayload,
  type BackendSeasonPayload,
} from "@/server/backend-api";

/**
 * Data master admin dari database (FR-22, FR-30, FR-31, FR-34).
 * Semua fungsi di sini memakai sesi admin; tidak ada data mock.
 */

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const LEVEL_LOKAL: Readonly<Record<string, string>> = {
  abundant: "Melimpah",
  available: "Tersedia",
  limited: "Terbatas",
};

const VERIFIKASI: Readonly<Record<string, FoodSafetyVerification>> = {
  pending: "pending",
  verified: "verified",
  rejected: "rejected",
};

async function sessionToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) {
    throw new BackendError("Sesi tidak ditemukan. Silakan masuk kembali.", 401);
  }
  return token;
}

function toFoodSafety(row: BackendFoodSafetyRow): FoodSafetyInfo {
  return FoodSafetyInfoSchema.parse({
    id: String(row.id),
    topic: row.topic,
    riskType: row.risk_type,
    hazard: row.hazard,
    handling: row.handling,
    source: row.source,
    verification: VERIFIKASI[row.verification] ?? "pending",
  });
}

export async function listAdminIngredients(): Promise<AdminIngredient[]> {
  const token = await sessionToken();
  const [rows, prices] = await Promise.all([
    backendAdminIngredients(token),
    backendPrices(token),
  ]);
  const terbaru = new Map<number, { date: string; price: number }>();
  for (const price of prices) {
    if (price.status !== "approved") continue;
    const current = terbaru.get(price.ingredient_id);
    if (!current || price.recorded_date > current.date) {
      terbaru.set(price.ingredient_id, { date: price.recorded_date, price: price.price });
    }
  }
  return rows.map((row) =>
    AdminIngredientSchema.parse({
      id: String(row.id),
      name: row.name,
      category: row.category,
      unit: row.unit,
      isLocal: row.is_local,
      isInSeason: row.is_in_season,
      latestPrice: terbaru.get(row.id)?.price ?? 0,
      description: row.description ?? null,
      mbgSlot: row.mbg_slot ?? null,
      allergens: row.allergens ?? [],
      usedInMenus: row.used_in_menus ?? 0,
    }),
  );
}

export async function listAdminRecipes(): Promise<AdminRecipe[]> {
  const rows = await backendAdminRecipes(await sessionToken());
  return rows.map((row) =>
    AdminRecipeSchema.parse({
      id: String(row.id),
      name: row.name,
      category: row.category,
      servings: row.servings,
      estimatedCost: row.estimated_cost,
      isLocal: row.is_local,
      inSeason: row.in_season,
      description: row.description ?? null,
      cookingTimeMin: row.cooking_time_min,
      steps: row.steps ?? [],
      tags: row.tags ?? [],
      mealKind: row.meal_kind,
      imageUrl: row.image_url,
      imageFileId: row.image_file_id,
      imageAlt: row.image_alt,
      foodSafety: (row.food_safety ?? []).map((item) => ({
        id: item.id,
        topic: item.topic,
        verification: item.verification,
      })),
      ingredients: (row.ingredients ?? []).map((line) => ({
        ingredientId: line.ingredient_id,
        name: line.name,
        quantity: line.quantity,
        unit: line.unit,
        estimatedPrice: line.estimated_price,
        isPantry: line.is_pantry,
        note: line.note ?? null,
      })),
    }),
  );
}

export async function listSeasons(): Promise<Season[]> {
  const token = await sessionToken();
  const [rows, ingredients] = await Promise.all([
    backendAdminSeasons(token),
    backendAdminIngredients(token),
  ]);
  const nama = new Map(ingredients.map((item) => [item.id, item.name]));
  return rows.map((row) =>
    SeasonSchema.parse({
      id: String(row.id),
      ingredientId: row.ingredient_id,
      commodity: nama.get(row.ingredient_id) ?? `Bahan #${row.ingredient_id}`,
      month: row.month,
      monthName: BULAN[row.month - 1] ?? String(row.month),
      status: row.status,
    }),
  );
}

export async function listLocalCommodities(): Promise<LocalCommodity[]> {
  const token = await sessionToken();
  const [rows, ingredients, regions] = await Promise.all([
    backendAdminLocal(token),
    backendAdminIngredients(token),
    backendRegions(token),
  ]);
  const nama = new Map(ingredients.map((item) => [item.id, item.name]));
  const wilayah = new Map(regions.map((item) => [item.id, item.name]));
  return rows.map((row) =>
    LocalCommoditySchema.parse({
      id: String(row.id),
      ingredientId: row.ingredient_id,
      regionId: row.region_id,
      name: nama.get(row.ingredient_id) ?? `Bahan #${row.ingredient_id}`,
      region: wilayah.get(row.region_id) ?? `Wilayah #${row.region_id}`,
      level: LEVEL_LOKAL[row.level] ?? row.level,
      levelCode: row.level,
      source: row.source ?? "",
    }),
  );
}

export interface AdminOption {
  readonly id: number;
  readonly name: string;
}

export async function listRegionOptions(): Promise<AdminOption[]> {
  return (await backendRegions(await sessionToken())).map((row) => ({
    id: row.id,
    name: row.name,
  }));
}

export async function listScraperLogs(): Promise<ScraperLog[]> {
  const rows = await backendAdminScraperRuns(await sessionToken());
  return rows.map((row) =>
    ScraperLogSchema.parse({
      id: String(row.id),
      runAt: row.started_at ?? row.finished_at ?? new Date().toISOString(),
      status: row.status,
      source: row.source,
      message: row.error_message ?? "Selesai tanpa kendala",
      itemsScraped: row.items_count,
    }),
  );
}

export async function getAdminStats(): Promise<AdminStats> {
  const row = await backendAdminStats(await sessionToken());
  return AdminStatsSchema.parse({
    ingredients: row.ingredients,
    recipes: row.recipes,
    pendingPrices: row.pending_prices,
    approvedPrices: row.approved_prices,
    users: row.users,
    scraperFailures: row.scraper_failures,
  });
}

function ingredientPayload(input: AdminIngredientInput): BackendIngredientPayload {
  return {
    name: input.name,
    category: input.category,
    unit: input.unit,
    description: input.description,
    is_local: input.isLocal,
    is_in_season: input.isInSeason,
    mbg_slot: input.mbgSlot,
    allergens: input.allergens,
  };
}

export async function createIngredient(input: AdminIngredientInput): Promise<void> {
  await backendCreateIngredient(await sessionToken(), ingredientPayload(input));
}

export async function updateIngredient(
  id: number,
  input: AdminIngredientInput,
): Promise<void> {
  await backendUpdateIngredient(await sessionToken(), id, ingredientPayload(input));
}

export async function deleteIngredient(id: number): Promise<void> {
  await backendDeleteIngredient(await sessionToken(), id);
}

function recipePayload(input: AdminRecipeInput): BackendRecipePayload {
  return {
    name: input.name,
    category: input.category,
    description: input.description,
    servings: input.servings,
    cooking_time_min: input.cookingTimeMin,
    steps: input.steps,
    tags: input.tags,
    is_local: input.isLocal,
    in_season: input.inSeason,
    estimated_cost: input.estimatedCost,
    meal_kind: input.mealKind,
    image_url: input.imageUrl,
    image_file_id: input.imageFileId,
    image_alt: input.imageAlt,
    food_safety_ids: input.foodSafetyIds,
    ingredients: input.ingredients.map((line) => ({
      ingredient_id: line.ingredientId,
      name: line.name,
      quantity: line.quantity,
      unit: line.unit,
      estimated_price: line.estimatedPrice,
      is_pantry: line.isPantry,
      note: line.note,
    })),
  };
}

export async function createRecipe(input: AdminRecipeInput): Promise<void> {
  await backendCreateRecipe(await sessionToken(), recipePayload(input));
}

export async function updateRecipe(id: number, input: AdminRecipeInput): Promise<void> {
  await backendUpdateRecipe(await sessionToken(), id, recipePayload(input));
}

export async function deleteRecipe(id: number): Promise<void> {
  await backendDeleteRecipe(await sessionToken(), id);
}

function seasonPayload(input: AdminSeasonInput): BackendSeasonPayload {
  return {
    ingredient_id: input.ingredientId,
    month: input.month,
    status: input.status,
  };
}

export async function createSeason(input: AdminSeasonInput): Promise<void> {
  await backendCreateSeason(await sessionToken(), seasonPayload(input));
}

export async function updateSeason(id: number, input: AdminSeasonInput): Promise<void> {
  await backendUpdateSeason(await sessionToken(), id, seasonPayload(input));
}

export async function deleteSeason(id: number): Promise<void> {
  await backendDeleteSeason(await sessionToken(), id);
}

function localPayload(input: AdminLocalInput): BackendLocalPayload {
  return {
    ingredient_id: input.ingredientId,
    region_id: input.regionId,
    level: input.level,
    source: input.source,
  };
}

export async function createLocal(input: AdminLocalInput): Promise<void> {
  await backendCreateLocal(await sessionToken(), localPayload(input));
}

export async function updateLocal(id: number, input: AdminLocalInput): Promise<void> {
  await backendUpdateLocal(await sessionToken(), id, localPayload(input));
}

export async function deleteLocal(id: number): Promise<void> {
  await backendDeleteLocal(await sessionToken(), id);
}

export async function listFoodSafety(): Promise<FoodSafetyInfo[]> {
  const rows = await backendAdminFoodSafety(await sessionToken());
  return rows.map(toFoodSafety);
}

function foodSafetyPayload(input: FoodSafetyInput): BackendFoodSafetyPayload {
  return {
    topic: input.topic,
    risk_type: input.riskType,
    hazard: input.hazard,
    handling: input.handling,
    source: input.source,
    verification: input.verification,
  };
}

export async function createFoodSafety(input: FoodSafetyInput): Promise<FoodSafetyInfo> {
  return toFoodSafety(await backendCreateFoodSafety(await sessionToken(), foodSafetyPayload(input)));
}

export async function updateFoodSafety(
  id: number,
  input: FoodSafetyInput,
): Promise<FoodSafetyInfo> {
  return toFoodSafety(await backendUpdateFoodSafety(await sessionToken(), id, foodSafetyPayload(input)));
}

export async function deleteFoodSafety(id: number): Promise<void> {
  await backendDeleteFoodSafety(await sessionToken(), id);
}

export async function listVerifiedFoodSafety(): Promise<FoodSafetyInfo[]> {
  const rows = await backendPublicFoodSafety("");
  return rows.map(toFoodSafety);
}

export async function verifyFoodSafety(
  itemId: number,
  verification: FoodSafetyVerification,
): Promise<FoodSafetyInfo> {
  return toFoodSafety(
    await backendVerifyFoodSafety(await sessionToken(), itemId, verification),
  );
}

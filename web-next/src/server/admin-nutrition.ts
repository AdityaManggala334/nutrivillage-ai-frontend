import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import {
  NutritionRowListSchema,
  NutritionRowSchema,
  type NutritionRow,
  type NutritionRowUpdate,
} from "@/schemas/admin";
import {
  BackendError,
  backendImportDataset,
  backendNutritionGrid,
  backendUpdateNutrition,
  type BackendNutritionGridRow,
  type BackendImportReport,
  type BackendNutritionUpdate,
} from "@/server/backend-api";

/** Service sisi server untuk dasbor Nutrisi (bahan + gizi + harga). */

async function sessionToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) {
    throw new BackendError("Sesi tidak ditemukan. Silakan masuk kembali.", 401);
  }
  return token;
}

function toRow(row: BackendNutritionGridRow): NutritionRow {
  return NutritionRowSchema.parse({
    ingredientId: row.ingredient_id,
    code: row.code,
    name: row.name,
    category: row.category,
    unit: row.unit,
    mbgSlot: row.mbg_slot,
    allergens: row.allergens,
    isLocal: row.is_local,
    usedInMenus: row.used_in_menus,
    pricePerKg: row.price_per_kg,
    priceSource: row.price_source,
    priceStatus: row.price_status,
    nutrition: row.nutrition
      ? {
          calories: row.nutrition.calories,
          protein: row.nutrition.protein,
          carbs: row.nutrition.carbs,
          fat: row.nutrition.fat,
          fiber: row.nutrition.fiber,
          bddPercent: row.nutrition.bdd_percent,
          calciumMg: row.nutrition.calcium_mg,
          ironMg: row.nutrition.iron_mg,
          vitaminAMcg: row.nutrition.vitamin_a_mcg,
          vitaminCMcg: row.nutrition.vitamin_c_mg,
          sugarG: row.nutrition.sugar_g,
          sodiumMg: row.nutrition.sodium_mg,
          source: row.nutrition.source,
        }
      : null,
  });
}

export async function listNutritionRows(): Promise<NutritionRow[]> {
  const rows = await backendNutritionGrid(await sessionToken());
  return NutritionRowListSchema.parse(rows.map(toRow));
}

export async function updateNutritionRow(
  ingredientId: number,
  input: NutritionRowUpdate,
): Promise<NutritionRow> {
  const payload: BackendNutritionUpdate = {
    name: input.name,
    category: input.category,
    unit: input.unit,
    mbg_slot: input.mbgSlot,
    allergens: input.allergens,
    price_per_kg: input.pricePerKg,
    nutrition: {
      calories: input.nutrition.calories,
      protein: input.nutrition.protein,
      carbs: input.nutrition.carbs,
      fat: input.nutrition.fat,
      fiber: input.nutrition.fiber,
      bdd_percent: input.nutrition.bddPercent,
      calcium_mg: input.nutrition.calciumMg,
      iron_mg: input.nutrition.ironMg,
      vitamin_a_mcg: input.nutrition.vitaminAMcg,
      vitamin_c_mg: input.nutrition.vitaminCMcg,
      sugar_g: input.nutrition.sugarG,
      sodium_mg: input.nutrition.sodiumMg,
      source: input.nutrition.source,
    },
  };
  return toRow(await backendUpdateNutrition(await sessionToken(), ingredientId, payload));
}

/** Unggah CSV dataset ke backend. `terapkan=false` hanya pratinjau. */
export async function importDataset(
  files: File[],
  options: { readonly region: string; readonly terapkan: boolean },
): Promise<BackendImportReport> {
  const form = new FormData();
  for (const file of files) form.append("berkas", file);
  form.append("region", options.region);
  form.append("terapkan", String(options.terapkan));
  return backendImportDataset(await sessionToken(), form);
}

import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import type { MealPlan, MealPlanEntry, ShoppingList } from "@/schemas/domain";
import { DayOfWeekSchema, MealSlotSchema } from "@/schemas/domain";
import {
  BackendError,
  backendAssignMealPlan,
  backendDeleteShoppingItem,
  backendGenerateShoppingList,
  backendGetShoppingList,
  backendListMealPlans,
  backendPatchShoppingList,
  backendRemoveMealPlan,
  type BackendMealPlanEntry,
  type BackendShoppingList,
} from "@/server/backend-api";
import { getUserByToken } from "@/server/auth";
import { toRecipe } from "@/server/recipes";

/**
 * Akses data meal planner & daftar belanja dari database (FR-15 s.d. FR-17,
 * FR-26 s.d. FR-29). Dipakai Route Handler Next.js sebagai proxy ke backend
 * FastAPI; tamu tidak punya akun di database sehingga memperoleh pesan ramah.
 */

export const WEEK_LABEL = "Pekan Ini (Senin - Minggu)";
export const DEFAULT_WEEK_ID = "pekan-ini";

async function sessionToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) throw new BackendError("Sesi tidak ditemukan. Silakan masuk kembali.", 401);
  return token;
}

/** Token sesi aktif; hanya pengguna terdaftar yang punya data di database. */
async function accountToken(): Promise<string> {
  const token = await sessionToken();
  const user = getUserByToken(token);
  if (!user) throw new BackendError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role === "guest") {
    throw new BackendError(
      "Mode tamu tidak menyimpan jadwal maupun daftar belanja. Silakan masuk atau daftar.",
      401,
    );
  }
  return token;
}

/* ------------------------------------------------------------------ */
/* Meal planner                                                        */
/* ------------------------------------------------------------------ */

function toMealPlanEntry(entry: BackendMealPlanEntry): MealPlanEntry | null {
  if (!entry.recipe) return null;
  try {
    return {
      id: String(entry.id),
      day: DayOfWeekSchema.parse(entry.day),
      slot: MealSlotSchema.parse(entry.slot),
      recipe: toRecipe(entry.recipe),
      note: entry.note ?? "",
    };
  } catch {
    // Data resep tidak lengkap → lewati agar daftar tetap tampil.
    return null;
  }
}

/** Jadwal milik sesi aktif untuk satu pekan (dari tabel `meal_plans`). */
export async function listMealPlansFromDb(weekId: string): Promise<MealPlan> {
  const token = await accountToken();
  const entries = await backendListMealPlans(token, weekId);
  return {
    weekId,
    weekLabel: WEEK_LABEL,
    entries: entries
      .map(toMealPlanEntry)
      .filter((entry): entry is MealPlanEntry => entry !== null),
  };
}

/** Assign / ganti menu pada satu slot (upsert di backend). */
export async function assignMealPlanDb(input: {
  readonly weekId: string;
  readonly day: MealPlanEntry["day"];
  readonly slot: MealPlanEntry["slot"];
  readonly recipeId: string;
  readonly note: string;
}): Promise<MealPlanEntry> {
  const recipeId = Number(input.recipeId);
  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    throw new BackendError("Resep tidak valid.", 400);
  }

  const token = await accountToken();
  const entry = await backendAssignMealPlan(token, {
    week_id: input.weekId,
    day: input.day,
    slot: input.slot,
    recipe_id: recipeId,
    note: input.note,
  });

  const mapped = toMealPlanEntry(entry);
  if (!mapped) throw new BackendError("Resep tidak ditemukan.", 404);
  return mapped;
}

export async function removeMealPlanDb(entryId: string): Promise<{ entryId: string }> {
  const id = Number(entryId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BackendError("Jadwal tidak valid.", 400);
  }
  const token = await accountToken();
  const removed = await backendRemoveMealPlan(token, id);
  return { entryId: String(removed.entry_id) };
}

/* ------------------------------------------------------------------ */
/* Daftar belanja                                                      */
/* ------------------------------------------------------------------ */

/** Daftar kosong dipakai ketika sesi belum punya data (mis. tamu). */
export function emptyShoppingList(title: string): ShoppingList {
  return {
    id: "kosong",
    title,
    items: [],
    note: "",
    totalEstimatedCost: 0,
    generatedAt: new Date().toISOString(),
  };
}

function toShoppingList(list: BackendShoppingList): ShoppingList {
  const generated = new Date(list.generated_at);
  const items = (list.items ?? [])
    .map((item) => ({
      id: String(item.id),
      name: item.name,
      quantity: Number(item.quantity),
      unit: item.unit,
      estimatedPrice: Math.max(0, Number(item.estimated_price)),
      checked: Boolean(item.checked),
    }))
    .filter((item) => item.quantity > 0);

  return {
    id: String(list.id || 0),
    title: list.title || "Daftar Belanja",
    items,
    note: list.note ?? "",
    totalEstimatedCost: items.reduce((total, item) => total + item.estimatedPrice, 0),
    generatedAt: Number.isNaN(generated.getTime()) ? new Date().toISOString() : generated.toISOString(),
  };
}

/** Daftar belanja milik sesi aktif (tabel `shopping_lists`). */
export async function getShoppingListFromDb(): Promise<ShoppingList> {
  const token = await accountToken();
  return toShoppingList(await backendGetShoppingList(token));
}

/** FR-29: generate ulang dari jadwal, ATAU FR-15: gabung satu resep. */
export async function generateShoppingListDb(input: {
  readonly weekId?: string;
  readonly recipeId?: string;
}): Promise<ShoppingList> {
  const token = await accountToken();

  if (input.recipeId !== undefined) {
    const recipeId = Number(input.recipeId);
    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      throw new BackendError("Resep tidak valid.", 400);
    }
    return toShoppingList(await backendGenerateShoppingList(token, { recipe_id: recipeId }));
  }

  return toShoppingList(
    await backendGenerateShoppingList(token, {
      week_id: input.weekId ?? DEFAULT_WEEK_ID,
    }),
  );
}

/** FR-16 (centang) & FR-17 (catatan). */
export async function patchShoppingListDb(input: {
  readonly itemId?: string;
  readonly checked?: boolean;
  readonly note?: string;
}): Promise<ShoppingList> {
  const token = await accountToken();

  if (input.note !== undefined) {
    return toShoppingList(await backendPatchShoppingList(token, { note: input.note }));
  }

  const itemId = Number(input.itemId);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new BackendError("Bahan tidak valid.", 400);
  }
  return toShoppingList(
    await backendPatchShoppingList(token, { item_id: itemId, checked: input.checked }),
  );
}

/** FR-16: hapus bahan dari daftar belanja. */
export async function deleteShoppingItemDb(itemId: string): Promise<ShoppingList> {
  const id = Number(itemId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BackendError("Bahan tidak valid.", 400);
  }
  const token = await accountToken();
  return toShoppingList(await backendDeleteShoppingItem(token, id));
}

import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import type { HistoryEntry } from "@/schemas/domain";
import {
  BackendError,
  backendDeleteHistory,
  backendListHistory,
  backendSaveHistory,
  backendSetHistoryFavorite,
  type BackendHistoryEntry,
} from "@/server/backend-api";
import { toRecipe } from "@/server/recipes";

export type HistoryFilter = "all" | "favorite" | "month";

async function sessionToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) {
    throw new BackendError("Sesi tidak ditemukan. Silakan masuk kembali.", 401);
  }
  return token;
}

function toHistoryEntry(entry: BackendHistoryEntry): HistoryEntry | null {
  if (!entry.recipe) return null;
  return {
    id: String(entry.id),
    kind: entry.kind === "meal-plan" ? "meal-plan" : "recommendation",
    recipe: toRecipe(entry.recipe),
    savedAt: entry.saved_at,
    favorite: entry.favorite,
    note: entry.note ?? "",
  };
}

/** Riwayat milik sesi aktif (tersimpan di database). */
export async function listHistoryFromDb(filter: HistoryFilter): Promise<HistoryEntry[]> {
  const token = await sessionToken();
  const entries = await backendListHistory(token, filter);
  return entries
    .map(toHistoryEntry)
    .filter((entry): entry is HistoryEntry => entry !== null);
}

export async function saveHistoryToDb(input: {
  readonly recipeId: string;
  readonly kind: HistoryEntry["kind"];
  readonly note: string;
}): Promise<HistoryEntry> {
  const recipeId = Number(input.recipeId);
  if (!Number.isFinite(recipeId)) {
    throw new BackendError("Resep tidak valid.", 400);
  }
  const token = await sessionToken();
  const entry = await backendSaveHistory(token, {
    recipe_id: recipeId,
    kind: input.kind,
    note: input.note,
  });
  const mapped = toHistoryEntry(entry);
  if (!mapped) throw new BackendError("Resep tidak ditemukan.", 404);
  return mapped;
}

export async function deleteHistoryFromDb(id: string): Promise<{ id: string }> {
  const token = await sessionToken();
  await backendDeleteHistory(token, id);
  return { id };
}

export async function setHistoryFavorite(id: string, favorite: boolean): Promise<HistoryEntry> {
  const token = await sessionToken();
  const entry = await backendSetHistoryFavorite(token, id, favorite);
  const mapped = toHistoryEntry(entry);
  if (!mapped) throw new BackendError("Resep tidak ditemukan.", 404);
  return mapped;
}

/** Toggle favorit (dipakai tombol bintang di UI). */
export async function toggleHistoryFavoriteDb(id: string, current: boolean): Promise<HistoryEntry> {
  return setHistoryFavorite(id, !current);
}

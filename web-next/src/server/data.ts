import "server-only";

import { cache } from "react";
import type { Recipe } from "@/schemas/domain";
import { getRecipeFromDb, listRecipesFromDb } from "@/server/recipes";

/**
 * Recommendation Engine (FR-09, FR-10, FR-25) di sisi server.
 *
 * Data riwayat, meal planner, dan daftar belanja berada di database
 * (`server/history.ts` & `server/planning.ts`) — modul ini tidak lagi
 * menyimpan data in-memory. Hanya boleh dipanggil dari Server Components /
 * Route Handlers.
 */

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
/* Riwayat (FR-12 s.d. FR-14), Meal Planner (FR-26 s.d. FR-28),        */
/* dan Daftar Belanja (FR-15 s.d. FR-17, FR-29) kini tersimpan di      */
/* database: lihat `server/history.ts` & `server/planning.ts`.         */
/* Modul ini tidak lagi menyimpan data apa pun secara in-memory.       */
/* ------------------------------------------------------------------ */

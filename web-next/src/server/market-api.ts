import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import {
  AdminPriceSchema,
  AdminStatsSchema,
  FoodSafetyInfoSchema,
  ScraperLogSchema,
  type AdminPrice,
  type AdminStats,
  type FoodSafetyInfo,
  type ScraperLog,
} from "@/schemas/admin";
import {
  backendAdminStats,
  backendListPrices,
  backendListScraperRuns,
  backendListVerifiedFoodSafety,
  backendVerifyPrice,
  type BackendFoodSafety,
  type BackendPrice,
  type BackendScraperRun,
} from "@/server/backend-api";

/** Lapisan service sisi server: harga pangan, log scraper, statistik admin. */

async function sessionToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) {
    throw new Error("Sesi tidak ditemukan. Silakan masuk kembali.");
  }
  return token;
}

function toPrice(item: BackendPrice): AdminPrice {
  return AdminPriceSchema.parse({
    id: item.id,
    ingredientName: item.ingredient_name || "-",
    price: Number(item.price),
    unit: item.unit,
    source: item.source,
    recordedAt: item.recorded_date,
    status: item.status,
  });
}

function toScraperLog(item: BackendScraperRun): ScraperLog {
  const fallback =
    item.status === "success" ? "Scraping selesai tanpa kendala" : "Eksekusi berakhir gagal";
  return ScraperLogSchema.parse({
    id: item.id,
    runAt: item.finished_at ?? item.started_at ?? item.scheduled_at ?? new Date().toISOString(),
    status: item.status,
    source: item.source,
    message: item.error_message?.trim() || fallback,
    itemsScraped: item.items_count,
  });
}

export function toFoodSafetyInfo(item: BackendFoodSafety): FoodSafetyInfo {
  return FoodSafetyInfoSchema.parse({
    id: item.id,
    topic: item.topic,
    riskType: item.risk_type,
    hazard: item.hazard,
    handling: item.handling,
    source: item.source,
    verification: item.verification,
  });
}

/** FR-23: daftar harga untuk panel admin (urut terbaru). */
export async function listPricesForSession(): Promise<AdminPrice[]> {
  const token = await sessionToken();
  const rows = await backendListPrices(token);
  return rows.map(toPrice);
}

/** FR-23: admin menyetujui/menolak data harga. */
export async function verifyPriceForSession(
  priceId: number,
  status: "approved" | "rejected",
): Promise<AdminPrice> {
  const token = await sessionToken();
  return toPrice(await backendVerifyPrice(token, priceId, status));
}

/** FR-31: log eksekusi scraper terbaru. */
export async function listScraperLogsForSession(): Promise<ScraperLog[]> {
  const token = await sessionToken();
  const rows = await backendListScraperRuns(token);
  return rows.map(toScraperLog);
}

/** Statistik dashboard admin — dihitung dari database. */
export async function adminStatsForSession(): Promise<AdminStats> {
  const token = await sessionToken();
  const stats = await backendAdminStats(token);
  return AdminStatsSchema.parse({
    ingredients: stats.ingredients,
    recipes: stats.recipes,
    pendingPrices: stats.pending_prices,
    approvedPrices: stats.approved_prices,
    users: stats.users,
    scraperFailures: stats.scraper_failures,
  });
}

/** Publik: informasi keamanan pangan yang sudah diverifikasi admin. */
export async function listVerifiedFoodSafety(): Promise<FoodSafetyInfo[]> {
  const rows = await backendListVerifiedFoodSafety();
  return rows.map(toFoodSafetyInfo);
}

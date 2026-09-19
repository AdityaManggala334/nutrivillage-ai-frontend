import "server-only";

import type {
  AdminIngredient,
  AdminPrice,
  AdminRecipe,
  AdminStats,
  LocalCommodity,
  PriceStatus,
  ScraperLog,
  Season,
} from "@/schemas/admin";
import { MOCK_RECIPES } from "./mock-data";

/**
 * Data tiruan untuk halaman sisi Admin (FR-22 s.d. FR-34).
 * Hanya dipakai React Server Components / Route Handler.
 */

const day = 24 * 60 * 60 * 1000;
const daysAgo = (n: number): string => new Date(Date.now() - n * day).toISOString();

const ingredients: AdminIngredient[] = [
  { id: "bahan-beras", name: "Beras", category: "Pokok", unit: "kg", isLocal: true, isInSeason: true, latestPrice: 15000 },
  { id: "bahan-tempe", name: "Tempe", category: "Protein", unit: "kg", isLocal: true, isInSeason: true, latestPrice: 20000 },
  { id: "bahan-kangkung", name: "Kangkung", category: "Sayur", unit: "ikat", isLocal: true, isInSeason: true, latestPrice: 3000 },
  { id: "bahan-tahu", name: "Tahu", category: "Protein", unit: "kg", isLocal: true, isInSeason: true, latestPrice: 15000 },
  { id: "bahan-ayam", name: "Ayam", category: "Protein", unit: "kg", isLocal: false, isInSeason: true, latestPrice: 35000 },
  { id: "bahan-ikan-nila", name: "Ikan nila", category: "Protein", unit: "kg", isLocal: true, isInSeason: true, latestPrice: 35000 },
  { id: "bahan-jagung", name: "Jagung manis", category: "Pokok", unit: "buah", isLocal: true, isInSeason: true, latestPrice: 3000 },
  { id: "bahan-kacang", name: "Kacang tanah", category: "Protein", unit: "kg", isLocal: true, isInSeason: false, latestPrice: 30000 },
  { id: "bahan-telur", name: "Telur", category: "Protein", unit: "kg", isLocal: false, isInSeason: true, latestPrice: 28000 },
  { id: "bahan-terong", name: "Terong", category: "Sayur", unit: "kg", isLocal: true, isInSeason: true, latestPrice: 12000 },
];

const prices: AdminPrice[] = [
  { id: "harga-1", ingredientName: "Beras", price: 15000, unit: "kg", source: "Pasar Madiun", recordedAt: daysAgo(1), status: "approved" },
  { id: "harga-2", ingredientName: "Tempe", price: 20000, unit: "kg", source: "Pasar Madiun", recordedAt: daysAgo(2), status: "approved" },
  { id: "harga-3", ingredientName: "Ayam", price: 35000, unit: "kg", source: "Portal Pasar", recordedAt: daysAgo(3), status: "approved" },
  { id: "harga-4", ingredientName: "Kangkung", price: 3500, unit: "ikat", source: "Portal Pasar", recordedAt: daysAgo(0), status: "pending" },
  { id: "harga-5", ingredientName: "Ikan nila", price: 36000, unit: "kg", source: "Portal Pasar", recordedAt: daysAgo(0), status: "pending" },
  { id: "harga-6", ingredientName: "Telur", price: 27000, unit: "kg", source: "Pasar Madiun", recordedAt: daysAgo(9), status: "pending" },
];

const recipes: AdminRecipe[] = MOCK_RECIPES.map((recipe) => ({
  id: recipe.id,
  name: recipe.name,
  category: recipe.category,
  servings: recipe.servings,
  estimatedCost: recipe.estimatedCost,
  isLocal: recipe.isLocal,
  inSeason: recipe.inSeason,
}));

const seasons: Season[] = [
  { id: "musim-1", commodity: "Jagung manis", months: ["Januari", "Februari", "Maret", "April"] },
  { id: "musim-2", commodity: "Kacang panjang", months: ["Mei", "Juni", "Juli"] },
  { id: "musim-3", commodity: "Terong", months: ["April", "Mei", "Juni", "Juli"] },
  { id: "musim-4", commodity: "Kangkung", months: ["Sepanjang tahun"] },
  { id: "musim-5", commodity: "Tomat", months: ["Juni", "Juli", "Agustus"] },
];

const localCommodities: LocalCommodity[] = [
  { id: "lokal-1", name: "Beras Madiun", region: "Kabupaten Madiun", isLocal: true },
  { id: "lokal-2", name: "Tempe kedelai lokal", region: "Kabupaten Madiun", isLocal: true },
  { id: "lokal-3", name: "Ikan nila kolam", region: "Kabupaten Madiun", isLocal: true },
  { id: "lokal-4", name: "Jagung manis", region: "Kabupaten Madiun", isLocal: true },
  { id: "lokal-5", name: "Kangkung", region: "Kabupaten Madiun", isLocal: true },
  { id: "lokal-6", name: "Ayam broiler", region: "Luar daerah", isLocal: false },
];

const scraperLogs: ScraperLog[] = [
  { id: "log-1", runAt: daysAgo(0), status: "success", source: "Portal Pasar Madiun", message: "Scraping selesai tanpa kendala", itemsScraped: 42 },
  { id: "log-2", runAt: daysAgo(1), status: "success", source: "Portal Pasar Madiun", message: "Scraping selesai tanpa kendala", itemsScraped: 40 },
  { id: "log-3", runAt: daysAgo(2), status: "failed", source: "Portal Pasar Madiun", message: "Timeout saat mengambil halaman harga", itemsScraped: 0 },
  { id: "log-4", runAt: daysAgo(3), status: "success", source: "Portal Pasar Madiun", message: "Scraping selesai tanpa kendala", itemsScraped: 41 },
  { id: "log-5", runAt: daysAgo(4), status: "failed", source: "Portal Pasar Madiun", message: "Struktur HTML berubah, selector tidak ditemukan", itemsScraped: 5 },
  { id: "log-6", runAt: daysAgo(5), status: "success", source: "Portal Pasar Madiun", message: "Scraping selesai tanpa kendala", itemsScraped: 39 },
];

export async function getAdminIngredients(): Promise<AdminIngredient[]> {
  return [...ingredients];
}

export async function getAdminPrices(): Promise<AdminPrice[]> {
  return [...prices].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
}

export async function getAdminRecipes(): Promise<AdminRecipe[]> {
  return [...recipes];
}

export async function getSeasons(): Promise<Season[]> {
  return [...seasons];
}

export async function getLocalCommodities(): Promise<LocalCommodity[]> {
  return [...localCommodities];
}

export async function getScraperLogs(): Promise<ScraperLog[]> {
  return [...scraperLogs];
}

/** FR-23: verifikasi harga oleh admin (ubah status). */
export async function verifyPrice(id: string, status: PriceStatus): Promise<AdminPrice> {
  const found = prices.find((price) => price.id === id);
  if (!found) throw new Error("Data harga tidak ditemukan");
  found.status = status;
  return found;
}

export async function getAdminStats(userCount: number): Promise<AdminStats> {
  return {
    ingredients: ingredients.length,
    recipes: recipes.length,
    pendingPrices: prices.filter((price) => price.status === "pending").length,
    approvedPrices: prices.filter((price) => price.status === "approved").length,
    users: userCount,
    scraperFailures: scraperLogs.filter((log) => log.status === "failed").length,
  };
}

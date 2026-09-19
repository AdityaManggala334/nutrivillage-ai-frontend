import "server-only";

import type { NutritionInfo, Recipe, RecipeIngredient } from "@/schemas/domain";
import { toRecipeId } from "@/types/branded";

/**
 * Dataset pangan lokal Kabupaten Madiun (mock, sisi server).
 * Data ini hanya boleh diakses React Server Components / Route Handlers,
 * tidak pernah dikirim ke bundle klien secara langsung.
 */

const ingredient = (
  id: string,
  name: string,
  quantity: number,
  unit: string,
  estimatedPrice: number,
): RecipeIngredient => ({ id, name, quantity, unit, estimatedPrice });

const nutrition = (
  calories: number,
  protein: number,
  carbohydrates: number,
  fat: number,
  fiber: number,
): NutritionInfo => ({ calories, protein, carbohydrates, fat, fiber });

interface RecipeSeed {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly servings: number;
  readonly cookingSteps: readonly string[];
  readonly ingredients: readonly RecipeIngredient[];
  readonly nutrition: NutritionInfo;
  readonly imageKey: string;
  readonly isLocal: boolean;
  readonly inSeason: boolean;
  readonly tags: readonly string[];
  /** FR-33: opsional; default = 2 hari lalu (harga masih segar). */
  readonly priceUpdatedAt?: string;
}

/** Tanggal verifikasi harga n hari lalu (ISO-8601). */
const daysAgoIso = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const createRecipe = (seed: RecipeSeed): Recipe => ({
  ...seed,
  id: toRecipeId(seed.id),
  cookingSteps: [...seed.cookingSteps],
  ingredients: [...seed.ingredients],
  tags: [...seed.tags],
  imageAlt: `Foto ${seed.name}, sajian pangan lokal Kabupaten Madiun.`,
  estimatedCost: seed.ingredients.reduce((total, item) => total + item.estimatedPrice, 0),
  priceUpdatedAt: seed.priceUpdatedAt ?? daysAgoIso(2),
});

export const MOCK_RECIPES: readonly Recipe[] = [
  createRecipe({
    id: "resep-nasi-pecel",
    name: "Nasi Pecel Madiun",
    category: "Makanan Utama",
    description: "Nasi dengan sayur rebus dan sambal kacang khas Madiun yang kaya serat.",
    servings: 4,
    cookingSteps: [
      "Rebus kangkung dan tauge hingga matang, lalu tiriskan.",
      "Haluskan kacang tanah, gula jawa, dan cabai menjadi sambal pecel.",
      "Sajikan nasi hangat dengan sayur dan sambal pecel.",
    ],
    ingredients: [
      ingredient("bahan-beras", "Beras", 0.3, "kg", 4500),
      ingredient("bahan-kacang", "Kacang tanah", 0.1, "kg", 3000),
      ingredient("bahan-kangkung", "Kangkung", 1, "ikat", 3000),
      ingredient("bahan-tauge", "Tauge", 0.15, "kg", 2500),
      ingredient("bahan-tempe", "Tempe", 0.15, "kg", 3000),
      ingredient("bahan-gula-jawa", "Gula jawa", 0.05, "kg", 1500),
    ],
    nutrition: nutrition(520, 18, 62, 22, 6),
    imageKey: "pecel",
    isLocal: true,
    inSeason: true,
    tags: ["sayur", "kacang", "tradisional"],
  }),
  createRecipe({
    id: "resep-sayur-lodeh",
    name: "Sayur Lodeh Tempe",
    category: "Sayur",
    description: "Sayur kuah santan dengan tempe dan aneka sayuran lokal.",
    servings: 4,
    cookingSteps: [
      "Potong tempe, labu siam, kacang panjang, dan terong.",
      "Rebus santan bersama bumbu hingga mendidih.",
      "Masukkan sayuran dan masak hingga empuk.",
    ],
    ingredients: [
      ingredient("bahan-kelapa", "Kelapa parut", 0.2, "kg", 4000),
      ingredient("bahan-tempe", "Tempe", 0.2, "kg", 4000),
      ingredient("bahan-labu-siam", "Labu siam", 0.3, "kg", 4000),
      ingredient("bahan-kacang-panjang", "Kacang panjang", 0.2, "kg", 3000),
      ingredient("bahan-terong", "Terong", 0.25, "kg", 3000),
    ],
    nutrition: nutrition(310, 14, 24, 18, 7),
    imageKey: "lodeh",
    isLocal: true,
    inSeason: true,
    tags: ["santan", "sayur"],
  }),
  createRecipe({
    id: "resep-oseng-kangkung",
    name: "Oseng Kangkung Tempe",
    category: "Sayur",
    description: "Tumis kangkung dan tempe dengan bawang dan cabai, cepat dan murah.",
    servings: 3,
    cookingSteps: [
      "Tumis bawang merah dan cabai hingga harum.",
      "Masukkan tempe, masak sebentar.",
      "Tambahkan kangkung dan masak hingga layu.",
    ],
    ingredients: [
      ingredient("bahan-kangkung", "Kangkung", 1, "ikat", 3000),
      ingredient("bahan-tempe", "Tempe", 0.15, "kg", 3000),
      ingredient("bahan-bawang-merah", "Bawang merah", 0.05, "kg", 1500),
      ingredient("bahan-cabai", "Cabai", 0.03, "kg", 1500),
      ingredient("bahan-minyak", "Minyak goreng", 0.05, "liter", 2000),
    ],
    nutrition: nutrition(240, 12, 16, 14, 5),
    imageKey: "oseng",
    isLocal: true,
    inSeason: true,
    tags: ["pedas", "sayur", "hemat"],
  }),
  createRecipe({
    id: "resep-sup-ayam-jagung",
    name: "Sup Ayam Jagung",
    category: "Berkuah",
    description: "Sup hangat berisi ayam, jagung manis, dan sayuran untuk keluarga.",
    servings: 4,
    cookingSteps: [
      "Rebus ayam hingga keluar kaldu.",
      "Masukkan jagung, wortel, dan kentang.",
      "Bumbui dan taburi seledri sebelum diangkat.",
    ],
    ingredients: [
      ingredient("bahan-ayam", "Ayam", 0.4, "kg", 14000),
      ingredient("bahan-jagung", "Jagung manis", 2, "buah", 6000),
      ingredient("bahan-wortel", "Wortel", 0.15, "kg", 3000),
      ingredient("bahan-kentang", "Kentang", 0.2, "kg", 4000),
      ingredient("bahan-seledri", "Seledri", 0.05, "kg", 1000),
    ],
    nutrition: nutrition(380, 26, 34, 14, 4),
    imageKey: "sup",
    isLocal: true,
    inSeason: true,
    tags: ["ayam", "berkuah", "anak"],
  }),
  createRecipe({
    id: "resep-tahu-telur",
    name: "Tahu Telur Bumbu Kecap",
    category: "Lauk",
    description: "Tahu dan telur dimasak dengan bumbu kecap manis, sumber protein terjangkau.",
    servings: 3,
    cookingSteps: [
      "Goreng tahu dan telur hingga berkulit.",
      "Tumis bawang putih, lalu masukkan kecap.",
      "Masak tahu dan telur bersama bumbu hingga meresap.",
    ],
    ingredients: [
      ingredient("bahan-tahu", "Tahu", 0.3, "kg", 4500),
      ingredient("bahan-telur", "Telur", 4, "butir", 8000),
      ingredient("bahan-kecap", "Kecap manis", 0.1, "liter", 3000),
      ingredient("bahan-bawang-putih", "Bawang putih", 0.03, "kg", 1500),
      ingredient("bahan-minyak", "Minyak goreng", 0.05, "liter", 2000),
    ],
    nutrition: nutrition(420, 24, 18, 28, 3),
    imageKey: "tahu-telur",
    isLocal: true,
    inSeason: true,
    tags: ["telur", "protein", "hemat"],
  }),
  createRecipe({
    id: "resep-pepes-ikan",
    name: "Pepes Ikan Nila",
    category: "Lauk",
    description: "Ikan nila dibumbui rempah lalu dikukus dalam daun pisang, rendah lemak.",
    servings: 4,
    cookingSteps: [
      "Lumuri ikan nila dengan bumbu halus.",
      "Bungkus ikan bersama kemangi dan cabai dalam daun pisang.",
      "Kukus hingga matang, lalu bakar sebentar.",
    ],
    ingredients: [
      ingredient("bahan-ikan-nila", "Ikan nila", 0.6, "kg", 21000),
      ingredient("bahan-kemangi", "Kemangi", 1, "ikat", 2500),
      ingredient("bahan-cabai", "Cabai", 0.05, "kg", 2500),
      ingredient("bahan-daun-pisang", "Daun pisang", 1, "paket", 2000),
      ingredient("bahan-bumbu", "Bumbu rempah", 1, "paket", 3000),
    ],
    nutrition: nutrition(350, 30, 8, 20, 2),
    imageKey: "pepes",
    isLocal: true,
    inSeason: true,
    tags: ["ikan", "kukus", "protein"],
    priceUpdatedAt: daysAgoIso(9),
  }),
  createRecipe({
    id: "resep-urap-nasi-jagung",
    name: "Nasi Jagung Urap Sayur",
    category: "Makanan Utama",
    description: "Nasi jagung khas pedesaan dengan urap sayur kelapa yang mengenyangkan.",
    servings: 4,
    cookingSteps: [
      "Masak nasi jagung hingga matang.",
      "Rebus bayam, kacang panjang, dan tauge.",
      "Campur sayur dengan kelapa parut berbumbu, sajikan dengan nasi jagung.",
    ],
    ingredients: [
      ingredient("bahan-jagung-pipil", "Jagung pipil", 0.3, "kg", 5000),
      ingredient("bahan-beras", "Beras", 0.2, "kg", 3000),
      ingredient("bahan-bayam", "Bayam", 1, "ikat", 2500),
      ingredient("bahan-kacang-panjang", "Kacang panjang", 0.15, "kg", 2500),
      ingredient("bahan-kelapa", "Kelapa parut", 0.15, "kg", 3000),
    ],
    nutrition: nutrition(410, 12, 68, 10, 8),
    imageKey: "urap",
    isLocal: true,
    inSeason: true,
    tags: ["jagung", "sayur", "tradisional"],
  }),
  createRecipe({
    id: "resep-buntil-daun-pepaya",
    name: "Buntil Daun Pepaya",
    category: "Lauk",
    description: "Daun pepaya diisi kelapa berbumbu dan ikan teri, kaya serat dan kalsium.",
    servings: 4,
    cookingSteps: [
      "Layukan daun pepaya lalu bungkus isian kelapa dan teri.",
      "Susun buntil dalam panci berisi santan encer.",
      "Masak dengan api kecil hingga bumbu meresap.",
    ],
    ingredients: [
      ingredient("bahan-daun-pepaya", "Daun pepaya", 1, "ikat", 3000),
      ingredient("bahan-kelapa", "Kelapa parut", 0.25, "kg", 5000),
      ingredient("bahan-teri", "Ikan teri", 0.1, "kg", 6000),
      ingredient("bahan-santan", "Santan kelapa", 0.3, "liter", 4500),
      ingredient("bahan-bumbu", "Bumbu rempah", 1, "paket", 3000),
    ],
    nutrition: nutrition(290, 16, 20, 16, 9),
    imageKey: "buntil",
    isLocal: true,
    inSeason: true,
    tags: ["ikan", "sayur", "tradisional"],
    priceUpdatedAt: daysAgoIso(12),
  }),
];

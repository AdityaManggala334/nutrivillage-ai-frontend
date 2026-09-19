import {
  type NutritionInfo,
  type Recipe,
  type RecipeIngredient,
  type Recommendation,
  toIngredientId,
  toRecipeId,
  toRecommendationId,
} from '../types/domain';
import { type AsyncState, asyncError, asyncSuccess } from '../types/state';
import { delay } from './storage';

/* ------------------------------------------------------------------ */
/* Dataset dummy menu pangan lokal (FR-10)                             */
/* ------------------------------------------------------------------ */

const ingredient = (
  id: string,
  name: string,
  quantity: number,
  unit: string,
  estimatedPrice: number,
): RecipeIngredient => ({
  ingredientId: toIngredientId(id),
  name,
  quantity,
  unit,
  estimatedPrice,
});

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
  readonly imageAlt: string;
}

const createRecipe = (seed: RecipeSeed): Recipe => ({
  id: toRecipeId(seed.id),
  name: seed.name,
  category: seed.category,
  description: seed.description,
  servings: seed.servings,
  cookingSteps: seed.cookingSteps,
  ingredients: seed.ingredients,
  nutrition: seed.nutrition,
  imageAlt: seed.imageAlt,
  estimatedCost: seed.ingredients.reduce((total, item) => total + item.estimatedPrice, 0),
});

export const MOCK_RECIPES: readonly Recipe[] = [
  createRecipe({
    id: 'resep-nasi-pecel',
    name: 'Nasi Pecel Madiun',
    category: 'Makanan Utama',
    description: 'Nasi dengan sayur rebus dan sambal kacang khas Madiun.',
    servings: 4,
    cookingSteps: [
      'Rebus kangkung dan tauge hingga matang, tiriskan.',
      'Haluskan kacang tanah, gula jawa, dan cabai menjadi sambal pecel.',
      'Sajikan nasi dengan sayur dan sambal pecel.',
    ],
    ingredients: [
      ingredient('bahan-beras', 'Beras', 0.3, 'kg', 4500),
      ingredient('bahan-kacang', 'Kacang tanah', 0.1, 'kg', 3000),
      ingredient('bahan-kangkung', 'Kangkung', 1, 'ikat', 3000),
      ingredient('bahan-tauge', 'Tauge', 0.15, 'kg', 2500),
      ingredient('bahan-tempe', 'Tempe', 0.15, 'kg', 3000),
      ingredient('bahan-gula-jawa', 'Gula jawa', 0.05, 'kg', 1500),
    ],
    nutrition: nutrition(520, 18, 62, 22, 6),
    imageAlt: 'Sepiring nasi pecel Madiun dengan sayuran hijau.',
  }),
  createRecipe({
    id: 'resep-sayur-lodeh',
    name: 'Sayur Lodeh Tempe',
    category: 'Sayur',
    description: 'Sayur kuah santan dengan tempe dan aneka sayuran lokal.',
    servings: 4,
    cookingSteps: [
      'Potong tempe, labu siam, kacang panjang, dan terong.',
      'Rebus santan bersama bumbu hingga mendidih.',
      'Masukkan sayuran dan masak hingga empuk.',
    ],
    ingredients: [
      ingredient('bahan-kelapa', 'Kelapa parut', 0.2, 'kg', 4000),
      ingredient('bahan-tempe', 'Tempe', 0.2, 'kg', 4000),
      ingredient('bahan-labu-siam', 'Labu siam', 0.3, 'kg', 4000),
      ingredient('bahan-kacang-panjang', 'Kacang panjang', 0.2, 'kg', 3000),
      ingredient('bahan-terong', 'Terong', 0.25, 'kg', 3000),
    ],
    nutrition: nutrition(310, 14, 24, 18, 7),
    imageAlt: 'Semangkuk sayur lodeh tempe berkuah santan.',
  }),
  createRecipe({
    id: 'resep-oseng-kangkung',
    name: 'Oseng Kangkung Tempe',
    category: 'Sayur',
    description: 'Tumis kangkung dan tempe dengan bawang dan cabai.',
    servings: 3,
    cookingSteps: [
      'Tumis bawang merah dan cabai hingga harum.',
      'Masukkan tempe, masak sebentar.',
      'Tambahkan kangkung dan masak hingga layu.',
    ],
    ingredients: [
      ingredient('bahan-kangkung', 'Kangkung', 1, 'ikat', 3000),
      ingredient('bahan-tempe', 'Tempe', 0.15, 'kg', 3000),
      ingredient('bahan-bawang-merah', 'Bawang merah', 0.05, 'kg', 1500),
      ingredient('bahan-cabai', 'Cabai', 0.03, 'kg', 1500),
      ingredient('bahan-minyak', 'Minyak goreng', 0.05, 'liter', 2000),
    ],
    nutrition: nutrition(240, 12, 16, 14, 5),
    imageAlt: 'Tumis oseng kangkung tempe di atas piring.',
  }),
  createRecipe({
    id: 'resep-sup-ayam-jagung',
    name: 'Sup Ayam Jagung',
    category: 'Berkuah',
    description: 'Sup hangat berisi ayam, jagung manis, dan sayuran.',
    servings: 4,
    cookingSteps: [
      'Rebus ayam hingga keluar kaldu.',
      'Masukkan jagung, wortel, dan kentang.',
      'Bumbui dan taburi seledri sebelum diangkat.',
    ],
    ingredients: [
      ingredient('bahan-ayam', 'Ayam', 0.4, 'kg', 14000),
      ingredient('bahan-jagung', 'Jagung manis', 2, 'buah', 6000),
      ingredient('bahan-wortel', 'Wortel', 0.15, 'kg', 3000),
      ingredient('bahan-kentang', 'Kentang', 0.2, 'kg', 4000),
      ingredient('bahan-seledri', 'Seledri', 0.05, 'kg', 1000),
    ],
    nutrition: nutrition(380, 26, 34, 14, 4),
    imageAlt: 'Mangkuk sup ayam jagung hangat.',
  }),
  createRecipe({
    id: 'resep-tahu-telur',
    name: 'Tahu Telur Bumbu Kecap',
    category: 'Lauk',
    description: 'Tahu dan telur dimasak dengan bumbu kecap manis.',
    servings: 3,
    cookingSteps: [
      'Goreng tahu dan telur hingga berkulit.',
      'Tumis bawang putih, masukkan kecap.',
      'Masak tahu dan telur bersama bumbu hingga meresap.',
    ],
    ingredients: [
      ingredient('bahan-tahu', 'Tahu', 0.3, 'kg', 4500),
      ingredient('bahan-telur', 'Telur', 4, 'butir', 8000),
      ingredient('bahan-kecap', 'Kecap manis', 0.1, 'liter', 3000),
      ingredient('bahan-bawang-putih', 'Bawang putih', 0.03, 'kg', 1500),
      ingredient('bahan-minyak', 'Minyak goreng', 0.05, 'liter', 2000),
    ],
    nutrition: nutrition(420, 24, 18, 28, 3),
    imageAlt: 'Tahu telur bumbu kecap di atas piring.',
  }),
  createRecipe({
    id: 'resep-pepes-ikan',
    name: 'Pepes Ikan Nila',
    category: 'Lauk',
    description: 'Ikan nila dibumbui rempah lalu dikukus dalam daun pisang.',
    servings: 4,
    cookingSteps: [
      'Lumuri ikan nila dengan bumbu halus.',
      'Bungkus ikan bersama kemangi dan cabai dalam daun pisang.',
      'Kukus hingga matang, lalu bakar sebentar.',
    ],
    ingredients: [
      ingredient('bahan-ikan-nila', 'Ikan nila', 0.6, 'kg', 21000),
      ingredient('bahan-kemangi', 'Kemangi', 1, 'ikat', 2500),
      ingredient('bahan-cabai', 'Cabai', 0.05, 'kg', 2500),
      ingredient('bahan-daun-pisang', 'Daun pisang', 1, 'paket', 2000),
      ingredient('bahan-bumbu', 'Bumbu rempah', 1, 'paket', 3000),
    ],
    nutrition: nutrition(350, 30, 8, 20, 2),
    imageAlt: 'Pepes ikan nila yang dibungkus daun pisang.',
  }),
];

/* ------------------------------------------------------------------ */
/* Penyusunan rekomendasi + skor (simulasi Recommendation Engine)      */
/* ------------------------------------------------------------------ */

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const buildRecommendation = (recipe: Recipe, rank: number): Recommendation => {
  const nutritionScore = clamp(96 - rank * 5 + recipe.nutrition.protein / 4, 55, 99);
  const budgetScore = clamp(98 - recipe.estimatedCost / 1500, 55, 99);
  const localScore = clamp(94 - rank * 3, 55, 99);
  const seasonScore = clamp(90 - rank * 2, 55, 99);
  const total = nutritionScore * 0.4 + budgetScore * 0.3 + localScore * 0.15 + seasonScore * 0.15;

  return {
    id: toRecommendationId(`rekomendasi-${recipe.id}-${rank}`),
    recipe,
    scores: {
      nutrition: Math.round(nutritionScore),
      budget: Math.round(budgetScore),
      local: Math.round(localScore),
      season: Math.round(seasonScore),
      total: Math.round(total),
    },
    rank,
    explanation: `Menu ini direkomendasikan karena menyumbang sekitar ${recipe.nutrition.protein} g protein dengan estimasi biaya Rp${recipe.estimatedCost.toLocaleString('id-ID')} yang masih dalam batas anggaran keluarga.`,
  };
};

/**
 * Mock API ambil rekomendasi (FR-10).
 * Budget berfungsi sebagai hard constraint (menu di atas budget tidak eligible).
 */
export const fetchRecommendations = async (
  dailyBudget?: number,
): Promise<AsyncState<readonly Recommendation[]>> => {
  await delay(1200);

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return asyncError('Koneksi internet terputus. Periksa jaringan lalu coba lagi.', true);
  }

  const eligible =
    typeof dailyBudget === 'number'
      ? MOCK_RECIPES.filter((recipe) => recipe.estimatedCost <= dailyBudget)
      : MOCK_RECIPES;

  if (eligible.length === 0) {
    return asyncSuccess([]);
  }

  const recommendations = eligible
    .slice(0, 5)
    .map((recipe, index) => buildRecommendation(recipe, index + 1));

  return asyncSuccess(recommendations);
};

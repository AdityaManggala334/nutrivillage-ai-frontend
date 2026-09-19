/**
 * domain.ts
 * Tipe domain NutriVillage AI.
 *
 * Berisi:
 * - Branded Types untuk ID entitas (mencegah tertukar antar-ID yang sama-sama string).
 * - Tipe literal untuk kelompok usia, aktivitas, peran, slot makan, dll.
 * - Interface entitas sesuai kamus data SKPL (users, profiles, family_members,
 *   ingredients, recipes, recommendations, shopping_lists, meal_plans).
 */

declare const __brand: unique symbol;

/** Membungkus tipe primitif dengan "brand" agar tidak bisa tertukar. */
type Brand<TValue, TBrand extends string> = TValue & {
  readonly [__brand]: TBrand;
};

/* ------------------------------------------------------------------ */
/* Branded Types (ID entitas)                                          */
/* ------------------------------------------------------------------ */

export type UserId = Brand<string, 'UserId'>;
export type ProfileId = Brand<string, 'ProfileId'>;
export type FamilyMemberId = Brand<string, 'FamilyMemberId'>;
export type IngredientId = Brand<string, 'IngredientId'>;
export type RecipeId = Brand<string, 'RecipeId'>;
export type RecommendationId = Brand<string, 'RecommendationId'>;
export type ShoppingListId = Brand<string, 'ShoppingListId'>;
export type MealPlanId = Brand<string, 'MealPlanId'>;

/** Constructor aman untuk membuat branded ID dari string biasa. */
export const toUserId = (value: string): UserId => value as UserId;
export const toProfileId = (value: string): ProfileId => value as ProfileId;
export const toFamilyMemberId = (value: string): FamilyMemberId => value as FamilyMemberId;
export const toIngredientId = (value: string): IngredientId => value as IngredientId;
export const toRecipeId = (value: string): RecipeId => value as RecipeId;
export const toRecommendationId = (value: string): RecommendationId => value as RecommendationId;
export const toShoppingListId = (value: string): ShoppingListId => value as ShoppingListId;
export const toMealPlanId = (value: string): MealPlanId => value as MealPlanId;

/* ------------------------------------------------------------------ */
/* Tipe literal domain                                                 */
/* ------------------------------------------------------------------ */

export type UserRole = 'user' | 'admin';

/** Kelompok usia acuan gizi (SKPL: Balita 1-3, Anak 4-12, Dewasa 13-59, Lansia 60+). */
export type AgeGroup = 'balita' | 'anak' | 'dewasa' | 'lansia';

export type ActivityLevel = 'rendah' | 'sedang' | 'tinggi';

export type Gender = 'laki-laki' | 'perempuan';

/** Slot makan pada Meal Planner. */
export type MealSlot = 'sarapan' | 'makan-siang' | 'makan-malam';

export type DayOfWeek = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export type RecommendationGoal = 'hemat' | 'seimbang' | 'tinggi-protein' | 'rendah-lemak';

/* ------------------------------------------------------------------ */
/* Label Bahasa Indonesia untuk UI                                     */
/* ------------------------------------------------------------------ */

export const AGE_GROUP_LABELS: Readonly<Record<AgeGroup, string>> = {
  balita: 'Balita (1-3 th)',
  anak: 'Anak (4-12 th)',
  dewasa: 'Dewasa (13-59 th)',
  lansia: 'Lansia (60+ th)',
};

export const ACTIVITY_LEVEL_LABELS: Readonly<Record<ActivityLevel, string>> = {
  rendah: 'Rendah (jarang olahraga)',
  sedang: 'Sedang (olahraga ringan)',
  tinggi: 'Tinggi (aktif berolahraga)',
};

export const MEAL_SLOT_LABELS: Readonly<Record<MealSlot, string>> = {
  sarapan: 'Sarapan',
  'makan-siang': 'Makan Siang',
  'makan-malam': 'Makan Malam',
};

export const DAY_LABELS: Readonly<Record<DayOfWeek, string>> = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
  minggu: 'Minggu',
};

/** Menentukan kelompok usia dari umur (dipakai saat validasi form). */
export const resolveAgeGroup = (age: number): AgeGroup => {
  if (age <= 3) return 'balita';
  if (age <= 12) return 'anak';
  if (age <= 59) return 'dewasa';
  return 'lansia';
};

/* ------------------------------------------------------------------ */
/* Entitas domain                                                      */
/* ------------------------------------------------------------------ */

export interface User {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  /** ISO-8601 date string. */
  readonly createdAt: string;
}

export interface AuthSession {
  readonly user: User;
  readonly token: string;
  readonly issuedAt: string;
}

export interface FamilyMember {
  readonly id: FamilyMemberId;
  readonly name: string;
  readonly age: number;
  readonly ageGroup: AgeGroup;
  readonly gender: Gender;
  readonly weightKg: number;
  readonly activityLevel: ActivityLevel;
  /** Bahan/kelompok bahan yang harus dihindari (alergi/pantangan). */
  readonly allergies: readonly string[];
}

export interface FamilyProfile {
  readonly userId: UserId;
  readonly dailyBudget: number;
  readonly region: string;
  readonly members: readonly FamilyMember[];
  readonly preferences: readonly string[];
  readonly avoidedIngredients: readonly string[];
  readonly onboarded: boolean;
  /** ISO-8601 date string. */
  readonly updatedAt: string;
}

export interface NutritionInfo {
  readonly calories: number;
  readonly protein: number;
  readonly carbohydrates: number;
  readonly fat: number;
  readonly fiber: number;
}

export interface Ingredient {
  readonly id: IngredientId;
  readonly name: string;
  readonly category: string;
  readonly unit: string;
  readonly description: string;
  readonly isLocal: boolean;
  readonly isInSeason: boolean;
}

export interface RecipeIngredient {
  readonly ingredientId: IngredientId;
  readonly name: string;
  readonly quantity: number;
  readonly unit: string;
  readonly estimatedPrice: number;
}

export interface Recipe {
  readonly id: RecipeId;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly servings: number;
  readonly cookingSteps: readonly string[];
  readonly ingredients: readonly RecipeIngredient[];
  readonly nutrition: NutritionInfo;
  readonly estimatedCost: number;
  readonly imageAlt: string;
}

/** Bobot penilaian SKPL: nutrisi 40, budget 30, lokal 15, musim 15. */
export interface RecommendationScores {
  readonly nutrition: number;
  readonly budget: number;
  readonly local: number;
  readonly season: number;
  readonly total: number;
}

export interface Recommendation {
  readonly id: RecommendationId;
  readonly recipe: Recipe;
  readonly scores: RecommendationScores;
  readonly rank: number;
  /** Penjelasan naratif (simulasi LLM), bukan penentu rekomendasi. */
  readonly explanation: string;
}

export interface ShoppingItem {
  readonly ingredientId: IngredientId;
  readonly name: string;
  readonly quantity: number;
  readonly unit: string;
  readonly estimatedPrice: number;
  readonly checked: boolean;
}

export interface ShoppingList {
  readonly id: ShoppingListId;
  readonly userId: UserId;
  readonly title: string;
  readonly items: readonly ShoppingItem[];
  readonly note: string;
  readonly totalEstimatedCost: number;
}

export interface MealPlanEntry {
  readonly id: MealPlanId;
  readonly userId: UserId;
  readonly day: DayOfWeek;
  readonly slot: MealSlot;
  readonly recipe: Recipe;
}

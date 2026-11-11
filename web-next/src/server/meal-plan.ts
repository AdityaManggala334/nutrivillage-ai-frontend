import "server-only";

import type { ExploreFormData } from "@/schemas/explore";
import { MealPlanSchema, type MealPlan } from "@/schemas/meal-plan";
import {
  backendFamilyRecommendation,
  type BackendFamilyMemberInput,
  type BackendMealPlan,
} from "@/server/backend-api";

/**
 * Jembatan form Explore -> mesin rekomendasi FastAPI.
 * Explore mengirim data per anggota (umur, gender, BB, TB) dari onboarding atau
 * input manual, jadi tidak ada lagi profil wakil per kelompok umur.
 */

const ALLERGY_MAP: Readonly<Record<string, string>> = {
  seafood: "seafood",
  kacang: "kacang",
  telur: "telur",
  santan: "santan",
  gluten: "gluten",
  susu: "susu",
  kedelai: "kedelai",
};

const PREFERENCE_MAP: Readonly<Record<string, string>> = {
  sayur: "bayam",
  ikan: "ikan",
  ayam: "ayam",
  "tahu/tempe": "tempe",
  santan: "santan",
  pedas: "cabai",
};

function toMealPlan(plan: BackendMealPlan): MealPlan {
  const snacks = plan.selingan.map((item) => ({
    label: item.waktu,
    recipeId: item.recipe_id,
    name: item.nama_menu,
    slot: item.slot,
    cost: item.biaya,
    calories: item.kalori,
    protein: item.protein,
  }));
  return MealPlanSchema.parse({
    status: plan.status,
    reason: plan.alasan ?? null,
    suggestion: plan.saran ?? null,
    // B5 (infeasible yang informatif): saran, slot yang ditinggalkan, dan
    // minimum yang dibutuhkan ikut ditampilkan ke pengguna.
    warnings: plan.peringatan ?? [],
    minimumDibutuhkan: plan.minimum_dibutuhkan ?? null,
    slotDitinggalkan: plan.slot_ditinggalkan ?? [],
    budgetPerPortion: plan.anggaran_per_porsi,
    dailyBudget: plan.anggaran_harian,
    totalDailyCost: plan.total_biaya_harian,
    withinBudget: plan.patuh_anggaran,
    requiredSlots: plan.slot_wajib,
    target: {
      dailyEnergy: plan.target.energi_harian,
      dailyProtein: plan.target.protein_harian,
      energyPerPortion: plan.target.energi_per_porsi,
      proteinPerPortion: plan.target.protein_per_porsi,
      members: plan.target.anggota.map((member) => ({
        name: member.nama,
        age: member.umur,
        gender: member.gender,
        weightKg: member.bb,
        heightCm: member.tb,
        bmi: member.bmi,
        nutritionStatus: member.status_gizi,
        energy: member.energi,
        energyAkg: member.energi_akg,
        protein: member.protein,
        basis: member.dasar,
        zHeightForAge: member.z_tb_u ?? null,
        zWeightForAge: member.z_bb_u ?? null,
        zBmiForAge: member.z_imt_u ?? null,
      })),
    },
    meals: plan.waktu_makan.map((meal) => ({
      label: meal.waktu,
      budgetPerPortion: meal.anggaran_per_porsi,
      items: meal.paket.map((item) => ({
        slot: item.slot,
        recipeId: item.recipe_id,
        code: item.kode,
        name: item.nama_menu,
        closing: item.menutup,
        cost: item.biaya,
        calories: item.kalori,
        protein: item.protein,
        calciumMg: item.kalsium_mg,
        ironMg: item.besi_mg,
        vitaminAMcg: item.vitamin_a_mcg,
        vitaminCMcg: item.vitamin_c_mg,
        sugarG: item.gula_g,
        sodiumMg: item.natrium_mg,
        allergens: item.alergen,
        scores: {
          nutrition: item.score_nutrition,
          budget: item.score_budget,
          seasonal: item.score_seasonal,
          local: item.score_local,
          total: item.score_total,
        },
      })),
      summary: {
        components: meal.ringkas.jumlah_komponen,
        cost: meal.ringkas.total_biaya,
        energyPct: meal.ringkas.pct_kcal,
        proteinPct: meal.ringkas.pct_protein,
        sugarG: meal.ringkas.gula_g,
        sodiumMg: meal.ringkas.natrium_mg,
        withinBudget: meal.ringkas.patuh_anggaran,
        compliant: meal.ringkas.patuh_ggl,
      },
    })),
    snacks,
    adjustments: plan.penyesuaian,
    shopping: [],
  });
}

/** Susun rencana paket makan keluarga. `token` = JWT sesi; endpoint mesin butuh login (FR-01 revisi). */
export async function buildMealPlan(data: ExploreFormData, token?: string): Promise<MealPlan> {
  const allergies = data.allergies
    .map((item) => ALLERGY_MAP[item.trim().toLowerCase()] ?? item.trim().toLowerCase())
    .filter(Boolean);
  const members: BackendFamilyMemberInput[] = data.members.map((member) => ({
    name: member.name,
    age: member.age,
    gender: member.gender,
    weight_kg: member.weightKg,
    height_cm: member.heightCm,
    activity_level: member.activityLevel,
    allergies: [
      ...new Set([
        ...member.allergies.map((item) => ALLERGY_MAP[item.trim().toLowerCase()] ?? item.trim().toLowerCase()),
        ...allergies,
      ]),
    ].filter(Boolean),
  }));
  if (members.length === 0) {
    throw new Error("Minimal satu anggota keluarga harus diisi.");
  }
  const preferences = data.preferences
    .map((item) => PREFERENCE_MAP[item.trim().toLowerCase()] ?? item.trim().toLowerCase())
    .filter(Boolean);

  const result = await backendFamilyRecommendation(
    {
      daily_budget: data.dailyBudget,
      region: data.location,
      meals_per_day: data.mealSlots.length,
      meal_slots: data.mealSlots,
      include_susu: data.includeSusu && !allergies.includes("susu"),
      goal: data.goal,
      preferences,
      avoided_ingredients: [],
      members,
    },
    token,
  );
  if (!result.keluarga) {
    throw new Error("Mesin rekomendasi tidak mengembalikan rencana keluarga.");
  }
  const plan = toMealPlan(result.keluarga);
  return {
    ...plan,
    shopping: (result.belanja?.baris ?? []).map((row) => ({
      name: row.nama_bahan,
      grams: row.gram,
      cost: row.biaya,
    })),
  };
}

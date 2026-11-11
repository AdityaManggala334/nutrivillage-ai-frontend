import "server-only";

import { SppgPlanSchema, type SppgPlan } from "@/schemas/sppg-plan";
import {
  backendSppgRecommendation,
  type BackendMealItem,
  type BackendSppgPlan,
} from "@/server/backend-api";

export interface SppgPlanInput {
  readonly name: string;
  readonly region: string;
  readonly allergies: readonly string[];
  readonly groups: ReadonlyArray<{
    readonly level: string;
    readonly studentCount: number;
    readonly budgetPerPortion: number | null;
  }>;
}

const ALLERGY_MAP: Readonly<Record<string, string>> = {
  seafood: "seafood", kacang: "kacang", telur: "telur", santan: "santan",
  gluten: "gluten", susu: "susu", kedelai: "kedelai",
};

function toItem(item: BackendMealItem) {
  return {
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
  };
}

function toPlan(plan: BackendSppgPlan): SppgPlan {
  return SppgPlanSchema.parse({
    status: plan.status,
    school: plan.sekolah,
    region: plan.wilayah,
    studentCount: plan.total_siswa,
    totalCost: plan.total_biaya,
    allergies: plan.alergi,
    warnings: plan.peringatan,
    reason: plan.alasan ?? null,
    suggestion: plan.saran ?? null,
    groups: plan.kelompok.map((group) => ({
      level: group.level,
      label: group.label,
      students: group.siswa,
      budgetPerPortion: group.anggaran_per_porsi,
      targetKcal: group.target_kcal,
      targetProtein: group.target_protein,
      items: group.paket.map(toItem),
      costPerPortion: group.ringkas?.total_biaya ?? 0,
      energyPct: group.ringkas?.pct_kcal ?? 0,
      proteinPct: group.ringkas?.pct_protein ?? 0,
      withinBudget: group.ringkas?.patuh_anggaran ?? false,
      batchCost: group.biaya_batch,
      batchBudget: group.anggaran_batch,
    })),
  });
}

export async function buildSppgPlan(input: SppgPlanInput, token?: string): Promise<SppgPlan> {
  const allergies = input.allergies.map(
    (item) => ALLERGY_MAP[item.trim().toLowerCase()] ?? item.trim().toLowerCase(),
  );
  const result = await backendSppgRecommendation(
    {
      name: input.name,
      region: input.region,
      allergies,
      groups: input.groups.map((group) => ({
        level: group.level,
        student_count: group.studentCount,
        budget_per_portion: group.budgetPerPortion,
      })),
    },
    token,
  );
  if (!result.sppg) throw new Error("Mesin tidak mengembalikan rencana SPPG.");
  return toPlan(result.sppg);
}

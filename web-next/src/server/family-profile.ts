import "server-only";

import {
  FamilyProfileSchema,
  resolveAgeGroup,
  type FamilyProfile,
  type FamilyProfileFormOutput,
} from "@/schemas/profile";
import {
  backendGetProfile,
  backendSaveProfile,
  type BackendFamilyProfile,
  type BackendFamilyProfileInput,
} from "@/server/backend-api";

/** Pemetaan profil keluarga frontend <-> backend FastAPI (FR-05). */

export function toFamilyProfile(row: BackendFamilyProfile): FamilyProfile {
  return FamilyProfileSchema.parse({
    userId: String(row.user_id),
    dailyBudget: row.daily_budget,
    region: row.region,
    preferences: row.preferences,
    avoidedIngredients: row.avoided_ingredients,
    mealsPerDay: row.meals_per_day,
    includeSusu: row.include_susu,
    onboarded: row.onboarded,
    updatedAt: row.updated_at,
    members: row.members.map((member) => ({
      id: String(member.id),
      name: member.name ?? "Anggota keluarga",
      age: member.age,
      ageGroup: member.age_group ?? resolveAgeGroup(member.age),
      gender: member.gender === "perempuan" ? "perempuan" : "laki-laki",
      weightKg: member.weight_kg,
      heightCm: member.height_cm,
      activityLevel: member.activity_level,
      allergies: member.allergies,
    })),
  });
}

export function toBackendProfile(
  form: FamilyProfileFormOutput,
): BackendFamilyProfileInput {
  return {
    daily_budget: form.dailyBudget,
    region: form.region,
    preferences: form.preferences,
    avoided_ingredients: form.avoidedIngredients,
    meals_per_day: form.mealsPerDay,
    include_susu: form.includeSusu,
    onboarded: true,
    members: form.members.map((member) => ({
      name: member.name,
      age: member.age,
      age_group: member.ageGroup,
      gender: member.gender,
      weight_kg: member.weightKg,
      height_cm: member.heightCm,
      activity_level: member.activityLevel,
      allergies: member.allergies,
    })),
  };
}

export async function loadBackendProfile(token: string): Promise<FamilyProfile | null> {
  const row = await backendGetProfile(token);
  return row ? toFamilyProfile(row) : null;
}

export async function saveBackendProfile(
  token: string,
  form: FamilyProfileFormOutput,
): Promise<FamilyProfile> {
  return toFamilyProfile(await backendSaveProfile(token, toBackendProfile(form)));
}

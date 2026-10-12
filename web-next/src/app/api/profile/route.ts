import { NextResponse } from "next/server";
import { familyProfileFormSchema } from "@/schemas/profile";
import { getSessionToken, getUserByToken } from "@/server/auth";
import {
  backendGetProfile,
  backendSaveProfile,
  type BackendFamilyProfile,
} from "@/server/backend-api";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** Memetakan profil backend (snake_case) ke bentuk model frontend (camelCase). */
function toClientProfile(payload: BackendFamilyProfile | null) {
  if (!payload) return null;
  return {
    userId: String(payload.user_id),
    dailyBudget: payload.daily_budget,
    region: payload.region,
    members: payload.members.map((member) => ({
      id: String(member.id),
      name: member.name ?? "Anggota",
      age: member.age,
      ageGroup: member.age_group,
      gender: member.gender,
      weightKg: member.weight_kg,
      activityLevel: member.activity_level,
      allergies: member.allergies,
    })),
    preferences: payload.preferences,
    avoidedIngredients: payload.avoided_ingredients,
    onboarded: payload.onboarded,
    updatedAt: payload.updated_at,
  };
}

/** GET /api/profile — profil keluarga milik sesi aktif (null bila belum ada). */
export async function GET(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user) return NextResponse.json(null);
  try {
    return NextResponse.json(toClientProfile(await backendGetProfile(token as string)));
  } catch {
    // Guest / backend belum tersambung → dianggap belum ada profil.
    return NextResponse.json(null);
  }
}

/** PUT /api/profile — FR-02: simpan/ubah data keluarga ke database. */
export async function PUT(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user) {
    return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonError("Body JSON tidak valid", 400);
  }

  const parsed = familyProfileFormSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError("Data keluarga belum valid. Periksa kembali isian Anda.", 422);
  }
  const data = parsed.data;

  try {
    const saved = await backendSaveProfile(token as string, {
      daily_budget: data.dailyBudget,
      region: data.region,
      preferences: data.preferences,
      avoided_ingredients: data.avoidedIngredients,
      onboarded: true,
      members: data.members.map((member) => ({
        name: member.name,
        age: member.age,
        age_group: member.ageGroup,
        gender: member.gender,
        weight_kg: member.weightKg,
        activity_level: member.activityLevel,
        allergies: member.allergies,
      })),
    });
    return NextResponse.json(toClientProfile(saved));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

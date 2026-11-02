import { NextResponse } from "next/server";
import { familyProfileFormSchema } from "@/schemas/profile";
import { getFamilyProfile, getSessionToken, getUserByToken, saveFamilyProfile } from "@/server/auth";
import { loadBackendProfile, saveBackendProfile } from "@/server/family-profile";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/profile — profil keluarga sesi aktif (tamu tetap in-memory). */
export async function GET(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) return NextResponse.json(null);
  if (user.role === "guest") return NextResponse.json(getFamilyProfile(user.id));
  try {
    return NextResponse.json(await loadBackendProfile(token));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** PUT /api/profile — FR-05: simpan/ubah data keluarga (validasi Zod di server). */
export async function PUT(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) {
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
    const issue = parsed.error.issues[0];
    return jsonError(issue?.message ?? "Data keluarga belum valid", 422);
  }

  try {
    if (user.role === "guest") {
      return NextResponse.json(await saveFamilyProfile(user.id, raw));
    }
    return NextResponse.json(await saveBackendProfile(token, parsed.data));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

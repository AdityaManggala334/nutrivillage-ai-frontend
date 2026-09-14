import { NextResponse } from "next/server";
import {
  getFamilyProfile,
  getSessionToken,
  getUserByToken,
  saveFamilyProfile,
} from "@/server/auth";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/profile — ambil profil keluarga milik sesi aktif (null bila belum ada). */
export async function GET(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return NextResponse.json(null);
  return NextResponse.json(getFamilyProfile(user.id));
}

/** PUT /api/profile — FR-05: simpan/ubah data keluarga (validasi Zod di server). */
export async function PUT(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) {
    return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonError("Body JSON tidak valid", 400);
  }

  try {
    const profile = await saveFamilyProfile(user.id, raw);
    return NextResponse.json(profile);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Data keluarga belum valid",
      422,
    );
  }
}

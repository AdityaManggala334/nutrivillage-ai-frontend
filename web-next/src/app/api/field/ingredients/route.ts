import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendFieldIngredients } from "@/server/backend-api";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/field/ingredients — daftar bahan untuk pemilih input lapangan. */
export async function GET(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_lapangan" && user.role !== "admin") {
    return jsonError("Hanya Petugas Lapangan yang dapat membuka daftar ini.", 403);
  }

  try {
    return NextResponse.json(await backendFieldIngredients(token));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

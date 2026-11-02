import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { listNutritionRows } from "@/server/admin-nutrition";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/admin/nutrition — bahan + gizi + harga untuk dasbor admin. */
export async function GET(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") {
    return jsonError("Hanya admin yang dapat mengubah data gizi.", 403);
  }
  try {
    return NextResponse.json(await listNutritionRows());
  } catch (error) {
    return backendErrorResponse(error);
  }
}

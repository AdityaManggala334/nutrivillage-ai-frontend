import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError } from "@/server/http";
import { listBudgetPoliciesForSession } from "@/server/school-api";

export const dynamic = "force-dynamic";

/** GET /api/budget-policies — kebijakan batas anggaran per porsi (read-only di UI). */
export async function GET(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg" && user.role !== "admin") {
    return jsonError("Akses ditolak untuk peran ini.", 403);
  }

  try {
    return NextResponse.json(await listBudgetPoliciesForSession());
  } catch (error) {
    return backendErrorResponse(error);
  }
}

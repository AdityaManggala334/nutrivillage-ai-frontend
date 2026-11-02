import { NextResponse } from "next/server";
import { listRegionOptions } from "@/server/admin-master";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/admin/regions — pilihan wilayah untuk formulir komoditas lokal. */
export async function GET(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin.", 403);
  try {
    return NextResponse.json(await listRegionOptions());
  } catch (error) {
    return backendErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendFetch } from "@/server/backend-api";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";
import { z } from "zod";
export const dynamic = "force-dynamic";
const BodySchema = z.object({
  n_waktu_makan: z.number().int().min(1).max(5),
  energi_pct: z.number().min(0).max(500).optional(),
  protein_pct: z.number().min(0).max(500).optional(),
  total_biaya: z.number().min(0).optional(),
  anggaran: z.number().min(0).optional(),
  daftar_menu: z.array(z.string().max(160)).max(8).optional(),
});
/** POST /api/ai/explain-plan - narasi satu paket makan penuh (FR-03). */
export async function POST(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) {
    return jsonError("Masuk untuk membuka penjelasan paket makan.", 401);
  }
  const parsed = await parseJsonBody(request, BodySchema);
  if (!parsed.ok) return parsed.response;
  try {
    const data = await backendFetch<Record<string, unknown>>(
      "/ai/explain-plan",
      { method: "POST", body: JSON.stringify(parsed.data) },
      token,
    );
    return NextResponse.json(data);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

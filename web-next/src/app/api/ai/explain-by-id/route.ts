import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendFetch } from "@/server/backend-api";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  recipe_id: z.number().int().positive(),
  audience: z.string().max(80).optional(),
  budget: z.number().min(0).optional(),
});

/**
 * POST /api/ai/explain-by-id — C3 (FR-11): proxy penjelasan menu.
 * Backend mengambil konteks dari database & membaca cache, jadi proxy ini
 * hanya meneruskan `recipe_id`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) {
    return jsonError("Masuk untuk membuka penjelasan menu.", 401);
  }

  const parsed = await parseJsonBody(request, BodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const data = await backendFetch<Record<string, unknown>>(
      "/ai/explain/by-id",
      { method: "POST", body: JSON.stringify(parsed.data) },
      token,
    );
    return NextResponse.json(data);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

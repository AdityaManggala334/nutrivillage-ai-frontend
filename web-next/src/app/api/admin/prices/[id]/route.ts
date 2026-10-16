import { NextResponse } from "next/server";
import { z } from "zod";
import { PriceStatusSchema } from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendVerifyPrice } from "@/server/backend-api";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

const BodySchema = z.object({ status: PriceStatusSchema, note: z.string().max(255).nullish() });

function requireAdmin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") {
    return { error: jsonError("Hanya admin yang dapat memverifikasi harga.", 403) };
  }
  return { user };
}

/**
 * PATCH /api/admin/prices/[id] — FR-23 verifikasi harga oleh admin.
 * Diteruskan ke backend FastAPI (`POST /admin/prices/{id}/verify`) sehingga
 * perubahan tersimpan di tabel `prices` + `price_verifications`.
 */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;

  const { id } = await context.params;
  const parsed = await parseJsonBody(request, BodySchema);
  if (!parsed.ok) return parsed.response;

  const priceId = Number(id);
  if (!Number.isInteger(priceId) || priceId <= 0) {
    return jsonError("ID harga tidak valid.", 400);
  }

  try {
    const token = getSessionToken(request) as string;
    const price = await backendVerifyPrice(token, priceId, parsed.data.status, parsed.data.note ?? undefined);
    return NextResponse.json(price);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

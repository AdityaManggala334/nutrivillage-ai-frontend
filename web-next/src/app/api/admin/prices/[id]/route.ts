import { NextResponse } from "next/server";
import { z } from "zod";
import { PriceStatusSchema } from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { verifyPrice } from "@/server/admin-data";
import { jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

const BodySchema = z.object({ status: PriceStatusSchema });

function requireAdmin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") {
    return { error: jsonError("Hanya admin yang dapat memverifikasi harga.", 403) };
  }
  return { user };
}

/** PATCH /api/admin/prices/[id] — FR-23 verifikasi harga oleh admin. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;

  const { id } = await context.params;
  const parsed = await parseJsonBody(request, BodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const price = await verifyPrice(id, parsed.data.status);
    return NextResponse.json(price);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal memverifikasi harga", 404);
  }
}

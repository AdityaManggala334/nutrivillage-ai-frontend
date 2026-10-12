import { NextResponse } from "next/server";
import { z } from "zod";
import { FoodSafetyVerificationSchema } from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { verifyFoodSafety } from "@/server/admin-data";
import { jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

const BodySchema = z.object({ verification: FoodSafetyVerificationSchema });

function requireAdmin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") {
    return {
      error: jsonError("Hanya admin yang dapat memverifikasi informasi keamanan pangan.", 403),
    };
  }
  return { user };
}

/** PATCH /api/admin/food-safety/[id] — verifikasi informasi keamanan pangan. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;

  const { id } = await context.params;
  const parsed = await parseJsonBody(request, BodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const item = await verifyFoodSafety(id, parsed.data.verification);
    return NextResponse.json(item);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Gagal memverifikasi informasi",
      404,
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { FoodSafetyVerificationSchema } from "@/schemas/admin";
import { verifyFoodSafety } from "@/server/admin-data";
import { jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

const BodySchema = z.object({ verification: FoodSafetyVerificationSchema });

/** PATCH /api/admin/food-safety/[id] — verifikasi informasi keamanan pangan. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
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

import { NextResponse } from "next/server";
import {
  FoodSafetyInfoSchema,
  FoodSafetyInputSchema,
  FoodSafetyVerificationSchema,
} from "@/schemas/admin";
import { deleteFoodSafety, updateFoodSafety, verifyFoodSafety } from "@/server/admin-master";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

const BodySchema = z.union([
  FoodSafetyInputSchema,
  z.object({ verification: FoodSafetyVerificationSchema }),
]);

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat mengubah.", 403);

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) return jsonError("ID tidak valid.", 400);

  const parsed = await parseJsonBody(request, BodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const item =
      "verification" in parsed.data && Object.keys(parsed.data).length === 1
        ? await verifyFoodSafety(id, parsed.data.verification)
        : await updateFoodSafety(id, parsed.data as z.infer<typeof FoodSafetyInputSchema>);
    return NextResponse.json(FoodSafetyInfoSchema.parse(item));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat menghapus.", 403);
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) return jsonError("ID tidak valid.", 400);
  try {
    await deleteFoodSafety(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

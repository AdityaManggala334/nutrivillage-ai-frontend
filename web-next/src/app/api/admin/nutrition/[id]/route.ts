import { NextResponse } from "next/server";
import { NutritionRowUpdateSchema, NutritionRowSchema } from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { updateNutritionRow } from "@/server/admin-nutrition";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

/** PATCH /api/admin/nutrition/[id] — simpan satu baris (gizi + harga + alergen). */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") {
    return jsonError("Hanya admin yang dapat mengubah data gizi.", 403);
  }
  const { id } = await context.params;
  const ingredientId = Number(id);
  if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
    return jsonError("ID bahan tidak valid.", 400);
  }
  const parsed = await parseJsonBody(request, NutritionRowUpdateSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const row = await updateNutritionRow(ingredientId, parsed.data);
    return NextResponse.json(NutritionRowSchema.parse(row));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

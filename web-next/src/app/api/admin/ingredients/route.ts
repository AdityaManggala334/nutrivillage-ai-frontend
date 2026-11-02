import { NextResponse } from "next/server";
import { AdminIngredientCreateSchema } from "@/schemas/admin";
import { createIngredient, listAdminIngredients } from "@/server/admin-master";
import { listPriceIngredients } from "@/server/admin-prices";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

function admin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") return { error: jsonError("Hanya admin.", 403) };
  return {};
}

/** GET /api/admin/ingredients — daftar bahan lengkap atau ringkas (?ringkas=1). */
export async function GET(request: Request): Promise<NextResponse> {
  const { error } = admin(request);
  if (error) return error;
  try {
    const ringkas = new URL(request.url).searchParams.get("ringkas") === "1";
    return NextResponse.json(ringkas ? await listPriceIngredients() : await listAdminIngredients());
  } catch (err) {
    return backendErrorResponse(err);
  }
}

/** POST /api/admin/ingredients — tambah bahan. */
export async function POST(request: Request): Promise<NextResponse> {
  const { error } = admin(request);
  if (error) return error;
  const parsed = await parseJsonBody(request, AdminIngredientCreateSchema);
  if (!parsed.ok) return parsed.response;
  try {
    await createIngredient(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return backendErrorResponse(err);
  }
}

import { NextResponse } from "next/server";
import { AdminRecipeUpdateSchema } from "@/schemas/admin";
import { deleteRecipe, updateRecipe } from "@/server/admin-master";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";
type Ctx = { readonly params: Promise<{ id: string }> };

function admin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") return { error: jsonError("Hanya admin.", 403) };
  return {};
}

export async function PATCH(request: Request, context: Ctx): Promise<NextResponse> {
  const { error } = admin(request);
  if (error) return error;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) return jsonError("ID tidak valid.", 400);
  const parsed = await parseJsonBody(request, AdminRecipeUpdateSchema);
  if (!parsed.ok) return parsed.response;
  try {
    await updateRecipe(id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return backendErrorResponse(err);
  }
}

export async function DELETE(request: Request, context: Ctx): Promise<NextResponse> {
  const { error } = admin(request);
  if (error) return error;
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) return jsonError("ID tidak valid.", 400);
  try {
    await deleteRecipe(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return backendErrorResponse(err);
  }
}

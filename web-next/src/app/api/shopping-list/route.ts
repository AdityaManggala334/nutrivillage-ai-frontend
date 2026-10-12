import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/server/auth";
import {
  deleteShoppingItem,
  generateShoppingList,
  generateShoppingListFromRecipe,
  getShoppingList,
  toggleShoppingItem,
  updateShoppingNote,
} from "@/server/data";
import { jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

const GenerateBodySchema = z.union([
  z.object({ weekId: z.string().min(1) }),
  z.object({ recipeId: z.string().min(1) }),
]);

const PatchBodySchema = z.union([
  z.object({ itemId: z.string().min(1), checked: z.boolean() }),
  z.object({ note: z.string() }),
]);

/** GET /api/shopping-list — daftar belanja tersimpan (FR-16, per pengguna). */
export async function GET(request: Request): Promise<NextResponse> {
  const list = await getShoppingList(getUserIdFromRequest(request));
  return NextResponse.json(list);
}

/** POST /api/shopping-list — FR-29 (dari jadwal) & FR-15 (dari satu resep). */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, GenerateBodySchema);
  if (!parsed.ok) return parsed.response;

  const userId = getUserIdFromRequest(request);
  try {
    const list =
      "weekId" in parsed.data
        ? await generateShoppingList(userId, parsed.data.weekId)
        : await generateShoppingListFromRecipe(userId, parsed.data.recipeId);
    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal membuat daftar belanja", 400);
  }
}

/** PATCH /api/shopping-list — FR-16 (centang bahan) & FR-17 (catatan). */
export async function PATCH(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, PatchBodySchema);
  if (!parsed.ok) return parsed.response;

  const userId = getUserIdFromRequest(request);
  const list =
    "note" in parsed.data
      ? await updateShoppingNote(userId, parsed.data.note)
      : await toggleShoppingItem(userId, parsed.data.itemId);
  return NextResponse.json(list);
}

/** DELETE /api/shopping-list?itemId=... — FR-16 (hapus bahan). */
export async function DELETE(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return jsonError("Parameter itemId wajib diisi", 400);
  const list = await deleteShoppingItem(getUserIdFromRequest(request), itemId);
  return NextResponse.json(list);
}

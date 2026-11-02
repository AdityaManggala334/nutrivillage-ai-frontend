import { NextResponse } from "next/server";
import { z } from "zod";
import { BackendError } from "@/server/backend-api";
import {
  WEEK_LABEL,
  deleteShoppingItemDb,
  emptyShoppingList,
  generateShoppingListDb,
  getShoppingListFromDb,
  patchShoppingListDb,
} from "@/server/planning";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

const GenerateBodySchema = z.union([
  z.object({ weekId: z.string().min(1) }),
  z.object({ recipeId: z.string().min(1) }),
]);

const PatchBodySchema = z.union([
  z.object({ itemId: z.string().min(1), checked: z.boolean() }),
  z.object({ note: z.string() }),
]);

/** GET /api/shopping-list — FR-16, dari tabel `shopping_lists` + items. */
export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await getShoppingListFromDb());
  } catch (error) {
    // Tamu / sesi tanpa akun → daftar kosong (tanpa error 500).
    if (error instanceof BackendError && error.status === 401) {
      return NextResponse.json(emptyShoppingList(`Daftar Belanja ${WEEK_LABEL}`));
    }
    return backendErrorResponse(error);
  }
}

/** POST /api/shopping-list — FR-29 (dari jadwal) & FR-15 (dari satu resep). */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, GenerateBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const list = await generateShoppingListDb(parsed.data);
    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** PATCH /api/shopping-list — FR-16 (centang bahan) & FR-17 (catatan). */
export async function PATCH(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, PatchBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const list = await patchShoppingListDb(parsed.data);
    return NextResponse.json(list);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** DELETE /api/shopping-list?itemId=... — FR-16 (hapus bahan). */
export async function DELETE(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return jsonError("Parameter itemId wajib diisi", 400);

  try {
    return NextResponse.json(await deleteShoppingItemDb(itemId));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

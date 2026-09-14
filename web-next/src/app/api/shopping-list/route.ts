import { NextResponse } from "next/server";
import { z } from "zod";
import { generateShoppingList, generateShoppingListFromRecipe } from "@/server/data";
import { jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

const ShoppingListBodySchema = z.union([
  z.object({ weekId: z.string().min(1) }),
  z.object({ recipeId: z.string().min(1) }),
]);

/**
 * POST /api/shopping-list — FR-29 (dari jadwal) & FR-15 (dari satu resep).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, ShoppingListBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const list =
      "weekId" in parsed.data
        ? await generateShoppingList(parsed.data.weekId)
        : await generateShoppingListFromRecipe(parsed.data.recipeId);
    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal membuat daftar belanja", 400);
  }
}

import { NextResponse } from "next/server";
import { getRecipeById } from "@/server/data";
import { jsonError } from "@/server/http";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

/** GET /api/recipes/[id] — detail satu resep. */
export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  const recipe = await getRecipeById(id);
  if (!recipe) {
    return jsonError("Resep tidak ditemukan", 404);
  }
  return NextResponse.json(recipe);
}

import { NextResponse } from "next/server";
import { getHistoryByRecipe } from "@/server/history";
import { backendErrorResponse } from "@/server/http";
export const dynamic = "force-dynamic";
interface RouteContext {
  readonly params: Promise<{ recipeId: string }>;
}
/** GET /api/history/by-recipe/[recipeId] - status riwayat & favorit satu resep. */
export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { recipeId } = await context.params;
  try {
    const entry = await getHistoryByRecipe(recipeId);
    return NextResponse.json(entry);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

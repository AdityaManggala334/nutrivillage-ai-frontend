import { NextResponse } from "next/server";
import { listRecipes } from "@/server/data";

export const dynamic = "force-dynamic";

/** GET /api/recipes — katalog resep pangan lokal (dari database). */
export async function GET(): Promise<NextResponse> {
  const recipes = await listRecipes();
  return NextResponse.json(recipes);
}

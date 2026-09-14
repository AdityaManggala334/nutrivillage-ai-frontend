import { NextResponse } from "next/server";
import { listRecipes } from "@/server/data";

/** GET /api/recipes — katalog resep pangan lokal. */
export async function GET(): Promise<NextResponse> {
  const recipes = await listRecipes();
  return NextResponse.json(recipes);
}

import { NextResponse } from "next/server";
import { deleteHistoryEntry, toggleHistoryFavorite } from "@/server/data";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

/** DELETE /api/history/[id] — hapus entri riwayat. */
export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  const result = await deleteHistoryEntry(id);
  return NextResponse.json(result);
}

/** PATCH /api/history/[id] — toggle favorit. */
export async function PATCH(_request: Request, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    const entry = await toggleHistoryFavorite(id);
    return NextResponse.json(entry);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Riwayat tidak ditemukan", 404);
  }
}

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/server/auth";
import { deleteHistoryEntry, toggleHistoryFavorite } from "@/server/data";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

/** DELETE /api/history/[id] — hapus entri riwayat milik pengguna. */
export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  const result = await deleteHistoryEntry(getUserIdFromRequest(request), id);
  return NextResponse.json(result);
}

/** PATCH /api/history/[id] — toggle favorit. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    const entry = await toggleHistoryFavorite(getUserIdFromRequest(request), id);
    return NextResponse.json(entry);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Riwayat tidak ditemukan", 404);
  }
}

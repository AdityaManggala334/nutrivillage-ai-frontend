import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteHistoryFromDb, setHistoryFavorite } from "@/server/history";
import { backendErrorResponse, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

const FavoriteBodySchema = z.object({ favorite: z.boolean() });

/** DELETE /api/history/[id] — hapus entri riwayat milik pengguna. */
export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    const result = await deleteHistoryFromDb(id);
    return NextResponse.json(result);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** PATCH /api/history/[id] — set status favorit. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params;
  const parsed = await parseJsonBody(request, FavoriteBodySchema);
  if (!parsed.ok) return parsed.response;
  try {
    const entry = await setHistoryFavorite(id, parsed.data.favorite);
    return NextResponse.json(entry);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

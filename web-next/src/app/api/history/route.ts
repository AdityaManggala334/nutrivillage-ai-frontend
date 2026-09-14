import { NextResponse } from "next/server";
import { z } from "zod";
import { HistoryFilterSchema } from "@/schemas/domain";
import { listHistory, saveHistoryEntry } from "@/server/data";
import { jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

const SaveHistoryBodySchema = z.object({
  recipeId: z.string().min(1),
  kind: z.enum(["recommendation", "meal-plan"]),
  note: z.string(),
});

/** GET /api/history?filter=all|favorite|month — FR-13. */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filter = HistoryFilterSchema.catch("all").parse(searchParams.get("filter"));
  const entries = await listHistory(filter);
  return NextResponse.json(entries);
}

/** POST /api/history — FR-12 (simpan rekomendasi ke riwayat). */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, SaveHistoryBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const entry = await saveHistoryEntry(parsed.data);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Gagal menyimpan riwayat",
      400,
    );
  }
}

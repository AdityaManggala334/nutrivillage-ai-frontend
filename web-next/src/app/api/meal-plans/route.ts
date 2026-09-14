import { NextResponse } from "next/server";
import { z } from "zod";
import { DayOfWeekSchema, MealSlotSchema } from "@/schemas/domain";
import {
  assignMealPlanEntry,
  getMealPlan,
  removeMealPlanEntry,
} from "@/server/data";
import { jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

const DEFAULT_WEEK = "pekan-ini";

const AssignMealBodySchema = z.object({
  weekId: z.string().min(1),
  day: DayOfWeekSchema,
  slot: MealSlotSchema,
  recipeId: z.string().min(1),
  note: z.string(),
});

/** GET /api/meal-plans?week=... — FR-27. */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const weekId = searchParams.get("week") ?? DEFAULT_WEEK;
  const mealPlan = await getMealPlan(weekId);
  return NextResponse.json(mealPlan);
}

/** POST /api/meal-plans — FR-26 & FR-28 (jadwalkan / ubah menu). */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, AssignMealBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const entry = await assignMealPlanEntry(parsed.data);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal menjadwalkan menu", 400);
  }
}

/** DELETE /api/meal-plans?week=...&entryId=... — hapus menu dari jadwal. */
export async function DELETE(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const weekId = searchParams.get("week") ?? DEFAULT_WEEK;
  const entryId = searchParams.get("entryId");
  if (!entryId) {
    return jsonError("Parameter entryId wajib diisi", 400);
  }
  const result = await removeMealPlanEntry({ weekId, entryId });
  return NextResponse.json(result);
}

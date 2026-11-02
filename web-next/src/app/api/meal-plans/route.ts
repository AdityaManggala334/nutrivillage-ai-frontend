import { NextResponse } from "next/server";
import { z } from "zod";
import { DayOfWeekSchema, MealSlotSchema } from "@/schemas/domain";
import { BackendError } from "@/server/backend-api";
import {
  DEFAULT_WEEK_ID,
  WEEK_LABEL,
  assignMealPlanDb,
  listMealPlansFromDb,
  removeMealPlanDb,
} from "@/server/planning";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

const AssignMealBodySchema = z.object({
  weekId: z.string().min(1),
  day: DayOfWeekSchema,
  slot: MealSlotSchema,
  recipeId: z.string().min(1),
  note: z.string(),
});

/** Jadwal kosong untuk sesi tanpa data di database (mis. tamu). */
const emptyPlan = (weekId: string) => ({ weekId, weekLabel: WEEK_LABEL, entries: [] });

/** GET /api/meal-plans?week=... — FR-27, dari tabel `meal_plans`. */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const weekId = searchParams.get("week") ?? DEFAULT_WEEK_ID;
  try {
    return NextResponse.json(await listMealPlansFromDb(weekId));
  } catch (error) {
    // Tamu / sesi tanpa akun → tampilkan jadwal kosong (tanpa error 500).
    if (error instanceof BackendError && error.status === 401) {
      return NextResponse.json(emptyPlan(weekId));
    }
    return backendErrorResponse(error);
  }
}

/** POST /api/meal-plans — FR-26/FR-28 (assign / ganti slot). */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, AssignMealBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const entry = await assignMealPlanDb(parsed.data);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** DELETE /api/meal-plans?week=...&entryId=... — FR-28 (hapus jadwal). */
export async function DELETE(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get("entryId");
  if (!entryId) return jsonError("Parameter entryId wajib diisi", 400);

  try {
    return NextResponse.json(await removeMealPlanDb(entryId));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

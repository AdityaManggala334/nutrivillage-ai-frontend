import { NextResponse } from "next/server";
import { z } from "zod";
import { buildSppgPlan } from "@/server/sppg-plan";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  name: z.string().min(3, "Nama sekolah wajib diisi"),
  region: z.string().min(3, "Wilayah wajib diisi"),
  allergies: z.array(z.string()),
  groups: z
    .array(
      z.object({
        level: z.string().min(1),
        studentCount: z.number().int().positive(),
        budgetPerPortion: z.number().positive().nullable(),
      }),
    )
    .min(1, "Minimal satu kelompok siswa"),
});

/** POST /api/recommendations/sppg — paket MBG per jenjang, anggaran BGN. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg" && user.role !== "admin") {
    return jsonError("Hanya Petugas SPPG yang dapat menyusun rencana massal.", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Body bukan JSON yang valid." }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 422 },
    );
  }
  try {
    return NextResponse.json(await buildSppgPlan(parsed.data));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

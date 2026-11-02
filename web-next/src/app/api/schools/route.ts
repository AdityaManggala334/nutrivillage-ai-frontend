import { NextResponse } from "next/server";
import { SchoolCreateBodySchema } from "@/schemas/school";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";
import {
  createGroupForSession,
  createSchoolForSession,
  listSchoolsForSession,
} from "@/server/school-api";

export const dynamic = "force-dynamic";

/** GET /api/schools — daftar sekolah pada lingkup sesi (petugas: miliknya). */
export async function GET(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg" && user.role !== "admin") {
    return jsonError("Akses ditolak untuk peran ini.", 403);
  }

  try {
    return NextResponse.json(await listSchoolsForSession());
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** POST /api/schools — FR-11: buat sekolah baru (beserta kelompok opsional). */
export async function POST(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg") {
    return jsonError("Hanya Petugas SPPG yang dapat menambah sekolah.", 403);
  }

  const parsed = await parseJsonBody(request, SchoolCreateBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const school = await createSchoolForSession({
      name: parsed.data.name,
      npsn: parsed.data.npsn || undefined,
      address: parsed.data.address || undefined,
      region: parsed.data.region,
      isActive: parsed.data.isActive,
    });

    for (const group of parsed.data.groups ?? []) {
      await createGroupForSession(school.id, {
        level: group.level,
        label: group.label ?? null,
        studentCount: group.studentCount,
        budgetPerPortion: group.budgetPerPortion ?? null,
      });
    }

    const fresh = (await listSchoolsForSession()).find((item) => item.id === school.id);
    return NextResponse.json(fresh ?? school, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

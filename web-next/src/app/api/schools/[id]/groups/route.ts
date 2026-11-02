import { NextResponse } from "next/server";
import { GroupApiBodySchema } from "@/schemas/school";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";
import { createGroupForSession, listSchoolsForSession } from "@/server/school-api";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

function parseId(raw: string): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** GET /api/schools/[id]/groups — daftar kelompok penerima manfaat. */
export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg" && user.role !== "admin") {
    return jsonError("Akses ditolak untuk peran ini.", 403);
  }

  const { id } = await context.params;
  const schoolId = parseId(id);
  if (schoolId === null) return jsonError("ID sekolah tidak valid.", 400);

  try {
    const schools = await listSchoolsForSession();
    const school = schools.find((item) => item.id === schoolId);
    if (!school) return jsonError("Sekolah tidak ditemukan.", 404);
    return NextResponse.json(school.groups);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** POST /api/schools/[id]/groups — tambah kelompok penerima manfaat. */
export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg") {
    return jsonError("Hanya Petugas SPPG yang dapat mengubah kelompok.", 403);
  }

  const { id } = await context.params;
  const schoolId = parseId(id);
  if (schoolId === null) return jsonError("ID sekolah tidak valid.", 400);

  const parsed = await parseJsonBody(request, GroupApiBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const group = await createGroupForSession(schoolId, {
      level: parsed.data.level,
      label: parsed.data.label ?? null,
      studentCount: parsed.data.studentCount,
      budgetPerPortion: parsed.data.budgetPerPortion ?? null,
    });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

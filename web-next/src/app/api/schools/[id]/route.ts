import { NextResponse } from "next/server";
import { SchoolUpdateBodySchema } from "@/schemas/school";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";
import {
  deleteSchoolForSession,
  listSchoolsForSession,
  syncSchoolGroupsForSession,
  updateSchoolForSession,
} from "@/server/school-api";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

function parseId(raw: string): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** GET /api/schools/[id] — detail satu sekolah pada lingkup sesi. */
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
    return NextResponse.json(school);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** PATCH /api/schools/[id] — ubah data sekolah. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg") {
    return jsonError("Hanya Petugas SPPG yang dapat mengubah sekolah.", 403);
  }

  const { id } = await context.params;
  const schoolId = parseId(id);
  if (schoolId === null) return jsonError("ID sekolah tidak valid.", 400);

  const parsed = await parseJsonBody(request, SchoolUpdateBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const school = await updateSchoolForSession(schoolId, {
      name: parsed.data.name,
      npsn: parsed.data.npsn,
      address: parsed.data.address,
      region: parsed.data.region,
      isActive: parsed.data.isActive,
    });

    if (parsed.data.groups) {
      await syncSchoolGroupsForSession(
        schoolId,
        parsed.data.groups.map((group) => ({
          level: group.level,
          studentCount: group.studentCount,
        })),
      );
    }

    const fresh = (await listSchoolsForSession()).find((item) => item.id === schoolId);
    return NextResponse.json(fresh ?? school);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** DELETE /api/schools/[id] — hapus sekolah (beserta kelompoknya). */
export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg") {
    return jsonError("Hanya Petugas SPPG yang dapat menghapus sekolah.", 403);
  }

  const { id } = await context.params;
  const schoolId = parseId(id);
  if (schoolId === null) return jsonError("ID sekolah tidak valid.", 400);

  try {
    await deleteSchoolForSession(schoolId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

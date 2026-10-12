import { NextResponse } from "next/server";
import { GroupUpdateBodySchema } from "@/schemas/school";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";
import { deleteGroupForSession, updateGroupForSession } from "@/server/school-api";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string; groupId: string }>;
}

function parseId(raw: string): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

/** PATCH /api/schools/[id]/groups/[groupId] — ubah kelompok penerima. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg") {
    return jsonError("Hanya Petugas SPPG yang dapat mengubah kelompok.", 403);
  }

  const { id, groupId } = await context.params;
  const schoolId = parseId(id);
  const parsedGroupId = parseId(groupId);
  if (schoolId === null || parsedGroupId === null) {
    return jsonError("ID tidak valid.", 400);
  }

  const parsed = await parseJsonBody(request, GroupUpdateBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const group = await updateGroupForSession(schoolId, parsedGroupId, {
      level: parsed.data.level,
      label: parsed.data.label,
      studentCount: parsed.data.studentCount,
      budgetPerPortion: parsed.data.budgetPerPortion,
    });
    return NextResponse.json(group);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** DELETE /api/schools/[id]/groups/[groupId] — hapus kelompok penerima. */
export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg") {
    return jsonError("Hanya Petugas SPPG yang dapat menghapus kelompok.", 403);
  }

  const { id, groupId } = await context.params;
  const schoolId = parseId(id);
  const parsedGroupId = parseId(groupId);
  if (schoolId === null || parsedGroupId === null) {
    return jsonError("ID tidak valid.", 400);
  }

  try {
    await deleteGroupForSession(schoolId, parsedGroupId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { AdminUserUpdateBodySchema } from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { updateUserForSession } from "@/server/admin-users";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

/** PATCH /api/admin/users/[id] — ubah peran / aktif-nonaktif / data petugas. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") {
    return jsonError("Hanya admin yang dapat mengubah data pengguna.", 403);
  }

  const { id } = await context.params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return jsonError("ID pengguna tidak valid.", 400);
  }

  const parsed = await parseJsonBody(request, AdminUserUpdateBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const updated = await updateUserForSession(userId, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    return backendErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { AdminUserCreateBodySchema } from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { createUserForSession, listUsersForSession } from "@/server/admin-users";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

function requireAdmin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") {
    return { error: jsonError("Hanya admin yang dapat mengakses data pengguna.", 403) };
  }
  return { user };
}

/** GET /api/admin/users — daftar pengguna (khusus admin). */
export async function GET(request: Request): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;
  try {
    return NextResponse.json(await listUsersForSession());
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** POST /api/admin/users — tambah akun baru (khusus admin). */
export async function POST(request: Request): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;

  const parsed = await parseJsonBody(request, AdminUserCreateBodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const user = await createUserForSession(parsed.data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

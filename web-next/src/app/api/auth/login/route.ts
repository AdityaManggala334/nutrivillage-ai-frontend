import { NextResponse } from "next/server";
import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/constants";
import { LoginSchema } from "@/schemas/auth";
import { authenticateUser } from "@/server/auth";
import { jsonError, parseJsonBody } from "@/server/http";

/** POST /api/auth/login — FR-02. Menulis cookie session + role (RBAC). */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, LoginSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const session = await authenticateUser(parsed.data);
    const response = NextResponse.json(session);
    response.cookies.set({
      name: SESSION_COOKIE,
      value: session.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    response.cookies.set({
      name: ROLE_COOKIE,
      value: session.user.role,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal masuk", 401);
  }
}

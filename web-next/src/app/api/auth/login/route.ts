import { NextResponse } from "next/server";
import { LoginSchema } from "@/schemas/auth";
import { authenticateUser } from "@/server/auth";
import { jsonError, parseJsonBody, setSessionCookies } from "@/server/http";

/** POST /api/auth/login — FR-02. Menulis cookie session + role (RBAC). */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, LoginSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const session = await authenticateUser(parsed.data);
    return setSessionCookies(NextResponse.json(session), session, 60 * 60 * 8);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal masuk", 401);
  }
}

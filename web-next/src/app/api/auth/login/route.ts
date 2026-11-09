import { NextResponse } from "next/server";
import { LoginSchema } from "@/schemas/auth";
import { authenticateUser } from "@/server/auth";
import { backendErrorResponse, parseJsonBody, setSessionCookies } from "@/server/http";

/** POST /api/auth/login — FR-02. Menulis cookie session + role (RBAC). */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, LoginSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const session = await authenticateUser(parsed.data);
    return setSessionCookies(NextResponse.json(session), session, 60 * 60 * 8);
  } catch (error) {
    // Status asli dipertahankan agar 429 (kuota login) dan 403 (akun nonaktif)
    // tidak menyamar menjadi 401 "email atau password salah".
    return backendErrorResponse(error);
  }
}

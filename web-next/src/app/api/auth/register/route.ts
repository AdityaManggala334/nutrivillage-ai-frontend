import { NextResponse } from "next/server";
import { RegisterSchema } from "@/schemas/auth";
import { registerUser } from "@/server/auth";
import { jsonError, parseJsonBody, setSessionCookies } from "@/server/http";

/** POST /api/auth/register — FR-01. Membuat akun + cookie session. */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, RegisterSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const session = await registerUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });
    return setSessionCookies(NextResponse.json(session, { status: 201 }), session, 60 * 60 * 8);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal mendaftar", 409);
  }
}

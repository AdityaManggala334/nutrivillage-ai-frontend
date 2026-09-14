import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { RegisterSchema } from "@/schemas/auth";
import { registerUser } from "@/server/auth";
import { jsonError, parseJsonBody } from "@/server/http";

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
    const response = NextResponse.json(session, { status: 201 });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: session.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal mendaftar", 409);
  }
}

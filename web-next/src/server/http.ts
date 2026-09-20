import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";
import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/constants";

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ message }, { status });
}

/** Menulis cookie sesi + role (RBAC) pada respons autentikasi. */
export function setSessionCookies(
  response: NextResponse,
  session: { readonly token: string; readonly user: { readonly role: string } },
  maxAgeSeconds: number,
): NextResponse {
  const cookies: ReadonlyArray<readonly [string, string]> = [
    [SESSION_COOKIE, session.token],
    [ROLE_COOKIE, session.user.role],
  ];
  for (const [name, value] of cookies) {
    response.cookies.set({
      name,
      value,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: maxAgeSeconds,
    });
  }
  return response;
}

type ParseResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly response: NextResponse };

/** Memvalidasi body JSON dengan skema Zod sebelum masuk logika server. */
export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: jsonError("Body JSON tidak valid", 400) };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          message: "Validasi gagal",
          issues: result.error.issues.map((issue) => ({
            path: issue.path.map(String).join("."),
            message: issue.message,
          })),
        },
        { status: 422 },
      ),
    };
  }

  return { ok: true, data: result.data };
}

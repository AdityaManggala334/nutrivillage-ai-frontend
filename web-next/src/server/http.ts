import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";
import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/constants";
import { BackendError } from "@/server/backend-api";

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ message }, { status });
}

/** Memetakan error backend FastAPI ke respons Next.js.
 *
 * Pesan 4xx backend sengaja diteruskan karena memang ditulis untuk pengguna
 * ("Email sudah terdaftar", dsb.). Pesan 5xx dan error tak terduga TIDAK
 * diteruskan: isinya bisa memuat detail internal (S-06/T-06).
 */
export function backendErrorResponse(error: unknown): NextResponse {
  if (error instanceof BackendError) {
    if (error.status >= 500) {
      console.error("[backend] gagal:", error.status, error.message);
      return jsonError("Layanan sedang tidak tersedia. Coba lagi sebentar.", 502);
    }
    return jsonError(error.message, error.status);
  }
  console.error("[backend] error tak terduga:", error);
  return jsonError("Terjadi kesalahan tak terduga.", 500);
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

/** Batas ukuran body JSON (1 MB) untuk route yang meneruskan body apa adanya. */
export const MAX_BODY_BYTES = 1_000_000;

/** Baca body JSON tanpa skema Zod, dengan batas ukuran (T-05). */
export async function readJsonBody(
  request: Request,
  maxBytes: number = MAX_BODY_BYTES,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  const panjang = Number(request.headers.get("content-length") ?? "0");
  if (panjang > maxBytes) {
    return { ok: false, response: jsonError("Ukuran data melebihi batas.", 413) };
  }
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return { ok: false, response: jsonError("Body JSON tidak valid.", 400) };
  }
  if (data === null || typeof data !== "object") {
    return { ok: false, response: jsonError("Body harus berupa objek JSON.", 422) };
  }
  return { ok: true, data };
}

/** Memvalidasi body JSON dengan skema Zod sebelum masuk logika server. */
export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParseResult<T>> {
  const panjang = Number(request.headers.get("content-length") ?? "0");
  if (panjang > MAX_BODY_BYTES) {
    return { ok: false, response: jsonError("Ukuran data melebihi batas.", 413) };
  }

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

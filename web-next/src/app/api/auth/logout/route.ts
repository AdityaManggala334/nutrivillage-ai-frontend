import { NextResponse } from "next/server";
import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/constants";
import { backendLogout } from "@/server/backend-api";
import { getSessionToken } from "@/server/auth";

/**
 * POST /api/auth/logout — FR-21.
 *
 * Tidak cukup menghapus cookie: access token yang sudah terlanjur keluar
 * tetap berlaku 8 jam kalau tidak dicabut di server. Jadi sesi dilaporkan ke
 * backend lebih dulu (naik token_version + cabut refresh token), baru cookie
 * dibersihkan. Kegagalan backend tidak menahan logout di klien.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  if (token && !token.startsWith("nv-")) {
    try {
      await backendLogout(token);
    } catch {
      // Server sedang mati atau token sudah kedaluwarsa: cookie tetap dihapus.
    }
  }

  const response = NextResponse.json({ ok: true });
  for (const name of [SESSION_COOKIE, ROLE_COOKIE]) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}

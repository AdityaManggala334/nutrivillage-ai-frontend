import { NextResponse } from "next/server";
import { ROLE_COOKIE, SESSION_COOKIE } from "@/lib/constants";

/** POST /api/auth/logout — FR-21 (hapus cookie session dan role). */
export async function POST(): Promise<NextResponse> {
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

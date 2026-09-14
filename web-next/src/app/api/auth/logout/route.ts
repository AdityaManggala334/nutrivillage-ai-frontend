import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

/** POST /api/auth/logout — FR-21 (hapus cookie session). */
export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

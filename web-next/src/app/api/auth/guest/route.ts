import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { createGuestSession } from "@/server/auth";

/** POST /api/auth/guest — FR-03. Sesi tamu instan tanpa registrasi. */
export async function POST(): Promise<NextResponse> {
  const session = createGuestSession();
  const response = NextResponse.json(session);
  response.cookies.set({
    name: SESSION_COOKIE,
    value: session.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  return response;
}

import { NextResponse } from "next/server";
import { createGuestSession } from "@/server/auth";
import { setSessionCookies } from "@/server/http";

/** POST /api/auth/guest — FR-03. Sesi tamu instan tanpa registrasi. */
export async function POST(): Promise<NextResponse> {
  const session = createGuestSession();
  return setSessionCookies(NextResponse.json(session), session, 60 * 60 * 4);
}

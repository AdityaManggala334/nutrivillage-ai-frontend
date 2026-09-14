import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";

export const dynamic = "force-dynamic";

/** GET /api/auth/session — user sesi aktif (null bila belum masuk). */
export async function GET(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  return NextResponse.json(user);
}

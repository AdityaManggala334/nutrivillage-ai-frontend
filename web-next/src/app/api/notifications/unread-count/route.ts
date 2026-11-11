import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendFetch } from "@/server/backend-api";
import { SESSION_COOKIE } from "@/lib/constants";
export const dynamic = "force-dynamic";
/**
 * GET /api/notifications/unread-count - B9: badge lonceng belum dibaca.
 * Bila backend tidak tersedia / belum masuk, kembalikan 0 agar topbar tidak error.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const data = await backendFetch<{ count: number }>(
      "/notifications/unread-count",
      { method: "GET", headers: token ? { Authorization: `Bearer ${token}` } : {} },
      token,
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

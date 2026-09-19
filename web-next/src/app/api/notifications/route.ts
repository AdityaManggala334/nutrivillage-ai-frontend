import { NextResponse } from "next/server";
import { getNotifications } from "@/server/content-data";

export const dynamic = "force-dynamic";

/** GET /api/notifications — daftar notifikasi pengguna (FR-21). */
export async function GET(): Promise<NextResponse> {
  const notifications = await getNotifications();
  return NextResponse.json(notifications);
}

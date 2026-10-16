import { NextResponse } from "next/server";
import { getNotifications } from "@/server/content-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications — daftar notifikasi pengguna (FR-21), dari database.
 *
 * Tanpa sesi backend (mis. Guest Mode) atau bila backend sedang bangun dari
 * cold start, endpoint tetap mengembalikan daftar kosong agar lonceng di
 * topbar tidak menampilkan error.
 */
export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await getNotifications());
  } catch (error) {
    console.error("[api/notifications] gagal memuat:", error);
    return NextResponse.json([]);
  }
}

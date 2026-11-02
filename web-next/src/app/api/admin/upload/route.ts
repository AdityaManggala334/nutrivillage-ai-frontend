import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { jsonError } from "@/server/http";
import { imagekitConfigured, uploadToImageKit } from "@/server/imagekit";

export const dynamic = "force-dynamic";

const MAKS_BYTE = 5 * 1024 * 1024;
const TIPE = new Set(["image/jpeg", "image/png", "image/webp"]);

/** POST /api/admin/upload — unggah gambar menu ke ImageKit dari server. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat mengunggah gambar.", 403);
  if (!imagekitConfigured()) return jsonError("ImageKit belum dikonfigurasi di server.", 503);

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("File gambar wajib diunggah.", 400);
  if (!TIPE.has(file.type)) return jsonError("Format gambar harus JPG, PNG, atau WebP.", 422);
  if (file.size > MAKS_BYTE) return jsonError("Ukuran gambar maksimal 5 MB.", 422);

  try {
    return NextResponse.json(await uploadToImageKit(file));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal mengunggah gambar.", 502);
  }
}

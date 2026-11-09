import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { jsonError } from "@/server/http";
import { imagekitConfigured, uploadToImageKit } from "@/server/imagekit";

export const dynamic = "force-dynamic";

const MAKS_BYTE = 5 * 1024 * 1024;
const TIPE = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Cocokkan tanda tangan byte pertama; `file.type` berasal dari klien dan bisa palsu (S-04). */
async function tipeAsli(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const mulai = (bytes: number[]): boolean =>
    bytes.every((b, i) => head[i] === b);
  if (mulai([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (mulai([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  const teks = String.fromCharCode(...head.slice(0, 4));
  const akhir = String.fromCharCode(...head.slice(8, 12));
  if (teks === "RIFF" && akhir === "WEBP") return "image/webp";
  return null;
}

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
  const asli = await tipeAsli(file);
  if (asli === null || !TIPE.has(asli)) {
    return jsonError("Isi berkas bukan gambar JPG, PNG, atau WebP.", 422);
  }

  try {
    return NextResponse.json(await uploadToImageKit(file));
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal mengunggah gambar.", 502);
  }
}

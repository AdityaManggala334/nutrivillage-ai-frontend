import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendImportDataset } from "@/server/backend-api";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** POST /api/admin/import — teruskan unggahan CSV ke backend (khusus admin). */
export async function POST(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat mengimpor dataset.", 403);

  const form = await request.formData();
  const files = form.getAll("berkas").filter((item): item is File => item instanceof File);
  if (files.length === 0) return jsonError("Pilih berkas CSV terlebih dahulu.", 400);

  const forwarded = new FormData();
  for (const file of files) forwarded.append("berkas", file);
  forwarded.append("region", String(form.get("region") ?? "Kabupaten Madiun"));
  forwarded.append("terapkan", String(form.get("terapkan") ?? "false") === "true" ? "true" : "false");

  try {
    return NextResponse.json(await backendImportDataset(token, forwarded));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

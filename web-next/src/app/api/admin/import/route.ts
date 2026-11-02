import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { importDataset } from "@/server/admin-nutrition";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** POST /api/admin/import — unggah CSV dataset (pratinjau atau terapkan). */
export async function POST(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") {
    return jsonError("Hanya admin yang dapat mengimpor dataset.", 403);
  }
  const form = await request.formData();
  const files = form.getAll("berkas").filter((item): item is File => item instanceof File);
  if (files.length === 0) return jsonError("Pilih berkas CSV terlebih dahulu.", 400);
  const region = String(form.get("region") ?? "Kabupaten Madiun");
  const terapkan = String(form.get("terapkan") ?? "false") === "true";
  try {
    return NextResponse.json(await importDataset(files, { region, terapkan }));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

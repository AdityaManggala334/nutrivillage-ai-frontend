import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendImportDataset } from "@/server/backend-api";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** Sama dengan batas backend (app/services/dataset_import.py). */
const MAKS_MB = 10;
const MAKS_JUMLAH = 7;

/** POST /api/admin/import — teruskan unggahan CSV ke backend (khusus admin). */
export async function POST(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat mengimpor dataset.", 403);

  // Tolak lebih awal berdasar header, sebelum body besar masuk ke memori.
  const panjang = Number(request.headers.get("content-length") ?? "0");
  if (panjang > MAKS_MB * MAKS_JUMLAH * 1024 * 1024) {
    return jsonError(
      `Total unggahan melebihi ${MAKS_MB * MAKS_JUMLAH} MB (${MAKS_MB} MB x ${MAKS_JUMLAH} berkas).`,
      413,
    );
  }

  const form = await request.formData();
  const files = form.getAll("berkas").filter((item): item is File => item instanceof File);
  if (files.length === 0) return jsonError("Pilih berkas CSV terlebih dahulu.", 400);
  if (files.length > MAKS_JUMLAH) {
    return jsonError(`Maksimal ${MAKS_JUMLAH} berkas per unggahan.`, 413);
  }
  const berlebih = files.filter((f) => f.size > MAKS_MB * 1024 * 1024);
  if (berlebih.length > 0) {
    return jsonError(
      `Berkas melebihi ${MAKS_MB} MB: ${berlebih.map((f) => f.name).join(", ")}.`,
      413,
    );
  }

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

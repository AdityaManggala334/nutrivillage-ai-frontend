import { NextResponse } from "next/server";
import { z } from "zod";
import { FoodSafetyVerificationSchema } from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import {
  backendAdminDelete,
  backendAdminUpdate,
} from "@/server/backend-api";
import { backendErrorResponse, jsonError, readJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

/**
 * Semua kolom yang boleh disunting lewat jalur ini. `verification` tetap
 * opsional supaya tombol Setujui/Tolak (yang hanya mengirim status) masih
 * bekerja seperti sebelumnya.
 */
const BodySchema = z.object({
  code: z.string().max(64).nullish(),
  topic: z.string().min(3).max(200).optional(),
  risk_type: z.string().min(3).max(150).optional(),
  hazard: z.string().min(3).max(2000).optional(),
  handling: z.string().max(4000).nullish(),
  source: z.string().max(255).nullish(),
  verification: FoodSafetyVerificationSchema.optional(),
});

function requireAdmin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") {
    return {
      error: jsonError("Hanya admin yang dapat mengelola informasi keamanan pangan.", 403),
    };
  }
  return { user };
}

function idItem(id: string): boolean {
  const nilai = Number(id);
  return Number.isInteger(nilai) && nilai > 0;
}

/**
 * PATCH /api/admin/food-safety/[id] — verifikasi dan/atau sunting isi.
 *
 * Sebelumnya hanya menerima `{verification}`, jadi setiap upaya mengoreksi
 * teks (judul, bahaya, panduan) berbalas 402/422 dan konten salah tidak bisa
 * diperbaiki. Seluruh bidang kini diteruskan ke backend untuk divalidasi ulang.
 */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;

  const { id } = await context.params;
  if (!idItem(id)) return jsonError("ID data tidak valid.", 400);

  const dibaca = await readJsonBody(request);
  if (!dibaca.ok) return dibaca.response;

  const parsed = BodySchema.safeParse(dibaca.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validasi gagal",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.map(String).join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    return jsonError("Tidak ada perubahan yang dikirim.", 422);
  }

  try {
    const token = getSessionToken(request) as string;
    return NextResponse.json(await backendAdminUpdate(token, "food-safety", id, parsed.data));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** DELETE /api/admin/food-safety/[id] — hapus data (sebelumnya 405). */
export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;

  const { id } = await context.params;
  if (!idItem(id)) return jsonError("ID data tidak valid.", 400);

  try {
    const token = getSessionToken(request) as string;
    await backendAdminDelete(token, "food-safety", id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

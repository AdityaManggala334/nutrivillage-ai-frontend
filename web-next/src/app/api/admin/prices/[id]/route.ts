import { NextResponse } from "next/server";
import { z } from "zod";
import { PriceStatusSchema } from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import {
  backendAdminDelete,
  backendAdminUpdate,
  backendVerifyPrice,
} from "@/server/backend-api";
import { backendErrorResponse, jsonError, readJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

/** Badan verifikasi: hanya status (+ catatan). */
const VerifySchema = z.object({
  status: PriceStatusSchema,
  note: z.string().max(255).nullish(),
});
/** Badan sunting penuh: kolom harga, tanpa status. */
const EditSchema = z
  .object({
    ingredient_id: z.number().int().positive().optional(),
    region_id: z.number().int().positive().nullish(),
    price: z.number().positive(),
    unit: z.string().min(1).max(30),
    recorded_date: z.string().min(8).optional(),
    source: z.string().max(255).optional(),
  })
  .strict();

function requireAdmin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") {
    return { error: jsonError("Hanya admin yang dapat mengelola harga.", 403) };
  }
  return { user };
}

function idHarga(id: string): number | null {
  const nilai = Number(id);
  return Number.isInteger(nilai) && nilai > 0 ? nilai : null;
}

/**
 * PATCH /api/admin/prices/[id] — FR-23.
 *
 * Dua maksud lewat URL yang sama, dibedakan dari isinya:
 * - `{status}`  -> verifikasi (backend `POST /admin/prices/{id}/verify`,
 *   tercatat di `price_verifications` + `price_history`);
 * - lainnya     -> sunting nilai harga (backend `PATCH /admin/prices/{id}`).
 *
 * Sebelumnya jalur ini hanya menerima verifikasi, sehingga tombol "Ubah" di
 * halaman Harga selalu 422 dan admin tidak bisa mengoreksi nilai harga.
 */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;

  const { id } = await context.params;
  const priceId = idHarga(id);
  if (priceId === null) return jsonError("ID harga tidak valid.", 400);
  const token = getSessionToken(request) as string;

  // Body hanya boleh dibaca sekali, jadi dibaca lalu dicoba ke dua skema.
  const dibaca = await readJsonBody(request);
  if (!dibaca.ok) return dibaca.response;

  const verifikasi = VerifySchema.safeParse(dibaca.data);
  if (verifikasi.success) {
    try {
      const price = await backendVerifyPrice(
        token,
        priceId,
        verifikasi.data.status,
        verifikasi.data.note ?? undefined,
      );
      return NextResponse.json(price);
    } catch (error) {
      return backendErrorResponse(error);
    }
  }

  const sunting = EditSchema.safeParse(dibaca.data);
  if (!sunting.success) {
    return NextResponse.json(
      {
        message: "Validasi gagal",
        issues: sunting.error.issues.map((i) => ({
          path: i.path.map(String).join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  try {
    return NextResponse.json(await backendAdminUpdate(token, "prices", id, sunting.data));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** DELETE /api/admin/prices/[id] — hapus data harga (sebelumnya 405). */
export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;

  const { id } = await context.params;
  if (idHarga(id) === null) return jsonError("ID harga tidak valid.", 400);

  try {
    const token = getSessionToken(request) as string;
    await backendAdminDelete(token, "prices", id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

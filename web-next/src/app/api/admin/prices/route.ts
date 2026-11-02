import { NextResponse } from "next/server";
import { AdminPriceCreateSchema, AdminPriceSchema } from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { createAdminPrice, listAdminPrices } from "@/server/admin-prices";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/admin/prices — seluruh harga dari tabel `prices`. */
export async function GET(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat melihat harga.", 403);
  try {
    return NextResponse.json(await listAdminPrices());
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** POST /api/admin/prices — tambah harga baru (masuk sebagai pending). */
export async function POST(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat menambah harga.", 403);
  const parsed = await parseJsonBody(request, AdminPriceCreateSchema);
  if (!parsed.ok) return parsed.response;
  try {
    const price = await createAdminPrice(parsed.data);
    return NextResponse.json(AdminPriceSchema.parse(price), { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

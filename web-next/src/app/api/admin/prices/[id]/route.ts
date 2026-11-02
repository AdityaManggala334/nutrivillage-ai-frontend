import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminPriceSchema,
  AdminPriceUpdateSchema,
  PriceStatusSchema,
} from "@/schemas/admin";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { deleteAdminPrice, updateAdminPrice, verifyAdminPrice } from "@/server/admin-prices";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

const BodySchema = z.union([
  z.object({ status: PriceStatusSchema.exclude(["pending"]) }),
  AdminPriceUpdateSchema,
]);

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** PATCH /api/admin/prices/[id] — ubah angka harga atau setujui/tolak. */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat mengubah harga.", 403);
  const priceId = parseId((await context.params).id);
  if (priceId === null) return jsonError("ID harga tidak valid.", 400);

  const parsed = await parseJsonBody(request, BodySchema);
  if (!parsed.ok) return parsed.response;
  try {
    const price =
      "status" in parsed.data
        ? await verifyAdminPrice(priceId, parsed.data.status)
        : await updateAdminPrice(priceId, parsed.data);
    return NextResponse.json(AdminPriceSchema.parse(price));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** DELETE /api/admin/prices/[id] — hapus data harga dari database. */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat menghapus harga.", 403);
  const priceId = parseId((await context.params).id);
  if (priceId === null) return jsonError("ID harga tidak valid.", 400);
  try {
    await deleteAdminPrice(priceId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

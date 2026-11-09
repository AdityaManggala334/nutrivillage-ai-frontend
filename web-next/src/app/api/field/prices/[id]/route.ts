import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendFieldDeletePrice } from "@/server/backend-api";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

interface RouteContext {
  readonly params: Promise<{ id: string }>;
}

/** DELETE /api/field/prices/[id] — tarik kiriman sendiri selama masih pending. */
export async function DELETE(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_lapangan" && user.role !== "admin") {
    return jsonError("Hanya Petugas Lapangan yang dapat menarik kirimannya.", 403);
  }

  const { id } = await context.params;
  const angka = Number(id);
  if (!Number.isInteger(angka) || angka <= 0) return jsonError("ID tidak valid.", 400);

  try {
    await backendFieldDeletePrice(token, angka);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

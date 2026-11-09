import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionToken, getUserByToken } from "@/server/auth";
import {
  backendFieldCreatePrice,
  backendFieldPrices,
} from "@/server/backend-api";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  ingredient_id: z.number().int().positive(),
  price: z.number().positive(),
  unit: z.string().min(1).max(20),
  source: z.string().min(2).max(150),
  recorded_date: z.string().min(8).max(10).optional(),
  region_id: z.number().int().positive().nullable().optional(),
});

/** Hanya petugas lapangan dan admin yang boleh memakai jalur ini. */
function boleh(request: Request) {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) {
    return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  }
  if (user.role !== "petugas_lapangan" && user.role !== "admin") {
    return {
      error: jsonError("Hanya Petugas Lapangan yang dapat mencatat harga pasar.", 403),
    };
  }
  return { user, token };
}

/** GET /api/field/prices — daftar kiriman milik petugas ini. */
export async function GET(request: Request): Promise<NextResponse> {
  const akses = boleh(request);
  if (akses.error) return akses.error;
  try {
    const status = new URL(request.url).searchParams.get("status") ?? undefined;
    return NextResponse.json(await backendFieldPrices(akses.token, status));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** POST /api/field/prices — catat harga dari lapangan (status ditetapkan server). */
export async function POST(request: Request): Promise<NextResponse> {
  const akses = boleh(request);
  if (akses.error) return akses.error;

  const parsed = await parseJsonBody(request, CreateSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const harga = await backendFieldCreatePrice(akses.token, parsed.data);
    return NextResponse.json(harga, { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { AccountSchema } from "@/schemas/account";
import {
  getSessionToken,
  getUserByToken,
  getUserContact,
  updateUserContact,
} from "@/server/auth";
import { jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/account — data diri pengguna (FR-18). */
export async function GET(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return NextResponse.json(null);
  return NextResponse.json(getUserContact(user.id));
}

/** PUT /api/account — ubah data diri (FR-18). */
export async function PUT(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);

  const parsed = await parseJsonBody(request, AccountSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const contact = await updateUserContact(user.id, parsed.data);
    return NextResponse.json(contact);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal menyimpan data diri", 400);
  }
}

import { NextResponse } from "next/server";
import { AccountSchema, AccountUpdateSchema } from "@/schemas/account";
import { getSessionToken, getUserByToken } from "@/server/auth";
import {
  BackendError,
  backendGetAccount,
  backendUpdateAccount,
  type BackendAccount,
  type BackendAccountInput,
} from "@/server/backend-api";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

/** Memetakan respons backend (snake_case) ke model akun frontend. */
function toClientAccount(account: BackendAccount) {
  return AccountSchema.parse({
    name: account.name,
    email: account.email,
    phone: account.phone ?? "",
    notificationsEnabled: account.notifications_enabled,
  });
}

/**
 * Sesi tamu tidak terdaftar di backend, sehingga tidak ada data akun yang bisa
 * disimpan. Keduanya (tamu & tanpa sesi) mengembalikan `null`.
 */
function localOnlySession(request: Request): boolean {
  const user = getUserByToken(getSessionToken(request));
  return !user || user.role === "guest";
}

/** GET /api/account — data diri pengguna (FR-18), dari tabel `users`. */
export async function GET(request: Request): Promise<NextResponse> {
  if (localOnlySession(request)) return NextResponse.json(null);

  try {
    const token = getSessionToken(request) as string;
    return NextResponse.json(toClientAccount(await backendGetAccount(token)));
  } catch (error) {
    if (error instanceof BackendError && (error.status === 401 || error.status === 404)) {
      return NextResponse.json(null);
    }
    return backendErrorResponse(error);
  }
}

/** PATCH/PUT /api/account — ubah nama, nomor HP & notifikasi (FR-18, FR-21). */
async function updateAccount(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role === "guest") {
    return jsonError("Mode tamu tidak menyimpan data diri. Silakan masuk atau daftar.", 403);
  }

  const parsed = await parseJsonBody(request, AccountUpdateSchema);
  if (!parsed.ok) return parsed.response;

  const input: BackendAccountInput = {
    ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
    ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
    ...(parsed.data.notificationsEnabled !== undefined
      ? { notifications_enabled: parsed.data.notificationsEnabled }
      : {}),
  };

  try {
    const account = await backendUpdateAccount(token as string, input);
    return NextResponse.json(toClientAccount(account));
  } catch (error) {
    if (error instanceof BackendError) return jsonError(error.message, error.status);
    return jsonError(error instanceof Error ? error.message : "Gagal menyimpan data diri", 400);
  }
}

export const PATCH = updateAccount;
export const PUT = updateAccount;

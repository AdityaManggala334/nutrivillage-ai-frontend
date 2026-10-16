import { NextResponse } from "next/server";
import { PasswordChangeSchema } from "@/schemas/account";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { BackendError, backendChangePassword } from "@/server/backend-api";
import { jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

/**
 * PUT /api/account/password — ganti password (FR-18).
 * Password lama diverifikasi oleh backend (`PUT /account/password`) dan
 * perubahan disimpan pada `users.password_hash`.
 */
export async function PUT(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role === "guest") {
    return jsonError("Mode tamu tidak memiliki password. Silakan masuk atau daftar.", 403);
  }

  const parsed = await parseJsonBody(request, PasswordChangeSchema);
  if (!parsed.ok) return parsed.response;

  const { currentPassword, newPassword, confirmPassword } = parsed.data;
  if (newPassword !== confirmPassword) {
    return jsonError("Konfirmasi password baru tidak sama.", 422);
  }
  if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return jsonError("Password baru harus memuat huruf dan angka.", 422);
  }
  if (newPassword === currentPassword) {
    return jsonError("Password baru tidak boleh sama dengan password lama.", 422);
  }

  try {
    await backendChangePassword(token as string, {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof BackendError) return jsonError(error.message, error.status);
    return jsonError(error instanceof Error ? error.message : "Gagal mengganti password", 400);
  }
}

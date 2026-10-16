import { NextResponse } from "next/server";
import { RegisterSchema } from "@/schemas/auth";
import { registerUser } from "@/server/auth";
import { jsonError, parseJsonBody } from "@/server/http";

/**
 * POST /api/auth/register — FR-01. Membuat akun TANPA auto-login.
 * Klien diarahkan kembali ke halaman login untuk masuk dengan akun baru.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const parsed = await parseJsonBody(request, RegisterSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const session = await registerUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: parsed.data.role,
      phone: parsed.data.phone,
      nip: parsed.data.nip,
      sppgUnit: parsed.data.sppgUnit,
      region: parsed.data.region,
      position: parsed.data.position,
    });
    // Sengaja tidak memasang cookie sesi: pengguna harus login sendiri.
    return NextResponse.json(session.user, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal mendaftar", 409);
  }
}

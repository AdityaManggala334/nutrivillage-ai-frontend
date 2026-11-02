import { NextResponse } from "next/server";
import { AdminLocalCreateSchema } from "@/schemas/admin";
import { createLocal, listLocalCommodities } from "@/server/admin-master";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

function admin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") return { error: jsonError("Hanya admin.", 403) };
  return {};
}

export async function GET(request: Request): Promise<NextResponse> {
  const { error } = admin(request);
  if (error) return error;
  try {
    return NextResponse.json(await listLocalCommodities());
  } catch (err) {
    return backendErrorResponse(err);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const { error } = admin(request);
  if (error) return error;
  const parsed = await parseJsonBody(request, AdminLocalCreateSchema);
  if (!parsed.ok) return parsed.response;
  try {
    await createLocal(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return backendErrorResponse(err);
  }
}

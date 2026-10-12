import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import {
  backendAdminCreate,
  backendAdminList,
  type AdminMasterResource,
} from "@/server/backend-api";
import { backendErrorResponse, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

const RESOURCES = new Set<string>([
  "ingredients",
  "nutrition",
  "recipes",
  "seasons",
  "local",
  "regions",
]);

interface RouteContext {
  readonly params: Promise<{ resource: string }>;
}

function requireAdmin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") {
    return { error: jsonError("Hanya admin yang dapat mengakses data master.", 403) };
  }
  return { user };
}

function resolveResource(raw: string): AdminMasterResource | null {
  return RESOURCES.has(raw) ? (raw as AdminMasterResource) : null;
}

async function readBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** GET /api/admin/[resource] — daftar data master (khusus admin). */
export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;
  const { resource } = await context.params;
  const resolved = resolveResource(resource);
  if (!resolved) return jsonError("Resource tidak dikenal.", 404);
  try {
    const token = getSessionToken(request) as string;
    return NextResponse.json(await backendAdminList(token, resolved));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** POST /api/admin/[resource] — tambah data master (khusus admin). */
export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;
  const { resource } = await context.params;
  const resolved = resolveResource(resource);
  if (!resolved) return jsonError("Resource tidak dikenal.", 404);
  const body = await readBody(request);
  if (body === null) return jsonError("Body JSON tidak valid.", 400);
  try {
    const token = getSessionToken(request) as string;
    return NextResponse.json(await backendAdminCreate(token, resolved, body), { status: 201 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

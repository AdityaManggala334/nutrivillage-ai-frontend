import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import {
  backendAdminDelete,
  backendAdminReplace,
  backendAdminUpdate,
  type AdminMasterResource,
} from "@/server/backend-api";
import { backendErrorResponse, jsonError, readJsonBody } from "@/server/http";

export const dynamic = "force-dynamic";

const RESOURCES = new Set<string>([
  "ingredients",
  "nutrition",
  "recipes",
  "seasons",
  "local",
  "regions",
  "prices",
  "food-safety",
  "articles",
]);

interface RouteContext {
  readonly params: Promise<{ resource: string; id: string }>;
}

function requireAdmin(request: Request) {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return { error: jsonError("Sesi tidak valid. Silakan masuk kembali.", 401) };
  if (user.role !== "admin") {
    return { error: jsonError("Hanya admin yang dapat mengubah data master.", 403) };
  }
  return { user };
}

function resolveResource(raw: string): AdminMasterResource | null {
  return RESOURCES.has(raw) ? (raw as AdminMasterResource) : null;
}

/** PATCH /api/admin/[resource]/[id] — ubah sebagian data master. */
export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;
  const { resource, id } = await context.params;
  const resolved = resolveResource(resource);
  if (!resolved) return jsonError("Resource tidak dikenal.", 404);
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;
  try {
    const token = getSessionToken(request) as string;
    return NextResponse.json(await backendAdminUpdate(token, resolved, id, parsed.data));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** PUT /api/admin/[resource]/[id] — buat/ubah penuh (dipakai nutrisi). */
export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;
  const { resource, id } = await context.params;
  const resolved = resolveResource(resource);
  if (!resolved) return jsonError("Resource tidak dikenal.", 404);
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;
  try {
    const token = getSessionToken(request) as string;
    return NextResponse.json(await backendAdminReplace(token, resolved, id, parsed.data));
  } catch (error) {
    return backendErrorResponse(error);
  }
}

/** DELETE /api/admin/[resource]/[id] — hapus data master. */
export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  const guard = requireAdmin(request);
  if (guard.error) return guard.error;
  const { resource, id } = await context.params;
  const resolved = resolveResource(resource);
  if (!resolved) return jsonError("Resource tidak dikenal.", 404);
  try {
    const token = getSessionToken(request) as string;
    await backendAdminDelete(token, resolved, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

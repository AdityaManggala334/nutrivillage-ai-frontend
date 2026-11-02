import { NextResponse } from "next/server";
import { FoodSafetyInfoSchema, FoodSafetyInputSchema } from "@/schemas/admin";
import { createFoodSafety, listFoodSafety } from "@/server/admin-master";
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
    return NextResponse.json(await listFoodSafety());
  } catch (err) {
    return backendErrorResponse(err);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const { error } = admin(request);
  if (error) return error;
  const parsed = await parseJsonBody(request, FoodSafetyInputSchema);
  if (!parsed.ok) return parsed.response;
  try {
    return NextResponse.json(FoodSafetyInfoSchema.parse(await createFoodSafety(parsed.data)), { status: 201 });
  } catch (err) {
    return backendErrorResponse(err);
  }
}

import { NextResponse } from "next/server";
import { getSessionToken, getUserByToken } from "@/server/auth";
import { backendErrorResponse, jsonError, parseJsonBody } from "@/server/http";
import { listBudgetPoliciesForSession } from "@/server/school-api";
import { z } from "zod";
import { backendUpdateBudgetPolicy } from "@/server/backend-api";

export const dynamic = "force-dynamic";

/** GET /api/budget-policies — kebijakan batas anggaran per porsi (read-only di UI). */
export async function GET(request: Request): Promise<NextResponse> {
  const user = getUserByToken(getSessionToken(request));
  if (!user) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "petugas_sppg" && user.role !== "admin") {
    return jsonError("Akses ditolak untuk peran ini.", 403);
  }

  try {
    return NextResponse.json(await listBudgetPoliciesForSession());
  } catch (error) {
    return backendErrorResponse(error);
  }
}

const UpdateSchema = z.object({
  amountPerPortion: z.number().min(0).nullable(),
  source: z.string().trim().max(255).nullable(),
  verified: z.boolean(),
});

/** PATCH /api/budget-policies?id=.. — admin menetapkan batas anggaran per porsi. */
export async function PATCH(request: Request): Promise<NextResponse> {
  const token = getSessionToken(request);
  const user = getUserByToken(token);
  if (!user || !token) return jsonError("Sesi tidak valid. Silakan masuk kembali.", 401);
  if (user.role !== "admin") return jsonError("Hanya admin yang dapat mengubah kebijakan anggaran.", 403);

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return jsonError("ID kebijakan tidak valid.", 400);

  const parsed = await parseJsonBody(request, UpdateSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const policy = await backendUpdateBudgetPolicy(token, id, {
      amount_per_portion: parsed.data.amountPerPortion,
      source: parsed.data.source,
      verified: parsed.data.verified,
    });
    return NextResponse.json({
      id: policy.id,
      scope: policy.scope,
      label: policy.label,
      amountPerPortion: policy.amount_per_portion,
      source: policy.source,
      verified: policy.verified,
      effectiveDate: policy.effective_date,
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}

import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ message }, { status });
}

type ParseResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly response: NextResponse };

/** Memvalidasi body JSON dengan skema Zod sebelum masuk logika server. */
export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: jsonError("Body JSON tidak valid", 400) };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          message: "Validasi gagal",
          issues: result.error.issues.map((issue) => ({
            path: issue.path.map(String).join("."),
            message: issue.message,
          })),
        },
        { status: 422 },
      ),
    };
  }

  return { ok: true, data: result.data };
}

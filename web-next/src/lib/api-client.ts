import { z } from "zod";

/** Error API dengan status HTTP, dipakai oleh TanStack Query error state. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  if (!response.ok) {
    let message = `Permintaan gagal (HTTP ${response.status})`;
    try {
      const body: unknown = await response.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string"
      ) {
        message = body.message;
      }
    } catch {
      // Biarkan pesan default jika body bukan JSON.
    }
    throw new ApiError(message, response.status);
  }

  const json: unknown = await response.json();
  // Modul 7: validasi runtime dengan Zod SEBELUM data masuk cache TanStack Query.
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new ApiError(
      `Respons API tidak valid: ${result.error.issues[0]?.message ?? "skema tidak cocok"}`,
      502,
    );
  }
  return result.data;
}

export async function apiGet<T>(
  url: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  return parseResponse(response, schema);
}

export async function apiSend<TInput, TResult>(
  url: string,
  method: "POST" | "PATCH" | "PUT",
  body: TInput,
  schema: z.ZodType<TResult>,
): Promise<TResult> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse(response, schema);
}

export async function apiDelete<TResult>(
  url: string,
  schema: z.ZodType<TResult>,
): Promise<TResult> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  return parseResponse(response, schema);
}

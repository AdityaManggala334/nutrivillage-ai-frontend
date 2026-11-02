import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import {
  AdminPriceListSchema,
  AdminPriceSchema,
  type AdminPrice,
  type AdminPriceCreate,
  type AdminPriceUpdate,
  type PriceStatus,
} from "@/schemas/admin";
import {
  BackendError,
  backendCreatePrice,
  backendDeletePrice,
  backendPriceIngredients,
  backendPrices,
  backendUpdatePrice,
  backendVerifyPrice,
  type BackendIngredientOption,
  type BackendPrice,
} from "@/server/backend-api";

/** Service sisi server untuk verifikasi & pengelolaan harga (FR-23). */

async function sessionToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) {
    throw new BackendError("Sesi tidak ditemukan. Silakan masuk kembali.", 401);
  }
  return token;
}

function toPrice(row: BackendPrice): AdminPrice {
  return AdminPriceSchema.parse({
    id: String(row.id),
    ingredientId: row.ingredient_id,
    ingredientName: row.ingredient_name,
    price: row.price,
    unit: row.unit,
    source: row.source,
    recordedAt: row.recorded_date,
    status: row.status,
    sourceType: row.source_type,
  });
}

export async function listAdminPrices(): Promise<AdminPrice[]> {
  return AdminPriceListSchema.parse((await backendPrices(await sessionToken())).map(toPrice));
}

export async function listPriceIngredients(): Promise<BackendIngredientOption[]> {
  return backendPriceIngredients(await sessionToken());
}

export async function createAdminPrice(input: AdminPriceCreate): Promise<AdminPrice> {
  return toPrice(
    await backendCreatePrice(await sessionToken(), {
      ingredient_id: input.ingredientId,
      price: input.price,
      unit: input.unit,
      source: input.source,
      status: input.status,
    }),
  );
}

export async function updateAdminPrice(
  priceId: number,
  input: AdminPriceUpdate,
): Promise<AdminPrice> {
  return toPrice(await backendUpdatePrice(await sessionToken(), priceId, input));
}

export async function verifyAdminPrice(
  priceId: number,
  status: Exclude<PriceStatus, "pending">,
): Promise<AdminPrice> {
  return toPrice(await backendVerifyPrice(await sessionToken(), priceId, status));
}

export async function deleteAdminPrice(priceId: number): Promise<void> {
  await backendDeletePrice(await sessionToken(), priceId);
}

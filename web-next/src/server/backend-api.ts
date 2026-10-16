import "server-only";

import {
  AuthSessionSchema,
  UserSchema,
  type AuthSession,
  type User,
} from "@/schemas/auth";

/**
 * Klien HTTP ke backend FastAPI NutriVillage AI (FR-01).
 * Dipakai Route Handler Next.js sebagai proxy — sehingga cookie, middleware,
 * dan TanStack Query di frontend tetap bekerja tanpa perubahan besar.
 */

const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";
const API_PREFIX = process.env.API_PREFIX ?? "/api/v1";

export class BackendError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

interface BackendSppgOfficer {
  readonly nip: string;
  readonly sppg_unit: string;
  readonly region: string;
  readonly position: string | null;
}

interface BackendUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly created_at: string;
  readonly sppg_officer?: BackendSppgOfficer | null;
}

interface BackendAuthSession {
  readonly user: BackendUser;
  readonly token: string;
}

const RETRYABLE_STATUS = new Set([502, 503, 504]);
// Cukup 1 percobaan ulang dengan jeda pendek — retry panjang justru membuat
// navigasi terasa lambat saat backend free tier sedang bangun (cold start).
const FETCH_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 800;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * fetch dengan retry singkat. Backend free tier (Render) bisa "bangun" dari
 * tidur (cold start) yang tampak sebagai error koneksi / 502-504.
 */
async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (!RETRYABLE_STATUS.has(response.status) || attempt === FETCH_ATTEMPTS) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === FETCH_ATTEMPTS) throw error;
    }
    await sleep(RETRY_BASE_DELAY_MS * attempt);
  }
  throw lastError instanceof Error ? lastError : new Error("Gagal menghubungi backend");
}

async function backendFetch<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response: Response;
  try {
    response = await fetchWithRetry(`${API_BASE_URL}${API_PREFIX}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new BackendError(
      "Server backend sedang tidak dapat dihubungi (mungkin baru menyala). " +
        "Tunggu sebentar lalu coba lagi.",
      503,
    );
  }

  if (!response.ok) {
    let message = `Permintaan ke backend gagal (HTTP ${response.status})`;
    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null && "detail" in body) {
        const { detail } = body as { detail: unknown };
        if (typeof detail === "string") {
          message = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          const first = detail[0] as { msg?: unknown };
          if (typeof first?.msg === "string") message = first.msg;
        }
      }
    } catch {
      // Biarkan pesan default bila body bukan JSON.
    }
    throw new BackendError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** Memetakan payload backend (snake_case, id numerik) ke model frontend. */
function toUser(payload: BackendUser): User {
  return UserSchema.parse({
    id: String(payload.id),
    name: payload.name,
    email: payload.email,
    role: payload.role,
    createdAt: payload.created_at,
    sppgOfficer: payload.sppg_officer
      ? {
          nip: payload.sppg_officer.nip,
          sppgUnit: payload.sppg_officer.sppg_unit,
          region: payload.sppg_officer.region,
          position: payload.sppg_officer.position,
        }
      : null,
  });
}

function toSession(payload: BackendAuthSession): AuthSession {
  return AuthSessionSchema.parse({
    user: toUser(payload.user),
    token: payload.token,
  });
}

export interface BackendRegisterInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: "user" | "petugas_sppg";
  /** Nomor HP opsional (10-15 digit). */
  readonly phone?: string;
  readonly nip?: string;
  readonly sppgUnit?: string;
  readonly region?: string;
  readonly position?: string;
}

export async function backendRegister(
  input: BackendRegisterInput,
): Promise<AuthSession> {
  const payload = await backendFetch<BackendAuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      password: input.password,
      confirm_password: input.password,
      role: input.role,
      phone: input.phone,
      nip: input.nip,
      sppg_unit: input.sppgUnit,
      region: input.region,
      position: input.position,
    }),
  });
  return toSession(payload);
}

export async function backendLogin(input: {
  readonly email: string;
  readonly password: string;
}): Promise<AuthSession> {
  const payload = await backendFetch<BackendAuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: input.email, password: input.password }),
  });
  return toSession(payload);
}

export async function backendUserCount(token: string): Promise<number> {
  const payload = await backendFetch<{ count: number }>(
    "/users/count",
    { method: "GET" },
    token,
  );
  return payload.count;
}

/* ------------------------------------------------------------------ */
/* FR-11: Sekolah & kelompok penerima manfaat                          */
/* ------------------------------------------------------------------ */

export interface BackendBeneficiaryGroup {
  readonly id: number;
  readonly school_id: number;
  readonly level: string;
  readonly label: string | null;
  readonly student_count: number;
  readonly budget_per_portion: number | null;
}

export interface BackendSchool {
  readonly id: number;
  readonly sppg_officer_id: number;
  readonly name: string;
  readonly npsn: string | null;
  readonly address: string | null;
  readonly region: string;
  readonly is_active: boolean;
  readonly groups: BackendBeneficiaryGroup[];
  readonly officer_name?: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface BackendSchoolInput {
  readonly name: string;
  readonly npsn?: string;
  readonly address?: string;
  readonly region: string;
  readonly is_active?: boolean;
}

export interface BackendGroupInput {
  readonly level: string;
  readonly label?: string | null;
  readonly student_count: number;
  readonly budget_per_portion?: number | null;
}

export async function backendListSchools(token: string): Promise<BackendSchool[]> {
  return backendFetch<BackendSchool[]>("/schools", { method: "GET" }, token);
}

export async function backendCreateSchool(
  token: string,
  input: BackendSchoolInput,
): Promise<BackendSchool> {
  return backendFetch<BackendSchool>(
    "/schools",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function backendUpdateSchool(
  token: string,
  schoolId: number,
  input: Partial<BackendSchoolInput>,
): Promise<BackendSchool> {
  return backendFetch<BackendSchool>(
    `/schools/${schoolId}`,
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
}

export async function backendDeleteSchool(token: string, schoolId: number): Promise<void> {
  await backendFetch<undefined>(`/schools/${schoolId}`, { method: "DELETE" }, token);
}

export async function backendCreateGroup(
  token: string,
  schoolId: number,
  input: BackendGroupInput,
): Promise<BackendBeneficiaryGroup> {
  return backendFetch<BackendBeneficiaryGroup>(
    `/schools/${schoolId}/groups`,
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function backendUpdateGroup(
  token: string,
  schoolId: number,
  groupId: number,
  input: Partial<BackendGroupInput>,
): Promise<BackendBeneficiaryGroup> {
  return backendFetch<BackendBeneficiaryGroup>(
    `/schools/${schoolId}/groups/${groupId}`,
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
}

export async function backendDeleteGroup(
  token: string,
  schoolId: number,
  groupId: number,
): Promise<void> {
  await backendFetch<undefined>(
    `/schools/${schoolId}/groups/${groupId}`,
    { method: "DELETE" },
    token,
  );
}

export interface BackendBudgetPolicy {
  readonly id: number;
  readonly scope: string;
  readonly label: string;
  readonly amount_per_portion: number | null;
  readonly source: string | null;
  readonly verified: boolean;
  readonly effective_date: string | null;
}

export async function backendListBudgetPolicies(
  token: string,
): Promise<BackendBudgetPolicy[]> {
  return backendFetch<BackendBudgetPolicy[]>("/budget-policies", { method: "GET" }, token);
}

/* ------------------------------------------------------------------ */
/* Manajemen pengguna (admin)                                          */
/* ------------------------------------------------------------------ */

export interface BackendAdminUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly is_active: boolean;
  readonly created_at: string;
  readonly sppg_officer?: BackendSppgOfficer | null;
  readonly schools_count: number;
}

export interface BackendUserCreateInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: string;
  readonly is_active: boolean;
  readonly nip?: string;
  readonly sppg_unit?: string;
  readonly region?: string;
  readonly position?: string;
}

export interface BackendUserUpdateInput {
  readonly name?: string;
  readonly role?: string;
  readonly is_active?: boolean;
  readonly nip?: string;
  readonly sppg_unit?: string;
  readonly region?: string;
  readonly position?: string;
}

export async function backendListUsers(token: string): Promise<BackendAdminUser[]> {
  return backendFetch<BackendAdminUser[]>("/users", { method: "GET" }, token);
}

export async function backendCreateUser(
  token: string,
  input: BackendUserCreateInput,
): Promise<BackendAdminUser> {
  return backendFetch<BackendAdminUser>(
    "/users",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function backendUpdateUser(
  token: string,
  userId: number,
  input: BackendUserUpdateInput,
): Promise<BackendAdminUser> {
  return backendFetch<BackendAdminUser>(
    `/users/${userId}`,
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
}

/* ------------------------------------------------------------------ */
/* Data master admin (bahan, nutrisi, menu, musim, komoditas lokal)    */
/* ------------------------------------------------------------------ */

export type AdminMasterResource =
  | "ingredients"
  | "nutrition"
  | "recipes"
  | "seasons"
  | "local"
  | "regions"
  | "prices"
  | "food-safety"
  | "articles";

export async function backendAdminList(
  token: string,
  resource: AdminMasterResource,
): Promise<unknown[]> {
  return backendFetch<unknown[]>(`/admin/${resource}`, { method: "GET" }, token);
}

export async function backendAdminCreate(
  token: string,
  resource: AdminMasterResource,
  body: unknown,
): Promise<unknown> {
  return backendFetch<unknown>(
    `/admin/${resource}`,
    { method: "POST", body: JSON.stringify(body) },
    token,
  );
}

export async function backendAdminUpdate(
  token: string,
  resource: AdminMasterResource,
  id: number | string,
  body: unknown,
): Promise<unknown> {
  return backendFetch<unknown>(
    `/admin/${resource}/${id}`,
    { method: "PATCH", body: JSON.stringify(body) },
    token,
  );
}

export async function backendAdminReplace(
  token: string,
  resource: AdminMasterResource,
  id: number | string,
  body: unknown,
): Promise<unknown> {
  return backendFetch<unknown>(
    `/admin/${resource}/${id}`,
    { method: "PUT", body: JSON.stringify(body) },
    token,
  );
}

export async function backendAdminDelete(
  token: string,
  resource: AdminMasterResource,
  id: number | string,
): Promise<void> {
  await backendFetch<undefined>(`/admin/${resource}/${id}`, { method: "DELETE" }, token);
}

/* ------------------------------------------------------------------ */
/* Profil keluarga (FR-02)                                             */
/* ------------------------------------------------------------------ */

export interface BackendFamilyMember {
  readonly id: number;
  readonly name: string | null;
  readonly age: number;
  readonly age_group: string | null;
  readonly gender: string | null;
  readonly weight_kg: number;
  readonly activity_level: string;
  readonly allergies: string[];
}

export interface BackendFamilyProfile {
  readonly user_id: number;
  readonly daily_budget: number;
  readonly region: string;
  readonly preferences: string[];
  readonly avoided_ingredients: string[];
  readonly onboarded: boolean;
  readonly family_count: number;
  readonly members: BackendFamilyMember[];
  readonly updated_at: string;
}

export interface BackendFamilyProfileInput {
  readonly daily_budget: number;
  readonly region: string;
  readonly preferences: string[];
  readonly avoided_ingredients: string[];
  readonly onboarded: boolean;
  readonly members: Array<{
    readonly name: string | null;
    readonly age: number;
    readonly age_group: string;
    readonly gender: string | null;
    readonly weight_kg: number;
    readonly activity_level: string;
    readonly allergies: string[];
  }>;
}

export async function backendGetProfile(
  token: string,
): Promise<BackendFamilyProfile | null> {
  return backendFetch<BackendFamilyProfile | null>("/profile", { method: "GET" }, token);
}

export async function backendSaveProfile(
  token: string,
  input: BackendFamilyProfileInput,
): Promise<BackendFamilyProfile> {
  return backendFetch<BackendFamilyProfile>(
    "/profile",
    { method: "PUT", body: JSON.stringify(input) },
    token,
  );
}

/* ------------------------------------------------------------------ */
/* Katalog resep publik (FR-10)                                        */
/* ------------------------------------------------------------------ */

export interface BackendRecipeIngredient {
  readonly id: number;
  readonly ingredient_id: number | null;
  readonly name: string;
  readonly quantity: number;
  readonly unit: string;
  readonly estimated_price: number;
  readonly is_pantry: boolean;
  readonly note?: string | null;
}

export interface BackendRecipeNutrition {
  readonly calories: number;
  readonly protein: number;
  readonly carbohydrates: number;
  readonly fat: number;
  readonly fiber: number;
}

export interface BackendRecipe {
  readonly id: number;
  readonly name: string;
  readonly category: string;
  readonly description: string | null;
  readonly servings: number;
  readonly cooking_time_min: number;
  readonly steps: string[];
  readonly tags: string[];
  readonly image_key: string | null;
  readonly image_alt: string | null;
  readonly is_local: boolean;
  readonly in_season: boolean;
  readonly is_vegetarian: boolean;
  readonly estimated_cost: number;
  readonly price_updated_at: string | null;
  readonly nutrition: BackendRecipeNutrition | null;
  readonly ingredients: BackendRecipeIngredient[];
}

export async function backendListRecipes(): Promise<BackendRecipe[]> {
  return backendFetch<BackendRecipe[]>("/recipes", { method: "GET" });
}

export async function backendGetRecipe(id: number | string): Promise<BackendRecipe> {
  return backendFetch<BackendRecipe>(`/recipes/${id}`, { method: "GET" });
}

/* ------------------------------------------------------------------ */
/* Riwayat & favorit (FR-04)                                           */
/* ------------------------------------------------------------------ */

export interface BackendHistoryEntry {
  readonly id: number;
  readonly kind: string;
  readonly note: string;
  readonly saved_at: string;
  readonly favorite: boolean;
  readonly recipe: BackendRecipe | null;
}

export async function backendListHistory(
  token: string,
  filter: string,
): Promise<BackendHistoryEntry[]> {
  return backendFetch<BackendHistoryEntry[]>(
    `/history?filter=${encodeURIComponent(filter)}`,
    { method: "GET" },
    token,
  );
}

export async function backendSaveHistory(
  token: string,
  input: { readonly recipe_id: number; readonly kind: string; readonly note: string },
): Promise<BackendHistoryEntry> {
  return backendFetch<BackendHistoryEntry>(
    "/history",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function backendDeleteHistory(token: string, id: number | string): Promise<void> {
  await backendFetch<undefined>(`/history/${id}`, { method: "DELETE" }, token);
}

export async function backendSetHistoryFavorite(
  token: string,
  id: number | string,
  favorite: boolean,
): Promise<BackendHistoryEntry> {
  return backendFetch<BackendHistoryEntry>(
    `/history/${id}`,
    { method: "PATCH", body: JSON.stringify({ favorite }) },
    token,
  );
}

/* ------------------------------------------------------------------ */
/* Harga pangan, scraper & statistik admin                             */
/* ------------------------------------------------------------------ */

export interface BackendPrice {
  readonly id: number;
  readonly ingredient_id: number;
  readonly ingredient_name: string;
  readonly region_id: number | null;
  readonly price: number;
  readonly unit: string;
  readonly recorded_date: string;
  readonly source_type: string;
  readonly source: string;
  readonly status: string;
  readonly created_at: string;
}

export async function backendListPrices(token: string): Promise<BackendPrice[]> {
  return backendFetch<BackendPrice[]>("/admin/prices", { method: "GET" }, token);
}

export async function backendVerifyPrice(
  token: string,
  priceId: number,
  status: string,
  note?: string,
): Promise<BackendPrice> {
  return backendFetch<BackendPrice>(
    `/admin/prices/${priceId}/verify`,
    { method: "POST", body: JSON.stringify({ status, note: note ?? null }) },
    token,
  );
}

export interface BackendScraperRun {
  readonly id: number;
  readonly source: string;
  readonly scheduled_at: string | null;
  readonly started_at: string | null;
  readonly finished_at: string | null;
  readonly status: string;
  readonly items_count: number;
  readonly error_message: string | null;
}

export async function backendListScraperRuns(token: string): Promise<BackendScraperRun[]> {
  return backendFetch<BackendScraperRun[]>("/admin/scraper-runs", { method: "GET" }, token);
}

export interface BackendAdminStats {
  readonly ingredients: number;
  readonly recipes: number;
  readonly pending_prices: number;
  readonly approved_prices: number;
  readonly users: number;
  readonly scraper_failures: number;
}

export async function backendAdminStats(token: string): Promise<BackendAdminStats> {
  return backendFetch<BackendAdminStats>("/admin/stats", { method: "GET" }, token);
}

/* ------------------------------------------------------------------ */
/* Keamanan pangan & artikel & notifikasi                              */
/* ------------------------------------------------------------------ */

export interface BackendFoodSafety {
  readonly id: number;
  readonly code: string | null;
  readonly topic: string;
  readonly risk_type: string;
  readonly hazard: string;
  readonly handling: string;
  readonly source: string;
  readonly verification: string;
}

/** Publik: hanya entri yang sudah diverifikasi admin. */
export async function backendListVerifiedFoodSafety(): Promise<BackendFoodSafety[]> {
  return backendFetch<BackendFoodSafety[]>("/food-safety", { method: "GET" });
}

export interface BackendArticle {
  readonly id: number;
  readonly code: string | null;
  readonly title: string;
  readonly excerpt: string;
  readonly category: string;
  readonly read_minutes: number;
  readonly body: string[];
  readonly created_at: string;
}

export async function backendListArticles(): Promise<BackendArticle[]> {
  return backendFetch<BackendArticle[]>("/articles", { method: "GET" });
}

export async function backendGetArticle(
  id: number | string,
): Promise<BackendArticle | null> {
  try {
    return await backendFetch<BackendArticle>(`/articles/${id}`, { method: "GET" });
  } catch (error) {
    // 404 = artikel tidak ada; biarkan pemanggil memanggil notFound().
    if (error instanceof BackendError && error.status === 404) return null;
    throw error;
  }
}

export interface BackendNotification {
  readonly id: number;
  readonly user_id: number | null;
  readonly title: string;
  readonly message: string;
  readonly kind: string;
  readonly read: boolean;
  readonly created_at: string;
}

/**
 * Daftar notifikasi. Token bersifat opsional: tanpa sesi backend tetap
 * menerima notifikasi global.
 */
export async function backendListNotifications(
  token?: string,
): Promise<BackendNotification[]> {
  return backendFetch<BackendNotification[]>(
    "/notifications",
    { method: "GET" },
    token || undefined,
  );
}

/* ------------------------------------------------------------------ */
/* Akun halaman Profil (FR-02)                                         */
/* ------------------------------------------------------------------ */

export interface BackendAccount {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly role: string;
  readonly created_at: string;
  readonly notifications_enabled: boolean;
}

export async function backendGetAccount(token: string): Promise<BackendAccount> {
  return backendFetch<BackendAccount>("/account", { method: "GET" }, token);
}

export interface BackendAccountInput {
  readonly name?: string;
  readonly phone?: string | null;
  readonly notifications_enabled?: boolean;
}

export async function backendUpdateAccount(
  token: string,
  input: BackendAccountInput,
): Promise<BackendAccount> {
  return backendFetch<BackendAccount>(
    "/account",
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
}

export async function backendChangePassword(
  token: string,
  input: {
    readonly current_password: string;
    readonly new_password: string;
    readonly confirm_password: string;
  },
): Promise<void> {
  await backendFetch<undefined>(
    "/account/password",
    { method: "PUT", body: JSON.stringify(input) },
    token,
  );
}

/* ------------------------------------------------------------------ */
/* Meal planner & daftar belanja (FR-15 s.d. FR-17, FR-26 s.d. FR-29) */
/* ------------------------------------------------------------------ */

export interface BackendMealPlanEntry {
  readonly id: number;
  readonly week_id: string;
  readonly day: string;
  readonly slot: string;
  readonly note: string;
  readonly recipe: BackendRecipe | null;
}

export async function backendListMealPlans(
  token: string,
  weekId: string,
): Promise<BackendMealPlanEntry[]> {
  return backendFetch<BackendMealPlanEntry[]>(
    `/meal-plans?week_id=${encodeURIComponent(weekId)}`,
    { method: "GET" },
    token,
  );
}

export async function backendAssignMealPlan(
  token: string,
  input: {
    readonly week_id: string;
    readonly day: string;
    readonly slot: string;
    readonly recipe_id: number;
    readonly note: string;
  },
): Promise<BackendMealPlanEntry> {
  return backendFetch<BackendMealPlanEntry>(
    "/meal-plans",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function backendRemoveMealPlan(
  token: string,
  entryId: number | string,
): Promise<{ readonly entry_id: number }> {
  return backendFetch<{ entry_id: number }>(
    `/meal-plans?entry_id=${encodeURIComponent(String(entryId))}`,
    { method: "DELETE" },
    token,
  );
}

export interface BackendShoppingItem {
  readonly id: number;
  readonly name: string;
  readonly quantity: number;
  readonly unit: string;
  readonly estimated_price: number;
  readonly checked: boolean;
}

export interface BackendShoppingList {
  readonly id: number;
  readonly title: string;
  readonly note: string | null;
  readonly total_estimated_cost: number;
  readonly generated_at: string;
  readonly items: readonly BackendShoppingItem[];
}

export async function backendGetShoppingList(token: string): Promise<BackendShoppingList> {
  return backendFetch<BackendShoppingList>("/shopping-list", { method: "GET" }, token);
}

export async function backendGenerateShoppingList(
  token: string,
  input: { readonly week_id?: string; readonly recipe_id?: number },
): Promise<BackendShoppingList> {
  return backendFetch<BackendShoppingList>(
    "/shopping-list",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function backendPatchShoppingList(
  token: string,
  input: { readonly item_id?: number; readonly checked?: boolean; readonly note?: string },
): Promise<BackendShoppingList> {
  return backendFetch<BackendShoppingList>(
    "/shopping-list",
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
}

export async function backendDeleteShoppingItem(
  token: string,
  itemId: number | string,
): Promise<BackendShoppingList> {
  return backendFetch<BackendShoppingList>(
    `/shopping-list?item_id=${encodeURIComponent(String(itemId))}`,
    { method: "DELETE" },
    token,
  );
}

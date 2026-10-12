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
  | "regions";

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

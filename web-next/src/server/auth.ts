import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE } from "@/lib/constants";
import {
  UserSchema,
  type RegistrableRole,
  type User,
  type UserRole,
} from "@/schemas/auth";
import {
  familyProfileFormSchema,
  type FamilyProfile,
} from "@/schemas/profile";
import {
  backendLogin,
  backendRegister,
  backendUserCount,
  type BackendRegisterInput,
} from "@/server/backend-api";

/**
 * Autentikasi sisi server (FR-01, FR-02, FR-03, FR-05).
 *
 * Registrasi & login sekarang memakai backend FastAPI + MySQL (lihat
 * `server/backend-api.ts`). Verifikasi sesi dilakukan dengan memvalidasi JWT
 * secara sinkron (HS256) agar tetap kompatibel dengan pemanggil yang bersifat
 * sinkron (Route Handler, Server Component, rate limiter). Data profil keluarga
 * masih disimpan in-memory pada fase ini.
 */

const JWT_SECRET = process.env.JWT_SECRET ?? "nutrivillage-dev-secret-change-me";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

const toUser = (stored: StoredUser): User =>
  UserSchema.parse({
    id: stored.id,
    name: stored.name,
    email: stored.email,
    role: stored.role,
    createdAt: stored.createdAt,
  });

interface AuthStores {
  usersByEmail: Map<string, StoredUser>;
  usersById: Map<string, StoredUser>;
  sessions: Map<string, string>;
  profiles: Map<string, FamilyProfile>;
  phones: Map<string, string>;
}

/**
 * Store in-memory pada `globalThis` agar dibagi seluruh Route Handler dalam satu
 * proses (profil keluarga, data diri, dan sesi tamu). Data akun persisten ada di
 * MySQL melalui FastAPI.
 */
const globalForAuth = globalThis as unknown as { __nutrivillageAuth?: AuthStores };

const stores: AuthStores =
  globalForAuth.__nutrivillageAuth ??
  (globalForAuth.__nutrivillageAuth = {
    usersByEmail: new Map<string, StoredUser>(),
    usersById: new Map<string, StoredUser>(),
    sessions: new Map<string, string>(),
    profiles: new Map<string, FamilyProfile>(),
    phones: new Map<string, string>(),
  });

const { usersByEmail, usersById, sessions, profiles, phones } = stores;

/** Menyimpan salinan user (dari JWT/login) agar `getUserContact` dapat membacanya. */
const cacheUser = (user: User): void => {
  const stored: StoredUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: "",
    role: user.role,
    createdAt: user.createdAt,
  };
  usersById.set(user.id, stored);
  usersByEmail.set(user.email, stored);
};

const createSession = (userId: string): string => {
  const token = `nv-${crypto.randomUUID()}`;
  sessions.set(token, userId);
  return token;
};

/** Verifikasi JWT HS256 secara sinkron (tanpa dependensi tambahan). */
function decodeJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts as [string, string, string];

  const expected = createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expected, "base64url");
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Record<string, unknown>;
    const exp = claims["exp"];
    if (typeof exp === "number" && exp * 1000 < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

export interface AuthResult {
  readonly user: User;
  readonly token: string;
}

export interface RegisterUserInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role?: RegistrableRole;
  readonly nip?: string;
  readonly sppgUnit?: string;
  readonly region?: string;
  readonly position?: string;
}

export async function registerUser(input: RegisterUserInput): Promise<AuthResult> {
  const payload: BackendRegisterInput = {
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role ?? "user",
    nip: input.nip,
    sppgUnit: input.sppgUnit,
    region: input.region,
    position: input.position,
  };
  const session = await backendRegister(payload);
  cacheUser(session.user);
  return { user: session.user, token: session.token };
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const session = await backendLogin(input);
  cacheUser(session.user);
  return { user: session.user, token: session.token };
}

export function createGuestSession(): AuthResult {
  const stored: StoredUser = {
    id: "user-guest",
    name: "Tamu",
    email: "tamu@nutrivillage.ai",
    passwordHash: "",
    role: "guest",
    createdAt: new Date().toISOString(),
  };
  usersById.set(stored.id, stored);
  return { user: toUser(stored), token: createSession(stored.id) };
}

export function getUserByToken(token: string | null): User | null {
  if (!token) return null;

  // Sesi lokal (tamu/in-memory).
  const localUserId = sessions.get(token);
  if (localUserId) {
    const stored = usersById.get(localUserId);
    return stored ? toUser(stored) : null;
  }

  // Sesi backend (JWT).
  const claims = decodeJwtClaims(token);
  if (!claims) return null;
  try {
    const user = UserSchema.parse({
      id: String(claims["sub"]),
      name: claims["name"],
      email: claims["email"],
      role: claims["role"],
      createdAt: claims["created_at"],
    });
    cacheUser(user);
    return user;
  } catch {
    return null;
  }
}

/** Membaca cookie session dari header request (Route Handler). */
export function getSessionToken(request: Request): string | null {  const header = request.headers.get("cookie");
  if (!header) return null;
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
}

/**
 * Mengambil ID pengguna dari request untuk isolasi data per pengguna.
 * Tamu memakai `user-guest`; tanpa sesi memakai `anon` (tidak dibagikan).
 */
export function getUserIdFromRequest(request: Request): string {
  const user = getUserByToken(getSessionToken(request));
  return user?.id ?? "anon";
}

export async function saveFamilyProfile(
  userId: string,
  rawInput: unknown,
): Promise<FamilyProfile> {
  const parsed = familyProfileFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error("Data keluarga belum valid. Periksa kembali isian Anda.");
  }

  const profile: FamilyProfile = {
    userId,
    dailyBudget: parsed.data.dailyBudget,
    region: parsed.data.region,
    members: parsed.data.members.map((member) => ({
      id: `member-${crypto.randomUUID()}`,
      name: member.name,
      age: member.age,
      ageGroup: member.ageGroup,
      gender: member.gender,
      weightKg: member.weightKg,
      activityLevel: member.activityLevel,
      allergies: member.allergies,
    })),
    preferences: parsed.data.preferences,
    avoidedIngredients: parsed.data.avoidedIngredients,
    onboarded: true,
    updatedAt: new Date().toISOString(),
  };

  profiles.set(userId, profile);
  return profile;
}

export function getFamilyProfile(userId: string): FamilyProfile | null {
  return profiles.get(userId) ?? null;
}

/* ------------------------------------------------------------------ */
/* Data diri pengguna (FR-18)                                          */
/* ------------------------------------------------------------------ */

export interface UserContact {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
}

export function getUserContact(userId: string): UserContact | null {
  const stored = usersById.get(userId);
  if (!stored) return null;
  return { name: stored.name, email: stored.email, phone: phones.get(userId) ?? "" };
}

export async function updateUserContact(
  userId: string,
  input: UserContact,
): Promise<UserContact> {
  const stored = usersById.get(userId);
  if (!stored) throw new Error("Pengguna tidak ditemukan");

  const nextEmail = input.email.trim().toLowerCase();
  if (stored.email !== nextEmail) {
    usersByEmail.delete(stored.email);
    stored.email = nextEmail;
    usersByEmail.set(nextEmail, stored);
  }
  stored.name = input.name;
  phones.set(userId, input.phone);
  return { name: stored.name, email: stored.email, phone: input.phone };
}

/** Total pengguna terdaftar (dibaca dari MySQL melalui backend, khusus admin). */
export async function countUsers(): Promise<number> {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) return 0;
  try {
    return await backendUserCount(token);
  } catch {
    return 0;
  }
}

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
  backendLogin,
  backendRegister,
  backendUserCount,
  type BackendRegisterInput,
} from "@/server/backend-api";

/**
 * Autentikasi sisi server (FR-01).
 *
 * Registrasi & login memakai backend FastAPI + MySQL (lihat
 * `server/backend-api.ts`). Verifikasi sesi dilakukan dengan memvalidasi JWT
 * secara sinkron (HS256). Profil keluarga (FR-02) kini tersimpan di database
 * melalui route `/api/profile`.
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
  usersById: Map<string, StoredUser>;
  sessions: Map<string, string>;
}

/**
 * Store in-memory pada `globalThis` hanya untuk hal-hal yang memang tidak
 * punya rumah di database: cache klaim JWT & sesi tamu (yang sengaja tanpa
 * akun). Data diri pengguna (nama, HP, notifikasi) tersimpan di MySQL via
 * FastAPI — lihat route `/api/account`.
 */
const globalForAuth = globalThis as unknown as { __nutrivillageAuth?: AuthStores };

const stores: AuthStores =
  globalForAuth.__nutrivillageAuth ??
  (globalForAuth.__nutrivillageAuth = {
    usersById: new Map<string, StoredUser>(),
    sessions: new Map<string, string>(),
  });

const { usersById, sessions } = stores;

/** Menyimpan salinan user (dari JWT/login) agar sesi backend terbaca cepat. */
const cacheUser = (user: User): void => {
  usersById.set(user.id, {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: "",
    role: user.role,
    createdAt: user.createdAt,
  });
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
  /** Nomor HP opsional (10-15 digit) — disimpan pada `users.phone`. */
  readonly phone?: string;
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
    phone: input.phone,
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

/* ------------------------------------------------------------------ */
/* Data diri pengguna (FR-18) — lihat route `/api/account`             */
/* ------------------------------------------------------------------ */
/* Data diri (nama, nomor HP, notifikasi) tidak lagi disimpan di memori:
   route `/api/account` membaca & menulis ke database via backend FastAPI. */

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

import "server-only";

import { SESSION_COOKIE } from "@/lib/constants";
import { UserSchema, type User } from "@/schemas/auth";
import {
  familyProfileFormSchema,
  type FamilyProfile,
} from "@/schemas/profile";

/**
 * Mock autentikasi & penyimpanan profil sisi server (FR-01, FR-02, FR-03, FR-05).
 * Data in-memory — cukup untuk simulasi front-end tanpa backend nyata.
 */

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin" | "guest";
  createdAt: string;
}

/** Hash sederhana (demo saja, bukan untuk produksi). */
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let index = 0; index < password.length; index += 1) {
    hash = (hash << 5) - hash + password.charCodeAt(index);
    hash |= 0;
  }
  return `nv-${Math.abs(hash).toString(36)}`;
};

const toUser = (stored: StoredUser): User =>
  UserSchema.parse({
    id: stored.id,
    name: stored.name,
    email: stored.email,
    role: stored.role,
    createdAt: stored.createdAt,
  });

const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();
const sessions = new Map<string, string>(); // token -> userId
const profiles = new Map<string, FamilyProfile>(); // userId -> profile
const phones = new Map<string, string>(); // userId -> nomor HP (FR-18)

/** Seed akun demo agar halaman login bisa langsung dicoba. */
const seedUser: StoredUser = {
  id: "user-demo",
  name: "Keluarga Madiun",
  email: "keluarga@nutrivillage.id",
  passwordHash: hashPassword("nutrivillage"),
  role: "user",
  createdAt: new Date().toISOString(),
};
usersByEmail.set(seedUser.email, seedUser);
usersById.set(seedUser.id, seedUser);

/** Akun admin demo (RBAC): hanya role admin yang boleh mengakses panel admin. */
const seedAdmin: StoredUser = {
  id: "user-admin",
  name: "Admin NutriVillage",
  email: "admin@nutrivillage.id",
  passwordHash: hashPassword("admin12345"),
  role: "admin",
  createdAt: new Date().toISOString(),
};
usersByEmail.set(seedAdmin.email, seedAdmin);
usersById.set(seedAdmin.id, seedAdmin);

const createSession = (userId: string): string => {
  const token = `nv-${crypto.randomUUID()}`;
  sessions.set(token, userId);
  return token;
};

export interface AuthResult {
  readonly user: User;
  readonly token: string;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  await delay(900);
  const email = input.email.trim().toLowerCase();
  if (usersByEmail.has(email)) {
    throw new Error("Email sudah terdaftar. Silakan login.");
  }
  const stored: StoredUser = {
    id: `user-${crypto.randomUUID()}`,
    name: input.name,
    email,
    passwordHash: hashPassword(input.password),
    role: "user",
    createdAt: new Date().toISOString(),
  };
  usersByEmail.set(email, stored);
  usersById.set(stored.id, stored);
  return { user: toUser(stored), token: createSession(stored.id) };
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  await delay(700);
  const email = input.email.trim().toLowerCase();
  const found = usersByEmail.get(email);
  if (!found || found.passwordHash !== hashPassword(input.password)) {
    throw new Error("Email atau password salah.");
  }
  return { user: toUser(found), token: createSession(found.id) };
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
  const userId = sessions.get(token);
  if (!userId) return null;
  const stored = usersById.get(userId);
  return stored ? toUser(stored) : null;
}

/** Membaca cookie session dari header request (Route Handler). */
export function getSessionToken(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
}

export async function saveFamilyProfile(
  userId: string,
  rawInput: unknown,
): Promise<FamilyProfile> {
  const parsed = familyProfileFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error("Data keluarga belum valid. Periksa kembali isian Anda.");
  }
  await delay(900);

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
  await delay(500);
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

export function countUsers(): number {
  return usersById.size;
}

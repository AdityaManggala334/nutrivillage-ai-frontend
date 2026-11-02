import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import {
  AdminUserSchema,
  type AdminUser,
  type AdminUserCreateBody,
  type AdminUserUpdateBody,
} from "@/schemas/admin";
import {
  BackendError,
  backendCreateUser,
  backendListUsers,
  backendUpdateUser,
  type BackendAdminUser,
} from "@/server/backend-api";

/** Lapisan service sisi server untuk manajemen pengguna oleh admin. */

async function sessionToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) {
    throw new BackendError("Sesi tidak ditemukan. Silakan masuk kembali.", 401);
  }
  return token;
}

function toAdminUser(user: BackendAdminUser): AdminUser {
  return AdminUserSchema.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
    sppgOfficer: user.sppg_officer
      ? {
          nip: user.sppg_officer.nip,
          sppgUnit: user.sppg_officer.sppg_unit,
          region: user.sppg_officer.region,
          position: user.sppg_officer.position,
        }
      : null,
    schoolsCount: user.schools_count,
  });
}

export async function listUsersForSession(): Promise<AdminUser[]> {
  const token = await sessionToken();
  const users = await backendListUsers(token);
  return users.map(toAdminUser);
}

export async function createUserForSession(input: AdminUserCreateBody): Promise<AdminUser> {
  const token = await sessionToken();
  const user = await backendCreateUser(token, {
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    is_active: input.isActive,
    nip: input.nip,
    sppg_unit: input.sppgUnit,
    region: input.region,
    position: input.position,
  });
  return toAdminUser(user);
}

export async function updateUserForSession(
  userId: number,
  input: AdminUserUpdateBody,
): Promise<AdminUser> {
  const token = await sessionToken();
  const user = await backendUpdateUser(token, userId, {
    name: input.name,
    role: input.role,
    is_active: input.isActive,
    nip: input.nip,
    sppg_unit: input.sppgUnit,
    region: input.region,
    position: input.position,
  });
  return toAdminUser(user);
}

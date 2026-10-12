import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";
import {
  BudgetPolicySchema,
  SchoolSchema,
  type BudgetPolicy,
  type School,
} from "@/schemas/school";
import {
  BackendError,
  backendCreateGroup,
  backendCreateSchool,
  backendDeleteGroup,
  backendDeleteSchool,
  backendListBudgetPolicies,
  backendListSchools,
  backendUpdateGroup,
  backendUpdateSchool,
  type BackendBeneficiaryGroup,
  type BackendSchool,
} from "@/server/backend-api";

/**
 * Lapisan service sisi server untuk FR-11. Membaca token sesi dari cookie,
 * memanggil backend FastAPI, lalu memetakan (snake_case → model frontend)
 * dan memvalidasi dengan Zod sebelum diteruskan ke Route Handler.
 */

async function sessionToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  if (!token) {
    throw new BackendError("Sesi tidak ditemukan. Silakan masuk kembali.", 401);
  }
  return token;
}

function toGroup(group: BackendBeneficiaryGroup) {
  return {
    id: group.id,
    schoolId: group.school_id,
    level: group.level,
    label: group.label,
    studentCount: group.student_count,
    budgetPerPortion: group.budget_per_portion,
  };
}

function toSchool(school: BackendSchool): School {
  return SchoolSchema.parse({
    id: school.id,
    name: school.name,
    npsn: school.npsn,
    address: school.address,
    region: school.region,
    isActive: school.is_active,
    officerName: school.officer_name ?? null,
    groups: (school.groups ?? []).map(toGroup),
    createdAt: school.created_at,
    updatedAt: school.updated_at,
  });
}

export interface SchoolInput {
  readonly name: string;
  readonly npsn?: string;
  readonly address?: string;
  readonly region: string;
  readonly isActive?: boolean;
}

export interface GroupInput {
  readonly level: string;
  readonly label?: string | null;
  readonly studentCount: number;
  readonly budgetPerPortion?: number | null;
}

export async function listSchoolsForSession(): Promise<School[]> {
  const token = await sessionToken();
  const schools = await backendListSchools(token);
  return schools.map(toSchool);
}

export async function createSchoolForSession(input: SchoolInput): Promise<School> {
  const token = await sessionToken();
  const school = await backendCreateSchool(token, {
    name: input.name,
    npsn: input.npsn,
    address: input.address,
    region: input.region,
    is_active: input.isActive,
  });
  return toSchool(school);
}

export async function updateSchoolForSession(
  schoolId: number,
  input: Partial<SchoolInput>,
): Promise<School> {
  const token = await sessionToken();
  const school = await backendUpdateSchool(token, schoolId, {
    name: input.name,
    npsn: input.npsn,
    address: input.address,
    region: input.region,
    is_active: input.isActive,
  });
  return toSchool(school);
}

export async function deleteSchoolForSession(schoolId: number): Promise<void> {
  const token = await sessionToken();
  await backendDeleteSchool(token, schoolId);
}

export async function createGroupForSession(
  schoolId: number,
  input: GroupInput,
) {
  const token = await sessionToken();
  const group = await backendCreateGroup(token, schoolId, {
    level: input.level,
    label: input.label,
    student_count: input.studentCount,
    budget_per_portion: input.budgetPerPortion,
  });
  return toGroup(group);
}

export async function updateGroupForSession(
  schoolId: number,
  groupId: number,
  input: Partial<GroupInput>,
) {
  const token = await sessionToken();
  const group = await backendUpdateGroup(token, schoolId, groupId, {
    level: input.level,
    label: input.label,
    student_count: input.studentCount,
    budget_per_portion: input.budgetPerPortion,
  });
  return toGroup(group);
}

export async function deleteGroupForSession(
  schoolId: number,
  groupId: number,
): Promise<void> {
  const token = await sessionToken();
  await backendDeleteGroup(token, schoolId, groupId);
}

/**
 * Menyinkronkan kelompok penerima sebuah sekolah dengan daftar jenjang yang
 * diinginkan (mis. dari form "jumlah siswa per jenjang"). Kelompok `lainnya`
 * tidak diubah. Jenjang yang dihilangkan dari daftar akan dihapus.
 */
export async function syncSchoolGroupsForSession(
  schoolId: number,
  desired: ReadonlyArray<{ level: string; studentCount: number }>,
): Promise<void> {
  const token = await sessionToken();
  const schools = await backendListSchools(token);
  const current = schools.find((school) => school.id === schoolId);
  if (!current) throw new BackendError("Sekolah tidak ditemukan.", 404);

  const desiredByLevel = new Map(desired.map((item) => [item.level, item.studentCount]));

  for (const group of current.groups ?? []) {
    if (group.level === "lainnya") continue; // kelompok kustom dipertahankan
    if (desiredByLevel.has(group.level)) {
      const studentCount = desiredByLevel.get(group.level) ?? 0;
      desiredByLevel.delete(group.level);
      if (group.student_count !== studentCount) {
        await backendUpdateGroup(token, schoolId, group.id, { student_count: studentCount });
      }
    } else {
      await backendDeleteGroup(token, schoolId, group.id);
    }
  }

  for (const [level, studentCount] of desiredByLevel) {
    if (studentCount <= 0) continue;
    await backendCreateGroup(token, schoolId, { level, label: null, student_count: studentCount });
  }
}

export async function listBudgetPoliciesForSession(): Promise<BudgetPolicy[]> {
  const token = await sessionToken();
  const policies = await backendListBudgetPolicies(token);
  return policies.map((policy) =>
    BudgetPolicySchema.parse({
      id: policy.id,
      scope: policy.scope,
      label: policy.label,
      amountPerPortion: policy.amount_per_portion,
      source: policy.source,
      verified: policy.verified,
      effectiveDate: policy.effective_date,
    }),
  );
}

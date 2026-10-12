import { z } from "zod";

/**
 * school.ts
 * Skema FR-11: pengelolaan sekolah & kelompok penerima manfaat untuk Petugas SPPG.
 * Angka dari DOM di-`coerce`; tipe diturunkan dengan `z.infer`.
 */

export const BeneficiaryLevelSchema = z.enum([
  "sd_1_3",
  "sd_4_6",
  "smp",
  "sma",
  "lainnya",
]);
export type BeneficiaryLevel = z.infer<typeof BeneficiaryLevelSchema>;

export const BENEFICIARY_LEVEL_LABELS: Readonly<Record<BeneficiaryLevel, string>> = {
  sd_1_3: "SD kelas 1–3",
  sd_4_6: "SD kelas 4–6",
  smp: "SMP",
  sma: "SMA",
  lainnya: "Kelompok lain",
};

export const BENEFICIARY_LEVEL_ORDER: readonly BeneficiaryLevel[] = [
  "sd_1_3",
  "sd_4_6",
  "smp",
  "sma",
  "lainnya",
];

/* ------------------------------------------------------------------ */
/* Model respons API                                                   */
/* ------------------------------------------------------------------ */

export const BeneficiaryGroupSchema = z.object({
  id: z.number().int().positive(),
  schoolId: z.number().int().positive(),
  level: BeneficiaryLevelSchema,
  label: z.string().nullable(),
  studentCount: z.number().int().min(0),
  budgetPerPortion: z.number().nullable(),
});
export type BeneficiaryGroup = z.infer<typeof BeneficiaryGroupSchema>;

export const SchoolSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  npsn: z.string().nullable(),
  address: z.string().nullable(),
  region: z.string().min(1),
  isActive: z.boolean(),
  officerName: z.string().nullable().optional(),
  groups: z.array(BeneficiaryGroupSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
export type School = z.infer<typeof SchoolSchema>;

export const SchoolListSchema = z.array(SchoolSchema);

export const BudgetPolicySchema = z.object({
  id: z.number().int().positive(),
  scope: z.string().min(1),
  label: z.string().min(1),
  amountPerPortion: z.number().nullable(),
  source: z.string().nullable(),
  verified: z.boolean(),
  effectiveDate: z.string().nullable(),
});
export type BudgetPolicy = z.infer<typeof BudgetPolicySchema>;

export const BudgetPolicyListSchema = z.array(BudgetPolicySchema);

/* ------------------------------------------------------------------ */
/* Skema form                                                          */
/* ------------------------------------------------------------------ */

export const SchoolFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama sekolah minimal 3 karakter")
    .max(150, "Nama sekolah maksimal 150 karakter"),
  npsn: z.string().trim().max(20, "NPSN maksimal 20 karakter").optional(),
  address: z.string().trim().max(255, "Alamat maksimal 255 karakter").optional(),
  region: z
    .string()
    .trim()
    .min(3, "Wilayah wajib diisi")
    .max(100, "Wilayah maksimal 100 karakter"),
  isActive: z.boolean().default(true),
});
export type SchoolFormInput = z.input<typeof SchoolFormSchema>;
export type SchoolFormData = z.output<typeof SchoolFormSchema>;

export const BeneficiaryGroupFormSchema = z
  .object({
    level: BeneficiaryLevelSchema,
    label: z.string().trim().max(100, "Label maksimal 100 karakter"),
    studentCount: z.coerce
      .number({ message: "Jumlah siswa wajib berupa angka" })
      .int("Jumlah siswa harus bilangan bulat")
      .min(0, "Jumlah siswa tidak boleh negatif")
      .max(100_000, "Jumlah siswa tidak wajar"),
    budgetPerPortion: z
      .union([z.literal(""), z.coerce.number().min(0, "Anggaran tidak boleh negatif")])
      .transform((value) => (value === "" ? null : value)),
  })
  .superRefine((data, ctx) => {
    if (data.level === "lainnya" && data.label.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["label"],
        message: "Nama kelompok wajib diisi untuk kategori 'lainnya'.",
      });
    }
  });

export type BeneficiaryGroupFormInput = z.input<typeof BeneficiaryGroupFormSchema>;
export type BeneficiaryGroupFormData = z.output<typeof BeneficiaryGroupFormSchema>;

/* ------------------------------------------------------------------ */
/* Skema body Route Handler (input dari klien, camelCase)              */
/* ------------------------------------------------------------------ */

export const GroupApiBodySchema = z.object({
  level: BeneficiaryLevelSchema,
  label: z.string().max(100).nullable().optional(),
  studentCount: z.coerce.number().int().min(0).max(100_000),
  budgetPerPortion: z.number().min(0).nullable().optional(),
});

export const SchoolCreateBodySchema = SchoolFormSchema.extend({
  groups: z.array(GroupApiBodySchema).optional(),
});

export const SchoolUpdateBodySchema = SchoolFormSchema.partial().extend({
  groups: z.array(GroupApiBodySchema).optional(),
});

export const GroupUpdateBodySchema = GroupApiBodySchema.partial();

/* ------------------------------------------------------------------ */
/* Helper jenjang (SD 1-3, SD 4-6, SMP, SMA) untuk form ringkas        */
/* ------------------------------------------------------------------ */

/** Jenjang yang ditampilkan sebagai input jumlah siswa pada form sekolah. */
export const CANONICAL_LEVELS: readonly BeneficiaryLevel[] = [
  "sd_1_3",
  "sd_4_6",
  "smp",
  "sma",
];

/** Nilai input (string) per jenjang; "" berarti tidak diisi. */
export type LevelCounts = Record<BeneficiaryLevel, string>;

export const emptyLevelCounts = (): LevelCounts => ({
  sd_1_3: "",
  sd_4_6: "",
  smp: "",
  sma: "",
  lainnya: "",
});

/** Membaca jumlah siswa dari kelompok tersimpan ke bentuk input form. */
export const countsFromGroups = (groups: readonly BeneficiaryGroup[]): LevelCounts => {
  const counts = emptyLevelCounts();
  for (const group of groups) {
    counts[group.level] = String(group.studentCount);
  }
  return counts;
};

/** Mengubah input form menjadi daftar kelompok (hanya yang > 0). */
export const groupsFromCounts = (counts: LevelCounts): Array<{ level: BeneficiaryLevel; studentCount: number }> =>
  CANONICAL_LEVELS.flatMap((level) => {
    const raw = counts[level].trim();
    if (raw === "") return [];
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return [];
    return [{ level, studentCount: Math.floor(value) }];
  });

/** Total siswa dari input form (belum tersimpan). */
export const totalFromCounts = (counts: LevelCounts): number =>
  groupsFromCounts(counts).reduce((total, group) => total + group.studentCount, 0);

/** Total siswa dari seluruh kelompok sebuah sekolah. */
export const totalStudents = (school: School): number =>
  school.groups.reduce((total, group) => total + group.studentCount, 0);

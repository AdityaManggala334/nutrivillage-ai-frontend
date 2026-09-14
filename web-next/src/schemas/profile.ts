import { z } from "zod";
import type { AgeGroup } from "./domain";

/**
 * profile.ts
 * Validasi onboarding & data keluarga (FR-05 Input Data Keluarga).
 * Input form berupa string (dari DOM/React), sehingga angka di-`coerce` dan
 * daftar alergi/preferensi dipisah dengan koma lalu di-transform ke array.
 */

export const GenderSchema = z.enum(["laki-laki", "perempuan"]);
export const ActivityLevelSchema = z.enum(["rendah", "sedang", "tinggi"]);
export const AgeGroupSchema = z.enum(["balita", "anak", "dewasa", "lansia"]);

export type Gender = z.infer<typeof GenderSchema>;
export type ActivityLevel = z.infer<typeof ActivityLevelSchema>;

/** Menentukan kelompok usia dari umur (SKPL: Balita 1-3, Anak 4-12, Dewasa 13-59, Lansia 60+). */
export const resolveAgeGroup = (age: number): AgeGroup => {
  if (age <= 3) return "balita";
  if (age <= 12) return "anak";
  if (age <= 59) return "dewasa";
  return "lansia";
};

const commaSeparatedList = z.string().transform((value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0),
);

export const familyMemberFormSchema = z
  .object({
    name: z.string().trim().min(2, "Nama anggota minimal 2 karakter").max(100),
    age: z.coerce
      .number()
      .int("Usia harus bilangan bulat")
      .min(1, "Usia minimal 1 tahun")
      .max(120, "Usia maksimal 120 tahun"),
    gender: GenderSchema,
    weightKg: z.coerce
      .number()
      .positive("Berat badan harus lebih dari 0")
      .max(250, "Berat badan tidak wajar"),
    activityLevel: ActivityLevelSchema,
    allergies: commaSeparatedList,
  })
  .transform((member) => ({
    ...member,
    ageGroup: resolveAgeGroup(member.age),
  }));

export const familyProfileFormSchema = z.object({
  dailyBudget: z.coerce
    .number()
    .positive("Budget harian harus lebih dari 0")
    .max(50_000_000, "Budget harian tidak wajar"),
  region: z.string().trim().min(3, "Wilayah wajib diisi"),
  preferences: commaSeparatedList,
  avoidedIngredients: commaSeparatedList,
  members: z.array(familyMemberFormSchema).min(1, "Minimal 1 anggota keluarga"),
});

export type FamilyMemberFormInput = z.input<typeof familyMemberFormSchema>;
export type FamilyMemberFormOutput = z.output<typeof familyMemberFormSchema>;
export type FamilyProfileFormInput = z.input<typeof familyProfileFormSchema>;
export type FamilyProfileFormOutput = z.output<typeof familyProfileFormSchema>;

/* ------------------------------------------------------------------ */
/* Model respons API (output tersimpan)                                */
/* ------------------------------------------------------------------ */

export const FamilyMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  age: z.number().int().positive(),
  ageGroup: AgeGroupSchema,
  gender: GenderSchema,
  weightKg: z.number().positive(),
  activityLevel: ActivityLevelSchema,
  allergies: z.array(z.string()),
});

export const FamilyProfileSchema = z.object({
  userId: z.string().min(1),
  dailyBudget: z.number().positive(),
  region: z.string().min(1),
  members: z.array(FamilyMemberSchema).min(1),
  preferences: z.array(z.string()),
  avoidedIngredients: z.array(z.string()),
  onboarded: z.boolean(),
  updatedAt: z.string().min(1),
});

export type FamilyMember = z.infer<typeof FamilyMemberSchema>;
export type FamilyProfile = z.infer<typeof FamilyProfileSchema>;

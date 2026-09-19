import { z } from 'zod';
import { resolveAgeGroup } from '../types/domain';

/**
 * profileSchema.ts
 * Validasi onboarding & data keluarga (FR-05 Input Data Keluarga).
 *
 * Input form berupa string (dari DOM), sehingga angka di-`coerce` dan
 * daftar alergi/preferensi dipisah dengan koma lalu di-transform ke array.
 */

const commaSeparatedList = z.string().transform((value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0),
);

export const familyMemberFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama anggota minimal 2 karakter').max(100),
    age: z.coerce
      .number()
      .int('Usia harus bilangan bulat')
      .min(1, 'Usia minimal 1 tahun')
      .max(120, 'Usia maksimal 120 tahun'),
    gender: z.enum(['laki-laki', 'perempuan'], {
      message: 'Jenis kelamin wajib dipilih',
    }),
    weightKg: z.coerce
      .number()
      .positive('Berat badan harus lebih dari 0')
      .max(250, 'Berat badan tidak wajar'),
    activityLevel: z.enum(['rendah', 'sedang', 'tinggi'], {
      message: 'Tingkat aktivitas wajib dipilih',
    }),
    allergies: commaSeparatedList,
  })
  .transform((member) => ({
    ...member,
    ageGroup: resolveAgeGroup(member.age),
  }));

export const familyProfileFormSchema = z.object({
  dailyBudget: z.coerce
    .number()
    .positive('Budget harian harus lebih dari 0')
    .max(50_000_000, 'Budget harian tidak wajar'),
  region: z.string().trim().min(3, 'Wilayah wajib diisi'),
  preferences: commaSeparatedList,
  avoidedIngredients: commaSeparatedList,
  members: z.array(familyMemberFormSchema).min(1, 'Minimal 1 anggota keluarga'),
});

export type FamilyMemberFormInput = z.input<typeof familyMemberFormSchema>;
export type FamilyMemberFormOutput = z.output<typeof familyMemberFormSchema>;
export type FamilyProfileFormInput = z.input<typeof familyProfileFormSchema>;
export type FamilyProfileFormOutput = z.output<typeof familyProfileFormSchema>;

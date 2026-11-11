import { z } from "zod";
import { AgeGroupSchema, RecommendationGoalSchema } from "./domain";
import { ActivityLevelSchema, GenderSchema } from "./profile";

/**
 * FR-08: skema parameter input di halaman Explore.
 * Budget harus > 0 dan minimal satu anggota keluarga terisi.
 */

export const ExploreMemberSchema = z.object({
  name: z.string().trim().min(1, "Nama anggota wajib diisi").max(100),
  age: z.coerce.number().int().min(1, "Usia minimal 1 tahun").max(120),
  gender: GenderSchema,
  weightKg: z.coerce.number().positive("Berat badan harus lebih dari 0").max(250),
  heightCm: z.coerce.number().min(50, "Tinggi badan minimal 50 cm").max(250),
  activityLevel: ActivityLevelSchema,
  allergies: z.array(z.string().min(1)),
});
export type ExploreMember = z.infer<typeof ExploreMemberSchema>;

export const ExploreFormSchema = z
  .object({
    dailyBudget: z.coerce
      .number({ message: "Anggaran harian wajib berupa angka" })
      .positive("Anggaran harian harus lebih dari 0"),
    goal: RecommendationGoalSchema,
    members: z.array(ExploreMemberSchema).min(1, "Minimal satu anggota keluarga"),
    preferences: z.array(z.string().min(1)),
    allergies: z.array(z.string().min(1)),
    location: z.string().min(1, "Lokasi wajib diisi"),
    mealsPerDay: z.coerce.number().int().min(1).max(5).default(3),
    /** FR-05 revisi: slot waktu makan pilihan pengguna (1-5, urut waktu). */
    mealSlots: z
      .array(z.enum(["sarapan", "selingan_pagi", "makan_siang", "selingan_sore", "makan_malam"]))
      .min(1, "Pilih minimal satu waktu makan")
      .max(5)
      .default(["sarapan", "makan_siang", "makan_malam"]),
    includeSusu: z.boolean().default(true),
  })
  ;

export type ExploreFormInput = z.input<typeof ExploreFormSchema>;
export type ExploreFormData = z.output<typeof ExploreFormSchema>;

export const totalMembers = (members: readonly unknown[]): number => members.length;

/** FR-05 revisi: opsi slot waktu makan (urut waktu, label tampilan). */
export const MEAL_SLOT_OPTIONS = [
  { value: "sarapan", label: "Sarapan" },
  { value: "selingan_pagi", label: "Selingan Pagi" },
  { value: "makan_siang", label: "Makan Siang" },
  { value: "selingan_sore", label: "Selingan Sore" },
  { value: "makan_malam", label: "Makan Malam" },
] as const;
export type MealSlotValue = (typeof MEAL_SLOT_OPTIONS)[number]["value"];

/** Label opsi checkbox preferensi & alergi di form Explore. */
export const PREFERENCE_OPTIONS = [
  "Sayur",
  "Ikan",
  "Ayam",
  "Tahu/Tempe",
  "Santan",
  "Pedas",
] as const;

/** Label opsi checkbox alergi/pantangan (dipakai masyarakat & SPPG). */
export const ALLERGY_OPTIONS = [
  "Seafood",
  "Kacang",
  "Telur",
  "Santan",
  "Gluten",
  "Susu",
  "Kedelai",
] as const;

export const AGE_GROUPS = AgeGroupSchema.options;

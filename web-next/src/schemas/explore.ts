import { z } from "zod";
import { AgeGroupSchema, RecommendationGoalSchema } from "./domain";

/**
 * FR-08: skema parameter input di halaman Explore.
 * Budget harus > 0 dan minimal satu anggota keluarga terisi.
 */

export const AgeCountsSchema = z.object({
  balita: z.number().int().min(0).max(20),
  anak: z.number().int().min(0).max(20),
  dewasa: z.number().int().min(0).max(20),
  lansia: z.number().int().min(0).max(20),
});

export const ExploreFormSchema = z
  .object({
    dailyBudget: z.coerce
      .number({ message: "Anggaran harian wajib berupa angka" })
      .positive("Anggaran harian harus lebih dari 0"),
    days: z.coerce
      .number({ message: "Jumlah hari wajib berupa angka" })
      .int("Jumlah hari harus bilangan bulat")
      .min(1, "Minimal 1 hari")
      .max(7, "Maksimal 7 hari"),
    goal: RecommendationGoalSchema,
    members: AgeCountsSchema,
    preferences: z.array(z.string().min(1)),
    allergies: z.array(z.string().min(1)),
    location: z.string().min(1, "Lokasi wajib diisi"),
  })
  .refine(
    (data) =>
      data.members.balita + data.members.anak + data.members.dewasa + data.members.lansia > 0,
    {
      message: "Minimal satu anggota keluarga harus diisi",
      path: ["members"],
    },
  );

export type ExploreFormInput = z.input<typeof ExploreFormSchema>;
export type ExploreFormData = z.output<typeof ExploreFormSchema>;
export type AgeCounts = z.infer<typeof AgeCountsSchema>;

export const totalMembers = (members: AgeCounts): number =>
  members.balita + members.anak + members.dewasa + members.lansia;

/** Label opsi checkbox preferensi & alergi di form Explore. */
export const PREFERENCE_OPTIONS = [
  "Sayur",
  "Ikan",
  "Ayam",
  "Tahu/Tempe",
  "Santan",
  "Pedas",
] as const;

export const ALLERGY_OPTIONS = [
  "Kacang",
  "Seafood",
  "Telur",
  "Santan",
  "Gluten",
] as const;

export const AGE_GROUPS = AgeGroupSchema.options;

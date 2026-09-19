import { z } from "zod";

/** FR-18: data diri pengguna (nama, email, nomor HP). */
export const AccountSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.email("Format email tidak valid"),
  phone: z
    .string()
    .trim()
    .min(9, "Nomor HP minimal 9 digit")
    .max(20, "Nomor HP maksimal 20 digit")
    .regex(/^[0-9+\-\s]+$/, "Nomor HP hanya boleh berisi angka, +, atau -"),
});

export type AccountInput = z.infer<typeof AccountSchema>;

/** FR-19: preferensi & tujuan gizi (dipakai pada form profil). */
export const PreferenceSchema = z.object({
  preferences: z.array(z.string()),
  avoidedIngredients: z.array(z.string()),
  goal: z.enum(["hemat", "seimbang", "tinggi-protein", "rendah-lemak"]),
});

export type PreferenceInput = z.infer<typeof PreferenceSchema>;

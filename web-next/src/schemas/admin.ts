import { z } from "zod";
import { UserRoleSchema } from "./auth";

/** Skema data untuk halaman sisi Admin (FR-22 s.d. FR-34). */

export const PriceStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type PriceStatus = z.infer<typeof PriceStatusSchema>;

export const AdminIngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  isLocal: z.boolean(),
  isInSeason: z.boolean(),
  latestPrice: z.number().nonnegative(),
});
export type AdminIngredient = z.infer<typeof AdminIngredientSchema>;

export const AdminPriceSchema = z.object({
  id: z.string().min(1),
  ingredientName: z.string().min(1),
  price: z.number().nonnegative(),
  unit: z.string().min(1),
  source: z.string().min(1),
  recordedAt: z.string().min(1),
  status: PriceStatusSchema,
});
export type AdminPrice = z.infer<typeof AdminPriceSchema>;

export const AdminRecipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  servings: z.number().int().positive(),
  estimatedCost: z.number().nonnegative(),
  isLocal: z.boolean(),
  inSeason: z.boolean(),
});
export type AdminRecipe = z.infer<typeof AdminRecipeSchema>;

export const SeasonSchema = z.object({
  id: z.string().min(1),
  commodity: z.string().min(1),
  months: z.array(z.string().min(1)),
});
export type Season = z.infer<typeof SeasonSchema>;

export const LocalCommoditySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  region: z.string().min(1),
  isLocal: z.boolean(),
});
export type LocalCommodity = z.infer<typeof LocalCommoditySchema>;

export const ScraperLogSchema = z.object({
  id: z.string().min(1),
  runAt: z.string().min(1),
  status: z.enum(["success", "failed"]),
  source: z.string().min(1),
  message: z.string().min(1),
  itemsScraped: z.number().int().nonnegative(),
});
export type ScraperLog = z.infer<typeof ScraperLogSchema>;

export const AdminStatsSchema = z.object({
  ingredients: z.number().int().nonnegative(),
  recipes: z.number().int().nonnegative(),
  pendingPrices: z.number().int().nonnegative(),
  approvedPrices: z.number().int().nonnegative(),
  users: z.number().int().nonnegative(),
  scraperFailures: z.number().int().nonnegative(),
});
export type AdminStats = z.infer<typeof AdminStatsSchema>;

/* ------------------------------------------------------------------ */
/* Informasi keamanan pangan (FR: edukasi keamanan pangan terverifikasi) */
/* ------------------------------------------------------------------ */

export const FoodSafetyVerificationSchema = z.enum(["pending", "verified", "rejected"]);
export type FoodSafetyVerification = z.infer<typeof FoodSafetyVerificationSchema>;

export const FoodSafetyInfoSchema = z.object({
  id: z.string().min(1),
  /** Bahan atau konteks resep yang terkait. */
  topic: z.string().min(1),
  riskType: z.string().min(1),
  hazard: z.string().min(1),
  handling: z.string().min(1),
  source: z.string().min(1),
  verification: FoodSafetyVerificationSchema,
});
export type FoodSafetyInfo = z.infer<typeof FoodSafetyInfoSchema>;

/* ------------------------------------------------------------------ */
/* Manajemen pengguna (khusus admin)                                   */
/* ------------------------------------------------------------------ */

export const AdminSppgOfficerSchema = z.object({
  nip: z.string().min(1),
  sppgUnit: z.string().min(1),
  region: z.string().min(1),
  position: z.string().nullable(),
});

export const AdminUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().min(1),
  role: UserRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string().min(1),
  sppgOfficer: AdminSppgOfficerSchema.nullable(),
  schoolsCount: z.number().int().min(0),
});
export type AdminUser = z.infer<typeof AdminUserSchema>;

export const AdminUserListSchema = z.array(AdminUserSchema);

export const AdminUserCreateBodySchema = z
  .object({
    name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
    email: z.email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Za-z]/, "Password harus memuat huruf")
      .regex(/[0-9]/, "Password harus memuat angka"),
    role: UserRoleSchema.exclude(["guest"]),
    isActive: z.boolean().default(true),
    nip: z.string().trim().max(50).optional(),
    sppgUnit: z.string().trim().max(150).optional(),
    region: z.string().trim().max(100).optional(),
    position: z.string().trim().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "petugas_sppg") return;
    if ((data.nip ?? "").trim().length < 3) {
      ctx.addIssue({ code: "custom", path: ["nip"], message: "NIP wajib diisi untuk petugas SPPG." });
    }
    if ((data.sppgUnit ?? "").trim().length < 3) {
      ctx.addIssue({ code: "custom", path: ["sppgUnit"], message: "Unit SPPG wajib diisi." });
    }
    if ((data.region ?? "").trim().length < 3) {
      ctx.addIssue({ code: "custom", path: ["region"], message: "Wilayah wajib diisi." });
    }
  });

export const AdminUserUpdateBodySchema = z.object({
  name: z.string().trim().min(3).max(100).optional(),
  role: UserRoleSchema.exclude(["guest"]).optional(),
  isActive: z.boolean().optional(),
  nip: z.string().trim().max(50).optional(),
  sppgUnit: z.string().trim().max(150).optional(),
  region: z.string().trim().max(100).optional(),
  position: z.string().trim().max(100).optional(),
});

export type AdminUserCreateBody = z.infer<typeof AdminUserCreateBodySchema>;
export type AdminUserUpdateBody = z.infer<typeof AdminUserUpdateBodySchema>;

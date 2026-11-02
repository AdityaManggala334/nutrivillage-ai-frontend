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
  description: z.string().nullable(),
  mbgSlot: z.string().nullable(),
  allergens: z.array(z.string()),
  usedInMenus: z.number().int().nonnegative(),
});
export type AdminIngredient = z.infer<typeof AdminIngredientSchema>;

export const AdminPriceSchema = z.object({
  id: z.string().min(1),
  ingredientId: z.number().int().positive(),
  ingredientName: z.string().min(1),
  price: z.number().positive(),
  unit: z.string().min(1),
  source: z.string().min(1),
  recordedAt: z.string().min(1),
  status: PriceStatusSchema,
  sourceType: z.string(),
});
export type AdminPrice = z.infer<typeof AdminPriceSchema>;

export const AdminPriceListSchema = z.array(AdminPriceSchema);

/** Harga baru yang diisi admin; status pending sampai diverifikasi. */
export const AdminPriceCreateSchema = z.object({
  ingredientId: z.number().int().positive("Pilih bahan"),
  price: z.number().positive("Harga harus lebih dari 0"),
  unit: z.string().trim().min(1, "Satuan wajib diisi").max(20),
  source: z.string().trim().min(2, "Sumber minimal 2 karakter").max(150),
  status: PriceStatusSchema.default("pending"),
});
export type AdminPriceCreate = z.infer<typeof AdminPriceCreateSchema>;

export const AdminPriceUpdateSchema = z.object({
  price: z.number().positive("Harga harus lebih dari 0"),
  unit: z.string().trim().min(1, "Satuan wajib diisi").max(20),
  source: z.string().trim().min(2, "Sumber minimal 2 karakter").max(150),
});
export type AdminPriceUpdate = z.infer<typeof AdminPriceUpdateSchema>;

export const AdminRecipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  servings: z.number().int().positive(),
  estimatedCost: z.number().nonnegative(),
  isLocal: z.boolean(),
  inSeason: z.boolean(),
  description: z.string().nullable(),
  cookingTimeMin: z.number().int().positive(),
  steps: z.array(z.string()),
  tags: z.array(z.string()),
  mealKind: z.enum(["hidangan", "komponen"]),
  imageUrl: z.string().url().nullable(),
  imageFileId: z.string().nullable(),
  imageAlt: z.string().nullable(),
  foodSafety: z.array(
    z.object({ id: z.number().int().positive(), topic: z.string(), verification: z.string() }),
  ),
  ingredients: z.array(
    z.object({
      ingredientId: z.number().int().positive().nullable(),
      name: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.string().min(1),
      estimatedPrice: z.number().nonnegative(),
      isPantry: z.boolean(),
      note: z.string().nullable(),
    }),
  ),
});
export type AdminRecipe = z.infer<typeof AdminRecipeSchema>;

export const SeasonSchema = z.object({
  id: z.string().min(1),
  ingredientId: z.number().int().positive(),
  commodity: z.string().min(1),
  month: z.number().int().min(1).max(12),
  monthName: z.string().min(1),
  status: z.enum(["in_season", "shoulder", "off_season"]),
});
export type Season = z.infer<typeof SeasonSchema>;

export const LocalCommoditySchema = z.object({
  id: z.string().min(1),
  ingredientId: z.number().int().positive(),
  regionId: z.number().int().positive(),
  name: z.string().min(1),
  region: z.string().min(1),
  level: z.string().min(1),
  levelCode: z.enum(["abundant", "available", "limited"]),
  source: z.string(),
});
export type LocalCommodity = z.infer<typeof LocalCommoditySchema>;

export const ScraperLogSchema = z.object({
  id: z.string().min(1),
  runAt: z.string().min(1),
  status: z.enum(["success", "partial", "failed"]),
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

/* ------------------------------------------------------------------ */
/* Dasbor Nutrisi v2.2: bahan + gizi + harga dalam satu tabel          */
/* ------------------------------------------------------------------ */

export const MbgSlotSchema = z.enum(["pokok", "hewani", "nabati", "sayur", "buah", "susu"]);
export type MbgSlot = z.infer<typeof MbgSlotSchema>;

export const NutritionFactSchema = z.object({
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative(),
  bddPercent: z.number().positive().max(100),
  calciumMg: z.number().nonnegative(),
  ironMg: z.number().nonnegative(),
  vitaminAMcg: z.number().nonnegative(),
  vitaminCMcg: z.number().nonnegative(),
  sugarG: z.number().nonnegative(),
  sodiumMg: z.number().nonnegative(),
  source: z.string(),
});
export type NutritionFact = z.infer<typeof NutritionFactSchema>;

export const NutritionRowSchema = z.object({
  ingredientId: z.number().int().positive(),
  code: z.string().nullable(),
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  mbgSlot: MbgSlotSchema.nullable(),
  allergens: z.array(z.string()),
  isLocal: z.boolean(),
  usedInMenus: z.number().int().nonnegative(),
  pricePerKg: z.number().nonnegative().nullable(),
  priceSource: z.string().nullable(),
  priceStatus: z.string().nullable(),
  nutrition: NutritionFactSchema.nullable(),
});
export type NutritionRow = z.infer<typeof NutritionRowSchema>;

export const NutritionRowListSchema = z.array(NutritionRowSchema);

/** Body simpan satu baris dari dialog admin (angka sudah divalidasi Zod). */
export const NutritionRowUpdateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1),
  unit: z.string().min(1).max(20),
  mbgSlot: MbgSlotSchema.nullable(),
  allergens: z.array(z.string().min(1)).max(10),
  pricePerKg: z.number().positive().max(10_000_000).nullable(),
  nutrition: NutritionFactSchema,
});
export type NutritionRowUpdate = z.infer<typeof NutritionRowUpdateSchema>;

export const ImportReportSchema = z.object({
  dibuat: z.record(z.string(), z.number()),
  diperbarui: z.record(z.string(), z.number()),
  jumlah_error: z.number().int().nonnegative(),
  error: z.array(
    z.object({
      berkas: z.string(),
      baris: z.number().int(),
      kolom: z.string(),
      pesan: z.string(),
    }),
  ),
  jumlah_menu: z.number().int().nonnegative().optional(),
  jumlah_bahan: z.number().int().nonnegative().optional(),
  dry_run: z.boolean().optional(),
  catatan: z.string().optional(),
});
export type ImportReport = z.infer<typeof ImportReportSchema>;


/* ------------------------------------------------------------------ */
/* Payload CRUD data master admin                                     */
/* ------------------------------------------------------------------ */

const IngredientFields = {
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  category: z.string().trim().min(1),
  unit: z.string().trim().min(1).max(20),
  description: z.string().trim().max(500).nullable(),
  isLocal: z.boolean(),
  isInSeason: z.boolean(),
  mbgSlot: z.string().nullable(),
  allergens: z.array(z.string().trim().min(1)),
};

export const AdminIngredientCreateSchema = z.object(IngredientFields);
export const AdminIngredientUpdateSchema = z.object(IngredientFields);
export type AdminIngredientInput = z.infer<typeof AdminIngredientCreateSchema>;

const RecipeIngredientFields = z.object({
  ingredientId: z.number().int().positive().nullable(),
  name: z.string().trim().min(1, "Nama bahan wajib diisi"),
  quantity: z.number().positive("Jumlah harus lebih dari 0"),
  unit: z.string().trim().min(1).max(20),
  estimatedPrice: z.number().nonnegative(),
  isPantry: z.boolean(),
  note: z.string().trim().max(100).nullable(),
});

const RecipeFields = {
  name: z.string().trim().min(1, "Nama menu wajib diisi").max(100),
  category: z.string().trim().min(1),
  description: z.string().trim().max(500).nullable(),
  servings: z.number().int().min(1).max(100),
  cookingTimeMin: z.number().int().min(1).max(600),
  steps: z.array(z.string().trim().min(1)),
  tags: z.array(z.string().trim().min(1)),
  isLocal: z.boolean(),
  inSeason: z.boolean(),
  estimatedCost: z.number().nonnegative(),
  mealKind: z.enum(["hidangan", "komponen"]),
  imageUrl: z.string().url().nullable(),
  imageFileId: z.string().trim().max(120).nullable(),
  imageAlt: z.string().trim().max(255).nullable(),
  foodSafetyIds: z.array(z.number().int().positive()),
  ingredients: z.array(RecipeIngredientFields),
};

export const AdminRecipeCreateSchema = z.object(RecipeFields);
export const AdminRecipeUpdateSchema = z.object(RecipeFields);
export type AdminRecipeInput = z.infer<typeof AdminRecipeCreateSchema>;

export const AdminSeasonCreateSchema = z.object({
  ingredientId: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  status: z.enum(["in_season", "shoulder", "off_season"]),
});
export const AdminSeasonUpdateSchema = AdminSeasonCreateSchema;
export type AdminSeasonInput = z.infer<typeof AdminSeasonCreateSchema>;

export const AdminLocalCreateSchema = z.object({
  ingredientId: z.number().int().positive(),
  regionId: z.number().int().positive(),
  level: z.enum(["abundant", "available", "limited"]),
  source: z.string().trim().max(150).nullable(),
});
export const AdminLocalUpdateSchema = AdminLocalCreateSchema;
export type AdminLocalInput = z.infer<typeof AdminLocalCreateSchema>;


export const FoodSafetyInputSchema = z.object({
  topic: z.string().trim().min(2, "Topik minimal 2 karakter").max(100),
  riskType: z.string().trim().min(2, "Jenis risiko minimal 2 karakter").max(100),
  hazard: z.string().trim().min(3, "Bahaya minimal 3 karakter"),
  handling: z.string().trim().min(3, "Penanganan minimal 3 karakter"),
  source: z.string().trim().min(2, "Sumber minimal 2 karakter").max(150),
  verification: FoodSafetyVerificationSchema,
});
export type FoodSafetyInput = z.infer<typeof FoodSafetyInputSchema>;

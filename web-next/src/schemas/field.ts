import { z } from "zod";

/** Skema data jalur Petugas Lapangan (bentuk backend, snake_case). */
export const FieldIngredientSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  unit: z.string().min(1),
  category: z.string().min(1),
});
export type FieldIngredient = z.infer<typeof FieldIngredientSchema>;

export const FieldPriceSchema = z.object({
  id: z.number().int().positive(),
  ingredient_id: z.number().int().positive(),
  ingredient_name: z.string().default(""),
  region_id: z.number().int().positive().nullable().optional(),
  price: z.number().positive(),
  unit: z.string(),
  recorded_date: z.string(),
  source: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  created_at: z.string(),
  created_by: z.number().int().nullable().optional(),
});
export type FieldPrice = z.infer<typeof FieldPriceSchema>;

export const FieldPriceCreateSchema = z.object({
  ingredient_id: z.number().int().positive("Pilih bahan terlebih dahulu"),
  price: z.coerce.number().int().positive("Harga harus lebih dari 0"),
  unit: z.string().min(1, "Satuan wajib diisi").max(20),
  source: z.string().min(2, "Sumber wajib diisi").max(150),
  recorded_date: z.string().min(8).max(10).optional(),
});
export type FieldPriceCreate = z.infer<typeof FieldPriceCreateSchema>;

import { z } from "zod";

/**
 * Halaman Profil — data diri (FR-18) & sakelar notifikasi (FR-21).
 *
 * Data disimpan di database (FastAPI): nama & nomor HP pada tabel `users`,
 * sakelar notifikasi pada tabel `profiles`. Email sengaja tidak dapat diubah
 * karena dipakai sebagai identitas login.
 */

/** 10-15 digit; boleh diawali `+` dan dipisah spasi/strip. */
export const isValidPhone = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true; // nomor HP bersifat opsional
  if (!/^\+?[0-9\s-]{10,20}$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "").length;
  return digits >= 10 && digits <= 15;
};

const phoneField = z
  .string()
  .max(30, "Nomor HP terlalu panjang")
  .refine((value) => isValidPhone(value), "Nomor HP harus terdiri dari 10-15 digit angka");

export const AccountSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100),
  email: z.string().min(3).max(150),
  phone: phoneField,
  notificationsEnabled: z.boolean(),
});

/** Input form Data Diri — hanya field yang memang boleh diubah. */
export const AccountUpdateSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(100).optional(),
  phone: phoneField.optional(),
  notificationsEnabled: z.boolean().optional(),
});

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(8, "Password lama minimal 8 karakter"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
  confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
});

export type Account = z.infer<typeof AccountSchema>;
export type AccountInput = z.infer<typeof AccountUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;

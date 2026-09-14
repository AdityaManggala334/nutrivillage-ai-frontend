import { z } from "zod";

/**
 * auth.ts
 * Validasi form autentikasi (FR-01 Registrasi, FR-02 Login) dan model user.
 * Tipe diturunkan dengan `z.infer` (single source of truth).
 */

export const LoginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Nama minimal 3 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    email: z.email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Za-z]/, "Password harus memuat huruf")
      .regex(/[0-9]/, "Password harus memuat angka"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const UserRoleSchema = z.enum(["user", "admin", "guest"]);

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: UserRoleSchema,
  createdAt: z.string().min(1),
});

export const AuthSessionSchema = z.object({
  user: UserSchema,
  token: z.string().min(1),
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;

export const AuthModeSchema = z.enum(["login", "register"]);
export type AuthMode = z.infer<typeof AuthModeSchema>;

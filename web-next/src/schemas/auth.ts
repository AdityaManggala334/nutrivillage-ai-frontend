import { z } from "zod";

/**
 * auth.ts
 * Validasi form autentikasi (FR-01 Registrasi, FR-02 Login) dan model user.
 * Tipe diturunkan dengan `z.infer` (single source of truth).
 *
 * Peran mencakup masyarakat (`user`), petugas SPPG MBG (`petugas_sppg`),
 * admin, dan tamu (`guest`).
 */

export const LoginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

/** Peran yang boleh dipilih sendiri saat registrasi publik. */
export const RegistrableRoleSchema = z.enum(["user", "petugas_sppg"]);
export type RegistrableRole = z.infer<typeof RegistrableRoleSchema>;

export const REGISTRABLE_ROLE_LABELS: Readonly<Record<RegistrableRole, string>> = {
  user: "Masyarakat",
  petugas_sppg: "Petugas SPPG MBG",
};

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
    role: RegistrableRoleSchema.default("user"),

    // Field khusus petugas SPPG MBG (wajib bila role = petugas_sppg).
    nip: z.string().trim().max(50, "NIP maksimal 50 karakter").optional(),
    sppgUnit: z.string().trim().max(150, "Nama unit maksimal 150 karakter").optional(),
    region: z.string().trim().max(100, "Wilayah maksimal 100 karakter").optional(),
    position: z.string().trim().max(100, "Jabatan maksimal 100 karakter").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.role !== "petugas_sppg") return;
    const required: ReadonlyArray<readonly [keyof typeof data, string, number]> = [
      ["nip", "NIP wajib diisi untuk petugas SPPG", 3],
      ["sppgUnit", "Nama unit SPPG wajib diisi", 3],
      ["region", "Wilayah SPPG wajib diisi", 3],
    ];
    for (const [field, message, min] of required) {
      const value = data[field];
      if (typeof value !== "string" || value.trim().length < min) {
        ctx.addIssue({ code: "custom", path: [field], message });
      }
    }
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const UserRoleSchema = z.enum(["user", "petugas_sppg", "admin", "guest"]);

export const SppgOfficerSchema = z.object({
  nip: z.string().min(1),
  sppgUnit: z.string().min(1),
  region: z.string().min(1),
  position: z.string().nullable().optional(),
});

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: UserRoleSchema,
  createdAt: z.string().min(1),
  sppgOfficer: SppgOfficerSchema.nullable().optional(),
});

export const AuthSessionSchema = z.object({
  user: UserSchema,
  token: z.string().min(1),
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type SppgOfficer = z.infer<typeof SppgOfficerSchema>;
export type User = z.infer<typeof UserSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;

export const AuthModeSchema = z.enum(["login", "register"]);
export type AuthMode = z.infer<typeof AuthModeSchema>;

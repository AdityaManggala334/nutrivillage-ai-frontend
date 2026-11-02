"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GuestLoginButton } from "@/components/guest-login-button";
import { PasswordChecklist } from "@/components/password-checklist";
import { Button, FieldError, Input, Label, PasswordInput } from "@/components/ui";
import { useLoginMutation, useRegisterMutation } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LoginSchema,
  REGISTRABLE_ROLE_LABELS,
  RegisterSchema,
  type AuthMode,
  type AuthSession,
  type RegistrableRole,
} from "@/schemas/auth";

interface FormErrors {
  [field: string]: string;
}

const mapIssues = (issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>): FormErrors => {
  const errors: FormErrors = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
};

const TAB_CLASS = (isActive: boolean): string =>
  cn(
    "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none",
    isActive
      ? "bg-white text-brand-700 shadow-sm dark:bg-stone-900 dark:text-brand-300"
      : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200",
  );

const ROLE_CLASS = (isActive: boolean): string =>
  cn(
    "flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none",
    isActive
      ? "border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-200"
      : "border-stone-200 bg-white text-stone-600 hover:border-brand-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300",
  );

/** Logo Google (SVG inline — tanpa menambah dependensi). */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.64v3h3.86c2.26-2.09 3.56-5.17 3.56-8.88z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

/** FR-01, FR-02, FR-03: halaman login, registrasi, dan mode tamu. */
export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState<RegistrableRole>("user");
  const [regNip, setRegNip] = useState("");
  const [regSppgUnit, setRegSppgUnit] = useState("");
  const [regRegion, setRegRegion] = useState("");
  const [regPosition, setRegPosition] = useState("");

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);
    setInfoMessage(null);
  };

  /**
   * Arahkan pengguna setelah autentikasi. Memakai navigasi penuh (reload) agar
   * seluruh cache/state klien dibersihkan — mencegah data user sebelumnya
   * terbawa saat berpindah akun.
   */
  const redirectAfterAuth = (session: AuthSession) => {
    const target =
      session.user.role === "admin"
        ? "/admin"
        : session.user.role === "petugas_sppg"
          ? "/sppg/onboarding"
          : "/onboarding";
    window.location.assign(target);
  };

  /** Login Google baru tersedia sebagai tampilan; OAuth menyusul. */
  const handleGoogleLogin = () => {
    setServerError(null);
    setSuccessMessage(null);
    setInfoMessage("Login dengan Google belum aktif pada versi ini. Sementara itu, silakan masuk memakai email dan password.");
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = LoginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      setErrors(mapIssues(result.error.issues));
      return;
    }
    setErrors({});
    setServerError(null);
    setInfoMessage(null);
    loginMutation.mutate(result.data, {
      onSuccess: redirectAfterAuth,
      onError: (error) => setServerError(error.message),
    });
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = RegisterSchema.safeParse({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      confirmPassword: regConfirm,
      role: regRole,
      nip: regNip,
      sppgUnit: regSppgUnit,
      region: regRegion,
      position: regPosition,
    });
    if (!result.success) {
      setErrors(mapIssues(result.error.issues));
      return;
    }
    setErrors({});
    setServerError(null);
    setInfoMessage(null);
    registerMutation.mutate(result.data, {
      onSuccess: () => {
        // FR-01: tidak auto-login. Kembali ke tab Masuk dengan form kosong.
        setMode("login");
        setErrors({});
        setServerError(null);
        setLoginEmail("");
        setLoginPassword("");
        setRegPassword("");
        setRegConfirm("");
        setSuccessMessage("Akun berhasil dibuat. Silakan masuk dengan akun Anda.");
      },
      onError: (error) => setServerError(error.message),
    });
  };

  const isBusy = loginMutation.isPending || registerMutation.isPending;

  return (
    <section aria-labelledby="auth-title" className="app-container flex justify-center py-14">
      <div className="w-full max-w-md">
        <div className="animate-fade-up text-center">
          <h1 id="auth-title" className="text-3xl">
            {mode === "login" ? "Masuk ke Akun Anda" : "Daftar Akun Baru"}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {mode === "login"
              ? "Lanjutkan menyusun menu keluarga Anda."
              : "Mulai perjalanan gizi keluarga bersama NutriVillage AI."}
          </p>
        </div>

        <div className="glass-strong animate-scale-in rounded-3xl mt-8 p-6 sm:p-8">
          <div role="tablist" aria-label="Pilih mode autentikasi" className="glass-subtle flex gap-1 rounded-xl p-1">
            <button
              role="tab"
              type="button"
              aria-selected={mode === "login"}
              className={TAB_CLASS(mode === "login")}
              onClick={() => switchMode("login")}
            >
              Masuk
            </button>
            <button
              role="tab"
              type="button"
              aria-selected={mode === "register"}
              className={TAB_CLASS(mode === "register")}
              onClick={() => switchMode("register")}
            >
              Daftar
            </button>
          </div>

          <div role="tabpanel" aria-label={mode === "login" ? "Form masuk" : "Form pendaftaran"}>
            {serverError ? (
              <div
                role="alert"
                aria-live="assertive"
                className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
              >
                {serverError}
              </div>
            ) : null}

            {successMessage ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-950/50 dark:text-brand-200"
              >
                {successMessage}
              </div>
            ) : null}

            {infoMessage ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600 dark:bg-stone-800/70 dark:text-stone-300"
              >
                {infoMessage}
              </div>
            ) : null}

            {mode === "login" ? (
              <form onSubmit={handleLogin} noValidate className="mt-6 space-y-4">
                <Button
                  type="button"
                  intent="outline"
                  size="lg"
                  fullWidth
                  onClick={handleGoogleLogin}
                  className="justify-center gap-2.5"
                >
                  <GoogleIcon />
                  Masuk dengan Google
                </Button>

                <div className="flex items-center gap-3" role="presentation">
                  <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
                  <span className="text-xs text-stone-400">atau</span>
                  <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="username"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="nama@email.com"
                    value={loginEmail}
                    invalid={Boolean(errors.email)}
                    onChange={(event) => setLoginEmail(event.target.value)}
                  />
                  <FieldError>{errors.email}</FieldError>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Link
                      href="/lupa-password"
                      className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="login-password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Masukkan password Anda"
                    value={loginPassword}
                    invalid={Boolean(errors.password)}
                    onChange={(event) => setLoginPassword(event.target.value)}
                  />
                  <FieldError>{errors.password}</FieldError>
                </div>

                <Button type="submit" size="lg" fullWidth loading={isBusy}>
                  Masuk
                </Button>
                <p className="text-center text-sm text-stone-500">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    Daftar sekarang
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} noValidate className="mt-6 space-y-4">
                {/* Pemilih peran: masyarakat biasa atau petugas SPPG MBG */}
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-stone-700 dark:text-stone-200">
                    Daftar sebagai
                  </legend>
                  <div role="radiogroup" aria-label="Pilih jenis akun" className="flex gap-2">
                    {(["user", "petugas_sppg"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={regRole === option}
                        className={ROLE_CLASS(regRole === option)}
                        onClick={() => setRegRole(option)}
                      >
                        {REGISTRABLE_ROLE_LABELS[option]}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="space-y-1.5">
                  <Label htmlFor="register-name">Nama Lengkap</Label>
                  <Input
                    id="register-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Contoh: Siti Aminah"
                    value={regName}
                    invalid={Boolean(errors.name)}
                    onChange={(event) => setRegName(event.target.value)}
                  />
                  <FieldError>{errors.name}</FieldError>
                </div>

                {regRole === "petugas_sppg" ? (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="register-nip">NIP Petugas</Label>
                      <Input
                        id="register-nip"
                        name="nip"
                        placeholder="Contoh: 199203152019032007"
                        value={regNip}
                        invalid={Boolean(errors.nip)}
                        onChange={(event) => setRegNip(event.target.value)}
                      />
                      <FieldError>{errors.nip}</FieldError>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="register-sppg-unit">Nama Unit SPPG</Label>
                      <Input
                        id="register-sppg-unit"
                        name="sppgUnit"
                        placeholder="Contoh: SPPG Dolopo"
                        value={regSppgUnit}
                        invalid={Boolean(errors.sppgUnit)}
                        onChange={(event) => setRegSppgUnit(event.target.value)}
                      />
                      <FieldError>{errors.sppgUnit}</FieldError>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="register-region">Wilayah SPPG</Label>
                      <Input
                        id="register-region"
                        name="region"
                        placeholder="Contoh: Kec. Dolopo, Kab. Madiun"
                        value={regRegion}
                        invalid={Boolean(errors.region)}
                        onChange={(event) => setRegRegion(event.target.value)}
                      />
                      <FieldError>{errors.region}</FieldError>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="register-position">Jabatan (opsional)</Label>
                      <Input
                        id="register-position"
                        name="position"
                        placeholder="Contoh: Ahli Gizi"
                        value={regPosition}
                        invalid={Boolean(errors.position)}
                        onChange={(event) => setRegPosition(event.target.value)}
                      />
                      <FieldError>{errors.position}</FieldError>
                    </div>
                  </>
                ) : null}

                <div className="space-y-1.5">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={regEmail}
                    invalid={Boolean(errors.email)}
                    onChange={(event) => setRegEmail(event.target.value)}
                  />
                  <FieldError>{errors.email}</FieldError>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="register-phone">Nomor HP (opsional)</Label>
                  <Input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Contoh: 081234567890"
                    value={regPhone}
                    invalid={Boolean(errors.phone)}
                    onChange={(event) => setRegPhone(event.target.value)}
                  />
                  <FieldError>{errors.phone}</FieldError>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    10-15 digit angka. Bisa diisi atau diubah nanti di halaman Profil.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="register-password">Password</Label>
                  <PasswordInput
                    id="register-password"
                    name="password"
                    autoComplete="new-password"
                    aria-describedby="register-password-rules"
                    placeholder="Buat password"
                    value={regPassword}
                    invalid={Boolean(errors.password)}
                    onChange={(event) => setRegPassword(event.target.value)}
                  />
                  <PasswordChecklist
                    id="register-password-rules"
                    value={regPassword}
                    className="pt-0.5"
                  />
                  <FieldError>{errors.password}</FieldError>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="register-confirm">Konfirmasi Password</Label>
                  <PasswordInput
                    id="register-confirm"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    value={regConfirm}
                    invalid={Boolean(errors.confirmPassword)}
                    onChange={(event) => setRegConfirm(event.target.value)}
                  />
                  {regConfirm.length > 0 && regPassword === regConfirm ? (
                    <p className="flex items-center gap-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                      <Check className="size-3.5" aria-hidden="true" /> Password sudah sama
                    </p>
                  ) : null}
                  <FieldError>{errors.confirmPassword}</FieldError>
                </div>

                <Button type="submit" size="lg" fullWidth loading={isBusy}>
                  Buat Akun
                </Button>
                <p className="text-center text-sm text-stone-500">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    Masuk di sini
                  </button>
                </p>
              </form>
            )}
          </div>

          <div className="mt-6 border-t border-stone-100 pt-5 text-center">
            <GuestLoginButton />
          </div>
        </div>
      </div>
    </section>
  );
}

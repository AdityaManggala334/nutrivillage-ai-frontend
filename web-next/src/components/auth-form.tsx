"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GuestLoginButton } from "@/components/guest-login-button";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { useLoginMutation, useRegisterMutation } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LoginSchema,
  RegisterSchema,
  type AuthMode,
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

/** FR-01, FR-02, FR-03: halaman login, registrasi, dan mode tamu. */
export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [loginEmail, setLoginEmail] = useState("keluarga@nutrivillage.id");
  const [loginPassword, setLoginPassword] = useState("nutrivillage");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrors({});
    setServerError(null);
  };

  const goToOnboarding = () => {
    router.replace("/onboarding");
    router.refresh();
  };

  const goToAdmin = () => {
    router.replace("/admin");
    router.refresh();
  };

  /** Mengisi otomatis kredensial akun demo (pengguna / admin). */
  const fillDemo = (role: "user" | "admin") => {
    setMode("login");
    setErrors({});
    setServerError(null);
    if (role === "admin") {
      setLoginEmail("admin@nutrivillage.id");
      setLoginPassword("admin12345");
    } else {
      setLoginEmail("keluarga@nutrivillage.id");
      setLoginPassword("nutrivillage");
    }
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
    loginMutation.mutate(result.data, {
      onSuccess: (session) => {
        if (session.user.role === "admin") {
          goToAdmin();
        } else {
          goToOnboarding();
        }
      },
      onError: (error) => setServerError(error.message),
    });
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = RegisterSchema.safeParse({
      name: regName,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirm,
    });
    if (!result.success) {
      setErrors(mapIssues(result.error.issues));
      return;
    }
    setErrors({});
    setServerError(null);
    registerMutation.mutate(result.data, {
      onSuccess: goToOnboarding,
      onError: (error) => setServerError(error.message),
    });
  };

  const isBusy = loginMutation.isPending || registerMutation.isPending;

  return (
    <section aria-labelledby="auth-title" className="app-container flex justify-center py-14">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 id="auth-title" className="text-3xl">
            {mode === "login" ? "Masuk ke Akun Anda" : "Daftar Akun Baru"}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {mode === "login"
              ? "Lanjutkan menyusun menu keluarga Anda."
              : "Mulai perjalanan gizi keluarga bersama NutriVillage AI."}
          </p>
        </div>

        <div className="rounded-card mt-8 bg-white p-6 shadow-card sm:p-8">
          <div role="tablist" aria-label="Pilih mode autentikasi" className="flex gap-1 rounded-xl bg-stone-100 p-1">
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

          {/* Info akun demo (untuk pengujian) */}
          <div className="mt-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3 dark:border-brand-800 dark:bg-brand-950/30">
            <p className="text-xs font-semibold text-brand-800 dark:text-brand-200">
              Akun Demo
            </p>
            <div className="mt-1.5 space-y-1 text-xs text-stone-600 dark:text-stone-300">
              <p>
                Pengguna — <span className="font-mono">keluarga@nutrivillage.id</span> /{" "}
                <span className="font-mono">nutrivillage</span>
              </p>
              <p>
                Admin — <span className="font-mono">admin@nutrivillage.id</span> /{" "}
                <span className="font-mono">admin12345</span>
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" intent="secondary" onClick={() => fillDemo("user")}>
                Isi akun Pengguna
              </Button>
              <Button type="button" size="sm" intent="outline" onClick={() => fillDemo("admin")}>
                Isi akun Admin
              </Button>
            </div>
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

            {mode === "login" ? (
              <form onSubmit={handleLogin} noValidate className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={loginEmail}
                    invalid={Boolean(errors.email)}
                    onChange={(event) => setLoginEmail(event.target.value)}
                  />
                  <FieldError>{errors.email}</FieldError>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Minimal 8 karakter"
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
                <div className="space-y-1.5">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={regEmail}
                    invalid={Boolean(errors.email)}
                    onChange={(event) => setRegEmail(event.target.value)}
                  />
                  <FieldError>{errors.email}</FieldError>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter, memuat huruf & angka"
                    value={regPassword}
                    invalid={Boolean(errors.password)}
                    onChange={(event) => setRegPassword(event.target.value)}
                  />
                  <p className="text-xs text-stone-500">Gunakan kombinasi huruf dan angka.</p>
                  <FieldError>{errors.password}</FieldError>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-confirm">Konfirmasi Password</Label>
                  <Input
                    id="register-confirm"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    value={regConfirm}
                    invalid={Boolean(errors.confirmPassword)}
                    onChange={(event) => setRegConfirm(event.target.value)}
                  />
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

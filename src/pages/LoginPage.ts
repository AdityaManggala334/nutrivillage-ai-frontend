import { renderButton } from '../components/Button';
import { renderInput } from '../components/Input';

export type AuthMode = 'login' | 'register';

export interface LoginPageOptions {
  readonly mode: AuthMode;
}

const tabClass = (isActive: boolean): string =>
  [
    'flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none',
    isActive ? 'bg-white text-brand-700 shadow-sm' : 'text-stone-500 hover:text-stone-700',
  ].join(' ');

const renderAlert = (): string =>
  `<div data-form-alert role="alert" aria-live="assertive"
    class="mb-4 hidden rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"></div>`;

const renderLoginForm = (): string => `
  <form data-form="login" novalidate class="mt-6">
    ${renderAlert()}
    ${renderInput({
      id: 'login-email',
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'nama@email.com',
      autocomplete: 'email',
      required: true,
    })}
    ${renderInput({
      id: 'login-password',
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Minimal 8 karakter',
      autocomplete: 'current-password',
      required: true,
    })}
    <div class="mt-5">
      ${renderButton({ label: 'Masuk', type: 'submit', fullWidth: true, size: 'lg' })}
    </div>
    <p class="mt-4 text-center text-sm text-stone-500">
      Belum punya akun?
      <button type="button" data-action="auth-tab" data-mode="register"
        class="font-semibold text-brand-700 hover:underline">Daftar sekarang</button>
    </p>
  </form>`;

const renderRegisterForm = (): string => `
  <form data-form="register" novalidate class="mt-6">
    ${renderAlert()}
    ${renderInput({
      id: 'register-name',
      name: 'name',
      label: 'Nama Lengkap',
      placeholder: 'Contoh: Siti Aminah',
      autocomplete: 'name',
      required: true,
    })}
    ${renderInput({
      id: 'register-email',
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'nama@email.com',
      autocomplete: 'email',
      required: true,
    })}
    ${renderInput({
      id: 'register-password',
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: 'Minimal 8 karakter, memuat huruf & angka',
      autocomplete: 'new-password',
      hint: 'Gunakan kombinasi huruf dan angka.',
      required: true,
    })}
    ${renderInput({
      id: 'register-confirm',
      name: 'confirmPassword',
      label: 'Konfirmasi Password',
      type: 'password',
      placeholder: 'Ulangi password',
      autocomplete: 'new-password',
      required: true,
    })}
    <div class="mt-5">
      ${renderButton({ label: 'Buat Akun', type: 'submit', fullWidth: true, size: 'lg' })}
    </div>
    <p class="mt-4 text-center text-sm text-stone-500">
      Sudah punya akun?
      <button type="button" data-action="auth-tab" data-mode="login"
        class="font-semibold text-brand-700 hover:underline">Masuk di sini</button>
    </p>
  </form>`;

/** Halaman Login / Register (FR-01, FR-02) dengan validasi Zod. */
export const renderLoginPage = ({ mode }: LoginPageOptions): string => `
  <section aria-labelledby="auth-title" class="app-container flex justify-center py-14">
    <div class="w-full max-w-md">
      <div class="text-center">
        <h1 id="auth-title" class="text-3xl">
          ${mode === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Baru'}
        </h1>
        <p class="mt-2 text-sm text-stone-600">
          ${mode === 'login' ? 'Lanjutkan menyusun menu keluarga Anda.' : 'Mulai perjalanan gizi keluarga bersama NutriVillage AI.'}
        </p>
      </div>

      <div class="rounded-card mt-8 bg-white p-6 shadow-card sm:p-8">
        <div role="tablist" aria-label="Pilih mode autentikasi"
          class="flex gap-1 rounded-xl bg-stone-100 p-1">
          <button role="tab" type="button" aria-selected="${mode === 'login'}"
            data-action="auth-tab" data-mode="login" class="${tabClass(mode === 'login')}">
            Masuk
          </button>
          <button role="tab" type="button" aria-selected="${mode === 'register'}"
            data-action="auth-tab" data-mode="register" class="${tabClass(mode === 'register')}">
            Daftar
          </button>
        </div>

        <div role="tabpanel" aria-label="${mode === 'login' ? 'Form masuk' : 'Form pendaftaran'}">
          ${mode === 'login' ? renderLoginForm() : renderRegisterForm()}
        </div>

        <div class="mt-6 border-t border-stone-100 pt-5 text-center">
          <button type="button" data-action="guest-login"
            class="text-sm font-semibold text-stone-500 hover:text-brand-700">
            Lihat menu tanpa daftar (akses terbatas)
          </button>
        </div>
      </div>
    </div>
  </section>
`;

import { renderButton } from './components/Button';
import { renderDashboardPage } from './pages/DashboardPage';
import { renderLandingPage } from './pages/LandingPage';
import { type AuthMode, renderLoginPage } from './pages/LoginPage';
import { renderMemberRow, renderOnboardingPage } from './pages/OnboardingPage';
import { loginSchema, registerSchema } from './schemas/authSchema';
import { familyProfileFormSchema } from './schemas/profileSchema';
import { getStoredSession, guestLogin, login, logout, register } from './services/authApi';
import { fetchRecommendations } from './services/menuApi';
import { getStoredProfile, saveFamilyProfile } from './services/profileApi';
import type { AuthSession, FamilyProfile, Recommendation } from './types/domain';
import { type AsyncState, asyncIdle, asyncLoading } from './types/state';

/* ------------------------------------------------------------------ */
/* Tipe & state aplikasi                                               */
/* ------------------------------------------------------------------ */

type PageId = 'landing' | 'login' | 'onboarding' | 'dashboard';

interface AppState {
  page: PageId;
  authMode: AuthMode;
  session: AuthSession | null;
  profile: FamilyProfile | null;
  onboardingStep: number;
  recommendations: AsyncState<readonly Recommendation[]>;
}

interface RawMemberForm {
  name: string;
  age: string;
  gender: string;
  weightKg: string;
  activityLevel: string;
  allergies: string;
}

interface ValidationIssue {
  readonly path: readonly PropertyKey[];
  readonly message: string;
}

const MAX_ONBOARDING_STEP = 3;

const state: AppState = {
  page: 'landing',
  authMode: 'login',
  session: null,
  profile: null,
  onboardingStep: 0,
  recommendations: asyncIdle(),
};

/* ------------------------------------------------------------------ */
/* Helper DOM                                                          */
/* ------------------------------------------------------------------ */

const requireElement = <T extends Element>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Elemen wajib tidak ditemukan: ${selector}`);
  }
  return element;
};

const focusMain = (): void => {
  document.querySelector<HTMLElement>('#main-content')?.focus();
};

const announce = (message: string): void => {
  const live = document.querySelector<HTMLElement>('#live-region');
  if (!live) return;
  live.textContent = '';
  window.setTimeout(() => {
    live.textContent = message;
  }, 50);
};

/* ------------------------------------------------------------------ */
/* Render shell & halaman                                              */
/* ------------------------------------------------------------------ */

const renderHeader = (): string => {
  const isAuthed = state.session !== null;
  const nav = isAuthed
    ? `${renderButton({ label: 'Dashboard', action: 'nav-dashboard', intent: 'ghost', size: 'sm' })}
       ${renderButton({ label: 'Keluar', action: 'logout', intent: 'secondary', size: 'sm' })}`
    : `${renderButton({ label: 'Beranda', action: 'nav-landing', intent: 'ghost', size: 'sm' })}
       ${renderButton({ label: 'Masuk / Daftar', action: 'nav-login', size: 'sm' })}`;

  return `
  <div class="app-container flex h-16 items-center justify-between">
    <a href="#" data-action="nav-landing" class="flex items-center gap-2 rounded-lg"
      aria-label="NutriVillage AI, kembali ke beranda">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white"
        aria-hidden="true">NV</span>
      <span class="text-base font-bold text-stone-900">NutriVillage <span class="text-brand-600">AI</span></span>
    </a>
    <nav aria-label="Navigasi utama" class="flex items-center gap-2">${nav}</nav>
  </div>`;
};

const renderFooter = (): string => `
  <div class="app-container flex flex-col items-center justify-between gap-2 py-6 text-sm text-stone-500 sm:flex-row">
    <p>NutriVillage AI — Rekomendasi menu bergizi berbasis pangan lokal Madiun.</p>
    <p class="text-xs">Estimasi harga dapat berbeda dengan harga pasar aktual.</p>
  </div>`;

const renderCurrentPage = (): string => {
  switch (state.page) {
    case 'landing':
      return renderLandingPage();
    case 'login':
      return renderLoginPage({ mode: state.authMode });
    case 'onboarding':
      return renderOnboardingPage({ step: state.onboardingStep });
    case 'dashboard':
      return state.session
        ? renderDashboardPage({
            session: state.session,
            profile: state.profile,
            recommendations: state.recommendations,
          })
        : renderLandingPage();
  }
};

const renumberMembers = (list: HTMLElement): void => {
  list.querySelectorAll<HTMLElement>('[data-member-row]').forEach((row, index) => {
    const legend = row.querySelector<HTMLElement>('[data-member-legend]');
    if (legend) {
      legend.textContent = `Anggota Keluarga ${index + 1}`;
    }
  });
};

const render = (): void => {
  requireElement<HTMLElement>('#site-header').innerHTML = renderHeader();
  requireElement<HTMLElement>('#site-footer').innerHTML = renderFooter();
  requireElement<HTMLElement>('#app-view').innerHTML = renderCurrentPage();

  if (state.page === 'onboarding') {
    const list = document.querySelector<HTMLElement>('#member-list');
    if (list) renumberMembers(list);
  }

  if (state.page === 'dashboard' && state.recommendations.status === 'idle') {
    void loadRecommendations();
  }
};

const navigate = (page: PageId): void => {
  state.page = page;
  if (page === 'onboarding') {
    state.onboardingStep = 0;
  }
  render();
  focusMain();
};

/* ------------------------------------------------------------------ */
/* Data & aksi                                                         */
/* ------------------------------------------------------------------ */

const loadRecommendations = async (): Promise<void> => {
  state.recommendations = asyncLoading('Mencari menu bergizi sesuai anggaran keluarga...');
  if (state.page === 'dashboard') render();

  const result = await fetchRecommendations(state.profile?.dailyBudget);
  state.recommendations = result;

  if (state.page === 'dashboard') render();

  if (result.status === 'success') {
    announce(`${result.data.length} rekomendasi menu berhasil dimuat.`);
  } else if (result.status === 'error') {
    announce(result.message);
  }
};

/* ------------------------------------------------------------------ */
/* Form handling                                                       */
/* ------------------------------------------------------------------ */

const readForm = (form: HTMLFormElement): Record<string, string> => {
  const result: Record<string, string> = {};
  const entries = new FormData(form).entries();
  for (const [key, value] of entries) {
    if (typeof value === 'string') {
      result[key] = value;
    }
  }
  return result;
};

const fieldValue = (container: HTMLElement, field: string): string => {
  const element = container.querySelector<HTMLInputElement | HTMLSelectElement>(
    `[data-field="${field}"]`,
  );
  return element ? element.value : '';
};

const collectMember = (row: HTMLElement): RawMemberForm => ({
  name: fieldValue(row, 'name'),
  age: fieldValue(row, 'age'),
  gender: fieldValue(row, 'gender'),
  weightKg: fieldValue(row, 'weightKg'),
  activityLevel: fieldValue(row, 'activityLevel'),
  allergies: fieldValue(row, 'allergies'),
});

const clearErrors = (form: HTMLFormElement): void => {
  for (const slot of form.querySelectorAll<HTMLElement>('[data-error-for]')) {
    slot.textContent = '';
  }
  for (const field of form.querySelectorAll<HTMLElement>('[aria-invalid="true"]')) {
    field.removeAttribute('aria-invalid');
  }
  const alert = form.querySelector<HTMLElement>('[data-form-alert]');
  if (alert) {
    alert.textContent = '';
    alert.classList.add('hidden');
  }
};

const showIssues = (form: HTMLFormElement, issues: readonly ValidationIssue[]): void => {
  for (const issue of issues) {
    const first = issue.path[0];
    const second = issue.path[1];
    const third = issue.path[2];
    let slot: HTMLElement | null = null;
    let field: HTMLElement | null = null;

    if (first === 'members' && typeof second === 'number' && typeof third === 'string') {
      const rows = form.querySelectorAll<HTMLElement>('[data-member-row]');
      const row = rows[second];
      if (row) {
        slot = row.querySelector<HTMLElement>(`[data-error-for="${third}"]`);
        field = row.querySelector<HTMLElement>(`[data-field="${third}"]`);
      }
    } else if (typeof first === 'string') {
      slot = form.querySelector<HTMLElement>(`[data-error-for="${first}"]`);
      field = form.querySelector<HTMLElement>(`[data-field="${first}"]`);
    }

    if (slot) slot.textContent = issue.message;
    if (field) field.setAttribute('aria-invalid', 'true');
  }

  const alert = form.querySelector<HTMLElement>('[data-form-alert]');
  if (alert) {
    alert.textContent = 'Periksa kembali isian yang ditandai merah.';
    alert.classList.remove('hidden');
  }
};

const setAlert = (form: HTMLFormElement, message: string): void => {
  const alert = form.querySelector<HTMLElement>('[data-form-alert]');
  if (!alert) return;
  alert.textContent = message;
  alert.classList.remove('hidden');
};

const setFormBusy = (form: HTMLFormElement, busy: boolean): void => {
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!submit) return;
  submit.disabled = busy;
  submit.setAttribute('aria-busy', busy ? 'true' : 'false');
  if (busy) {
    submit.dataset.label = submit.textContent?.trim() ?? '';
    submit.textContent = 'Memproses...';
  } else if (submit.dataset.label) {
    submit.textContent = submit.dataset.label;
  }
};

const enterApp = (session: AuthSession): void => {
  state.session = session;
  state.profile = getStoredProfile();
  state.recommendations = asyncIdle();
  state.page = state.profile?.onboarded ? 'dashboard' : 'onboarding';
  state.onboardingStep = 0;
  render();
  focusMain();
};

const handleLogin = async (form: HTMLFormElement): Promise<void> => {
  const parsed = loginSchema.safeParse(readForm(form));
  clearErrors(form);
  if (!parsed.success) {
    showIssues(form, parsed.error.issues);
    return;
  }

  setFormBusy(form, true);
  const result = await login(parsed.data);
  setFormBusy(form, false);

  if (result.status === 'success') {
    announce(`Selamat datang kembali, ${result.data.user.name}.`);
    enterApp(result.data);
  } else if (result.status === 'error') {
    setAlert(form, result.message);
  }
};

const handleRegister = async (form: HTMLFormElement): Promise<void> => {
  const parsed = registerSchema.safeParse(readForm(form));
  clearErrors(form);
  if (!parsed.success) {
    showIssues(form, parsed.error.issues);
    return;
  }

  setFormBusy(form, true);
  const result = await register(parsed.data);
  setFormBusy(form, false);

  if (result.status === 'success') {
    announce(`Akun berhasil dibuat. Selamat datang, ${result.data.user.name}.`);
    enterApp(result.data);
  } else if (result.status === 'error') {
    setAlert(form, result.message);
  }
};

const handleFamily = async (form: HTMLFormElement): Promise<void> => {
  if (!state.session) {
    navigate('login');
    return;
  }

  const rows = form.querySelectorAll<HTMLElement>('[data-member-row]');
  const payload = {
    dailyBudget: fieldValue(form, 'dailyBudget'),
    region: fieldValue(form, 'region'),
    preferences: fieldValue(form, 'preferences'),
    avoidedIngredients: fieldValue(form, 'avoidedIngredients'),
    members: Array.from(rows).map(collectMember),
  };

  clearErrors(form);
  const parsed = familyProfileFormSchema.safeParse(payload);
  if (!parsed.success) {
    showIssues(form, parsed.error.issues);
    announce('Isian data keluarga belum valid.');
    return;
  }

  setFormBusy(form, true);
  const result = await saveFamilyProfile(state.session.user.id, payload);
  setFormBusy(form, false);

  if (result.status === 'success') {
    state.profile = result.data;
    state.recommendations = asyncIdle();
    state.page = 'dashboard';
    announce('Profil keluarga berhasil disimpan.');
    render();
    focusMain();
  } else if (result.status === 'error') {
    setAlert(form, result.message);
  }
};

/* ------------------------------------------------------------------ */
/* Event delegation                                                    */
/* ------------------------------------------------------------------ */

const onClick = (event: MouseEvent): void => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const actionEl = target.closest<HTMLElement>('[data-action]');
  if (!actionEl) return;

  event.preventDefault();
  const action = actionEl.dataset.action;

  switch (action) {
    case 'nav-landing':
      navigate('landing');
      break;
    case 'nav-login':
      state.authMode = 'login';
      navigate('login');
      break;
    case 'nav-dashboard':
      navigate('dashboard');
      break;
    case 'guest-login': {
      const session = guestLogin();
      announce('Masuk sebagai tamu. Fitur rekomendasi terbatas.');
      enterApp(session);
      break;
    }
    case 'logout':
      logout();
      state.session = null;
      state.profile = null;
      state.recommendations = asyncIdle();
      navigate('landing');
      announce('Anda telah keluar dari akun.');
      break;
    case 'auth-tab': {
      const mode = actionEl.dataset.mode;
      if (mode === 'login' || mode === 'register') {
        state.authMode = mode;
        render();
      }
      break;
    }
    case 'onboarding-next':
      if (state.onboardingStep < MAX_ONBOARDING_STEP) {
        state.onboardingStep += 1;
        render();
        focusMain();
      }
      break;
    case 'onboarding-prev':
      if (state.onboardingStep > 0) {
        state.onboardingStep -= 1;
        render();
        focusMain();
      }
      break;
    case 'add-member': {
      const list = document.querySelector<HTMLElement>('#member-list');
      if (list) {
        list.insertAdjacentHTML('beforeend', renderMemberRow());
        renumberMembers(list);
      }
      break;
    }
    case 'remove-member': {
      const row = actionEl.closest<HTMLElement>('[data-member-row]');
      const list = document.querySelector<HTMLElement>('#member-list');
      if (row && list && list.querySelectorAll('[data-member-row]').length > 1) {
        row.remove();
        renumberMembers(list);
      }
      break;
    }
    case 'retry-recommendations':
      state.recommendations = asyncIdle();
      void loadRecommendations();
      break;
    default:
      break;
  }
};

const onSubmit = (event: SubmitEvent): void => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const formType = form.dataset.form;

  if (formType === 'login') {
    event.preventDefault();
    void handleLogin(form);
  } else if (formType === 'register') {
    event.preventDefault();
    void handleRegister(form);
  } else if (formType === 'family') {
    event.preventDefault();
    void handleFamily(form);
  }
};

/* ------------------------------------------------------------------ */
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */

const boot = (): void => {
  state.session = getStoredSession();
  state.profile = getStoredProfile();
  state.page = state.session ? (state.profile?.onboarded ? 'dashboard' : 'onboarding') : 'landing';
  render();
};

export const initApp = (): void => {
  boot();
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
};

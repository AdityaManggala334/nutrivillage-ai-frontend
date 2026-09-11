import { renderBadge } from '../components/Badge';
import { renderButton } from '../components/Button';
import { formatRupiah } from '../components/utils';
import {
  type AuthSession,
  type FamilyProfile,
  type Recommendation,
} from '../types/domain';
import { matchAsyncState, type AsyncState } from '../types/state';

export interface DashboardPageOptions {
  readonly session: AuthSession;
  readonly profile: FamilyProfile | null;
  readonly recommendations: AsyncState<readonly Recommendation[]>;
};

/* =========================================================
 * ICON
 * ======================================================= */

const icon = (name: string, size = 20): string => {
  const paths: Record<string, string> = {
    home: `
      <path d="M3 10.5 12 3l9 7.5"/>
      <path d="M5 9.5V21h14V9.5"/>
      <path d="M9 21v-6h6v6"/>
    `,
    explore: `
      <circle cx="11" cy="11" r="7"/>
      <path d="m20 20-4-4"/>
    `,
    calendar: `
      <rect x="3" y="4.5" width="18" height="16" rx="2"/>
      <path d="M16 2.5v4M8 2.5v4M3 9h18"/>
    `,
    cart: `
      <circle cx="9" cy="19" r="1.5"/>
      <circle cx="18" cy="19" r="1.5"/>
      <path d="M3 4h2l2.2 10.5h11L21 7H6"/>
    `,
    history: `
      <path d="M3 12a9 9 0 1 0 3-6.7"/>
      <path d="M3 4v5h5"/>
      <path d="M12 7v5l3 2"/>
    `,
    heart: `
      <path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"/>
    `,
    user: `
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21a8 8 0 0 1 16 0"/>
    `,
    settings: `
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.7 1Z"/>
    `,
    bell: `
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
      <path d="M10 21h4"/>
    `,
    arrow: `
      <path d="M5 12h14"/>
      <path d="m13 6 6 6-6 6"/>
    `,
    leaf: `
      <path d="M20 4C10 4 5 8 5 15c0 2.8 2.2 5 5 5 7 0 10-6 10-16Z"/>
      <path d="M4 20c4-4 7-7 12-10"/>
    `,
    bowl: `
      <path d="M4 11h16a8 8 0 0 1-16 0Z"/>
      <path d="M9 3.5c0 1.8-2 2-2 3.8"/>
      <path d="M13 3.5c0 1.8-2 2-2 3.8"/>
    `,
    sprout: `
      <path d="M7 20h10"/>
      <path d="M12 20v-7"/>
      <path d="M12 13c0-3 2-5 5-5 0 3-2 5-5 5Z"/>
      <path d="M12 15c0-2-1.5-3.5-3.5-3.5 0 2 1.5 3.5 3.5 3.5Z"/>
    `,
    apple: `
      <circle cx="12" cy="13.5" r="6.5"/>
      <path d="M12 7V4"/>
      <path d="M12 7c1.5-.5 3-1.5 3.5-3"/>
    `,
    wallet: `
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v1.5"/>
      <path d="M3 7.5V17a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3"/>
      <path d="M21 9h-4.5a2.5 2.5 0 0 0 0 5H21Z"/>
    `,
  };

  return `
    <svg
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      ${paths[name] ?? ''}
    </svg>
  `;
};

/* =========================================================
 * SIDEBAR
 * ======================================================= */

const renderNavItem = (
  label: string,
  iconName: string,
  action: string,
  active = false,
  badge?: string,
): string => `
  <button
    type="button"
    data-action="${action}"
    class="
      group flex w-full items-center gap-3 rounded-xl px-3 py-2.5
      text-left text-sm font-medium transition
      ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
      }
    "
  >
    <span class="${active ? 'text-white' : 'text-stone-500'}">
      ${icon(iconName, 19)}
    </span>

    <span class="flex-1">${label}</span>

    ${
      badge
        ? `<span class="min-w-5 rounded-full bg-white/25 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
            ${badge}
           </span>`
        : ''
    }
  </button>
`;

const renderSidebar = (): string => `
  <aside
    class="
      fixed inset-y-0 left-0 z-40 hidden w-[245px]
      border-r border-stone-200 bg-white lg:flex lg:flex-col
    "
  >
    <!-- Logo -->
    <div class="flex h-[88px] items-center px-7">
      <div class="flex items-center gap-3">
        <div
          class="
            flex h-10 w-10 items-center justify-center
            rounded-xl bg-emerald-600 text-white
          "
        >
          ${icon('leaf', 23)}
        </div>

        <div>
          <p class="text-[16px] font-bold tracking-tight text-stone-900">
            NutriVillage
          </p>
          <p class="text-[10px] font-medium text-stone-400">
            AI
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-4">

      <p class="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
        Menu
      </p>

      <div class="space-y-1">
        ${renderNavItem('Beranda', 'home', 'navigate-dashboard', true)}
        ${renderNavItem('Explore', 'explore', 'navigate-explore')}
        ${renderNavItem('Meal Planner', 'calendar', 'navigate-meal-planner')}
        ${renderNavItem(
          'Daftar Belanja',
          'cart',
          'navigate-shopping-list',
          false,
          '0',
        )}
      </div>

      <p class="mb-2 mt-8 px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
        Aktivitas
      </p>

      <div class="space-y-1">
        ${renderNavItem('Riwayat', 'history', 'navigate-history')}
        ${renderNavItem('Favorit', 'heart', 'navigate-favorites')}
      </div>

      <p class="mb-2 mt-8 px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
        Akun
      </p>

      <div class="space-y-1">
        ${renderNavItem('Profil', 'user', 'navigate-profile')}
        ${renderNavItem('Pengaturan', 'settings', 'navigate-settings')}
      </div>
    </nav>

    <!-- Bottom profile -->
    <div class="border-t border-stone-100 p-4">
      <button
        type="button"
        data-action="navigate-profile"
        class="
          flex w-full items-center gap-3 rounded-xl p-2
          text-left hover:bg-stone-50
        "
      >
        <div
          class="
            flex h-9 w-9 shrink-0 items-center justify-center
            rounded-full bg-emerald-100 text-xs font-bold text-emerald-800
          "
        >
          AM
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-stone-800">
            Aditya
          </p>
          <p class="text-[11px] text-stone-400">
            Pengguna
          </p>
        </div>

        <span class="text-stone-400">
          ${icon('arrow', 16)}
        </span>
      </button>
    </div>
  </aside>
`;

/* =========================================================
 * MOBILE NAVBAR
 * ======================================================= */

const renderMobileHeader = (session: AuthSession): string => `
  <header
    class="
      sticky top-0 z-30 flex h-16 items-center justify-between
      border-b border-stone-200 bg-white/95 px-4 backdrop-blur
      lg:hidden
    "
  >
    <div class="flex items-center gap-2">
      <div
        class="
          flex h-8 w-8 items-center justify-center
          rounded-lg bg-emerald-600 text-white
        "
      >
        ${icon('leaf', 18)}
      </div>

      <span class="text-sm font-bold text-stone-900">
        NutriVillage AI
      </span>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        aria-label="Notifikasi"
        class="relative text-stone-500"
      >
        ${icon('bell', 20)}
      </button>

      <div
        class="
          flex h-8 w-8 items-center justify-center rounded-full
          bg-emerald-100 text-[11px] font-bold text-emerald-800
        "
      >
        ${session.user.name
          .split(' ')
          .slice(0, 2)
          .map((name) => name.charAt(0))
          .join('')
          .toUpperCase()}
      </div>
    </div>
  </header>
`;

/* =========================================================
 * PROFILE SUMMARY
 * ======================================================= */

const renderProfileSummary = (
  profile: FamilyProfile | null,
): string => {
  if (!profile) {
    return `
      <div
        class="
          rounded-2xl border border-amber-200 bg-amber-50
          p-5
        "
      >
        <p class="text-sm font-semibold text-amber-900">
          Profil keluarga belum lengkap
        </p>

        <p class="mt-1 text-sm text-amber-800">
          Lengkapi data keluarga agar rekomendasi menu dapat
          disesuaikan dengan kebutuhanmu.
        </p>

        <div class="mt-4">
          ${renderButton({
            label: 'Lengkapi Profil',
            action: 'navigate-profile',
          })}
        </div>
      </div>
    `;
  }

  const memberNames = profile.members
    .slice(0, 3)
    .map((member) => member.name)
    .join(', ');

  const extraMembers =
    profile.members.length > 3
      ? ` +${profile.members.length - 3}`
      : '';

  return `
    <section class="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div class="flex items-start justify-between gap-5 border-b border-stone-100 p-5 md:p-6">

        <div>
          <div class="flex items-center gap-2">
            <span class="text-emerald-600">
              ${icon('user', 18)}
            </span>

            <h2 class="text-base font-bold text-stone-900">
              Profil Keluarga
            </h2>
          </div>

          <p class="mt-1 max-w-xl text-xs leading-relaxed text-stone-500">
            Data keluarga digunakan sebagai dasar penyusunan
            rekomendasi menu.
          </p>
        </div>

        <button
          type="button"
          data-action="navigate-profile"
          class="
            hidden items-center gap-1 text-xs font-semibold
            text-emerald-700 hover:text-emerald-900 sm:flex
          "
        >
          Lihat detail
          ${icon('arrow', 15)}
        </button>
      </div>

      <div class="grid sm:grid-cols-3">

        <div class="border-b border-stone-100 p-5 sm:border-b-0 sm:border-r">
          <p class="text-[11px] font-medium text-stone-400">
            Anggota keluarga
          </p>

          <p class="mt-1 text-xl font-bold text-stone-900">
            ${profile.members.length} orang
          </p>

          <p class="mt-1 truncate text-xs text-stone-500">
            ${memberNames}${extraMembers}
          </p>
        </div>

        <div class="border-b border-stone-100 p-5 sm:border-b-0 sm:border-r">
          <p class="text-[11px] font-medium text-stone-400">
            Budget harian
          </p>

          <p class="mt-1 text-xl font-bold text-stone-900">
            ${formatRupiah(profile.dailyBudget)}
          </p>

          <p class="mt-1 text-xs text-stone-500">
            Anggaran keluarga per hari
          </p>
        </div>

        <div class="p-5">
          <p class="text-[11px] font-medium text-stone-400">
            Wilayah
          </p>

          <p class="mt-1 text-xl font-bold text-stone-900">
            ${profile.region}
          </p>

          <p class="mt-1 text-xs text-stone-500">
            Fokus pangan lokal Madiun
          </p>
        </div>

      </div>

      ${
        profile.avoidedIngredients.length > 0
          ? `
            <div class="border-t border-stone-100 px-5 py-3 md:px-6">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[11px] font-semibold text-stone-500">
                  Pantangan:
                </span>

                ${profile.avoidedIngredients
                  .map((item) =>
                    renderBadge({
                      label: item,
                      tone: 'danger',
                    }),
                  )
                  .join('')}
              </div>
            </div>
          `
          : ''
      }
    </section>
  `;
};

/* =========================================================
 * RECOMMENDATION CARD
 * ======================================================= */

const renderRecommendationCard = (
  recommendation: Recommendation,
): string => {
  const { recipe, scores } = recommendation;

  return `
    <article
      class="
        group flex flex-col overflow-hidden rounded-2xl border
        border-stone-200 bg-white transition
        hover:border-emerald-300 hover:shadow-sm
      "
    >
      <div class="relative flex h-40 items-center justify-center border-b border-stone-100 bg-emerald-50">
        <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
          ${icon('bowl', 30)}
        </span>

        <span class="absolute left-4 top-4 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold text-emerald-700">
          ${recipe.category}
        </span>

        <span
          class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold tabular-nums text-white"
          aria-label="Skor ${scores.total} dari 100"
        >
          ${scores.total}
        </span>
      </div>

      <div class="flex flex-1 flex-col p-5">
        <h3 class="text-base font-bold text-stone-900">
          ${recipe.name}
        </h3>

        <p class="mt-1 text-xs text-stone-400">
          ${recipe.servings} porsi
        </p>

        <p class="mt-3 line-clamp-2 text-xs leading-relaxed text-stone-500">
          ${recipe.description}
        </p>

        <!-- Nutrition -->
        <div class="mt-4 grid grid-cols-3 divide-x divide-stone-100 overflow-hidden rounded-xl border border-stone-100">
          <div class="p-2 text-center">
            <p class="text-[10px] text-stone-400">Kalori</p>
            <p class="mt-0.5 text-xs font-bold tabular-nums text-stone-800">${recipe.nutrition.calories}</p>
          </div>
          <div class="p-2 text-center">
            <p class="text-[10px] text-stone-400">Protein</p>
            <p class="mt-0.5 text-xs font-bold tabular-nums text-stone-800">${recipe.nutrition.protein} g</p>
          </div>
          <div class="p-2 text-center">
            <p class="text-[10px] text-stone-400">Serat</p>
            <p class="mt-0.5 text-xs font-bold tabular-nums text-stone-800">${recipe.nutrition.fiber} g</p>
          </div>
        </div>

        <div class="mt-auto flex items-end justify-between border-t border-stone-100 pt-4">

          <div>
            <p class="text-[10px] text-stone-400">
              Estimasi biaya
            </p>

            <p class="mt-0.5 text-sm font-bold tabular-nums text-emerald-700">
              ${formatRupiah(recipe.estimatedCost)}
            </p>
          </div>

          <button
            type="button"
            data-action="open-recommendation"
            data-recommendation-id="${recipe.id}"
            class="
              flex items-center gap-1 text-xs font-semibold
              text-stone-600 hover:text-emerald-700
            "
          >
            Lihat detail
            ${icon('arrow', 15)}
          </button>

        </div>
      </div>
    </article>
  `;
};

/* =========================================================
 * RECOMMENDATION STATES
 * ======================================================= */

const renderRecommendationLoading = (
  message: string,
): string => `
  <div role="status" aria-live="polite">

    <p class="mb-4 text-xs text-stone-500">
      ${message}
    </p>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

      ${[0, 1, 2]
        .map(
          () => `
            <div
              class="
                overflow-hidden rounded-2xl border
                border-stone-200 bg-white
                animate-pulse
              "
            >
              <div class="h-40 bg-stone-100"></div>

              <div class="space-y-3 p-5">
                <div class="h-3 w-20 rounded bg-stone-200"></div>
                <div class="h-5 w-3/4 rounded bg-stone-200"></div>
                <div class="h-3 w-full rounded bg-stone-100"></div>
                <div class="h-3 w-4/5 rounded bg-stone-100"></div>

                <div class="grid grid-cols-3 gap-2 pt-2">
                  <div class="h-12 rounded bg-stone-100"></div>
                  <div class="h-12 rounded bg-stone-100"></div>
                  <div class="h-12 rounded bg-stone-100"></div>
                </div>
              </div>
            </div>
          `,
        )
        .join('')}

    </div>
  </div>
`;

const renderRecommendationError = (
  message: string,
  retryable: boolean,
): string => `
  <div
    role="alert"
    class="
      rounded-2xl border border-red-100
      bg-red-50 p-6 text-center
    "
  >
    <p class="text-sm font-semibold text-red-800">
      Rekomendasi belum dapat dimuat
    </p>

    <p class="mt-1 text-xs text-red-700">
      ${message}
    </p>

    ${
      retryable
        ? `
          <div class="mt-4">
            ${renderButton({
              label: 'Coba Lagi',
              action: 'retry-recommendations',
            })}
          </div>
        `
        : ''
    }
  </div>
`;

const renderRecommendationEmpty = (): string => `
  <div
    class="
      rounded-2xl border border-stone-200
      bg-white p-8 text-center
    "
  >
    <div
      class="
        mx-auto flex h-12 w-12 items-center
        justify-center rounded-full bg-stone-100
      "
    >
      ${icon('explore', 22)}
    </div>

    <p class="mt-4 text-sm font-semibold text-stone-800">
      Belum ada rekomendasi
    </p>

    <p class="mx-auto mt-1 max-w-md text-xs leading-relaxed text-stone-500">
      Coba buat rekomendasi menu melalui Explore
      berdasarkan kebutuhan keluarga.
    </p>

    <div class="mt-4">
      ${renderButton({
        label: 'Buka Explore',
        action: 'navigate-explore',
      })}
    </div>
  </div>
`;

/* =========================================================
 * QUICK ACTION
 * ======================================================= */

const renderQuickAction = (
  title: string,
  description: string,
  iconName: string,
  action: string,
): string => `
  <button
    type="button"
    data-action="${action}"
    class="
      group flex items-center gap-4 rounded-xl
      border border-stone-200 bg-white p-4
      text-left transition
      hover:border-emerald-200 hover:bg-emerald-50/40
    "
  >
    <span
      class="
        flex h-10 w-10 shrink-0 items-center
        justify-center rounded-lg bg-emerald-50
        text-emerald-700
      "
    >
      ${icon(iconName, 19)}
    </span>

    <span class="min-w-0 flex-1">
      <span class="block text-sm font-semibold text-stone-800">
        ${title}
      </span>

      <span class="mt-0.5 block text-[11px] text-stone-400">
        ${description}
      </span>
    </span>

    <span
      class="
        text-stone-300 transition
        group-hover:translate-x-0.5
        group-hover:text-emerald-600
      "
    >
      ${icon('arrow', 16)}
    </span>
  </button>
`;

/* =========================================================
 * DASHBOARD
 * ======================================================= */

export const renderDashboardPage = ({
  session,
  profile,
  recommendations,
}: DashboardPageOptions): string => `
  <div class="min-h-screen bg-[#fafbf9] text-stone-900">

    ${renderSidebar()}

    <div class="lg:pl-[245px]">

      ${renderMobileHeader(session)}

      <!-- Desktop topbar -->
      <header
        class="
          hidden h-[72px] items-center justify-between
          border-b border-stone-200 bg-white px-8
          lg:flex
        "
      >

        <div class="flex items-center gap-3">
          <div
            class="
              flex h-9 w-9 items-center justify-center
              rounded-lg bg-stone-50 text-stone-500
            "
          >
            ${icon('explore', 18)}
          </div>

          <p class="text-sm text-stone-500">
            Dashboard
          </p>
        </div>

        <div class="flex items-center gap-5">

          <button
            type="button"
            aria-label="Notifikasi"
            class="relative text-stone-500 hover:text-stone-800"
          >
            ${icon('bell', 20)}

            <span
              class="
                absolute right-0.5 top-0.5 h-1.5 w-1.5
                rounded-full bg-red-500
              "
            ></span>
          </button>

          <div class="h-6 w-px bg-stone-200"></div>

          <button
            type="button"
            data-action="navigate-profile"
            class="flex items-center gap-2"
          >
            <div
              class="
                flex h-8 w-8 items-center justify-center
                rounded-full bg-emerald-100
                text-[10px] font-bold text-emerald-800
              "
            >
              ${session.user.name
                .split(' ')
                .slice(0, 2)
                .map((name) => name.charAt(0))
                .join('')
                .toUpperCase()}
            </div>

            <span class="text-xs font-semibold text-stone-700">
              ${session.user.name}
            </span>
          </button>

        </div>
      </header>

      <!-- Main -->
      <main class="mx-auto max-w-[1450px] px-4 py-6 md:px-8 md:py-8">

        <!-- Greeting -->
        <section class="mb-7">

          <p class="text-xs font-medium text-emerald-700">
            Selamat datang kembali
          </p>

          <div class="mt-1 flex flex-wrap items-end justify-between gap-4">

            <div>
              <h1
                id="dashboard-title"
                class="
                  text-2xl font-bold tracking-tight
                  text-stone-900 md:text-3xl
                "
              >
                Halo, ${session.user.name}
              </h1>

              <p class="mt-2 max-w-xl text-sm leading-relaxed text-stone-500">
                Temukan pilihan makanan yang sesuai kebutuhan
                keluarga dan budget harianmu.
              </p>
            </div>

            <div class="hidden md:block">
              ${renderBadge({
                label: 'Pangan Lokal Madiun',
                tone: 'brand',
                size: 'md',
              })}
            </div>

          </div>
        </section>

        <!-- Profile -->
        ${renderProfileSummary(profile)}

        <!-- Two-column area -->
        <div class="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">

          <!-- LEFT -->
          <div class="min-w-0">

            <!-- Recommendations -->
            <section aria-labelledby="recommendation-title">

              <div
                class="
                  mb-4 flex flex-wrap items-end
                  justify-between gap-3
                "
              >
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                    Untuk keluargamu
                  </p>

                  <h2
                    id="recommendation-title"
                    class="mt-1 text-xl font-bold text-stone-900"
                  >
                    Rekomendasi Terakhir
                  </h2>

                  <p class="mt-1 text-xs text-stone-500">
                    Pilihan berdasarkan profil dan budget keluarga.
                  </p>
                </div>

                <button
                  type="button"
                  data-action="navigate-explore"
                  class="
                    flex items-center gap-1 text-xs
                    font-semibold text-emerald-700
                    hover:text-emerald-900
                  "
                >
                  Lihat semua
                  ${icon('arrow', 15)}
                </button>
              </div>

              ${matchAsyncState(recommendations, {
                idle: () =>
                  renderRecommendationLoading(
                    'Menyiapkan rekomendasi...',
                  ),

                loading: (message) =>
                  renderRecommendationLoading(message),

                success: (data) =>
                  data.length === 0
                    ? renderRecommendationEmpty()
                    : `
                      <div
                        class="
                          grid gap-4
                          md:grid-cols-2
                          xl:grid-cols-3
                        "
                      >
                        ${data
                          .slice(0, 3)
                          .map(renderRecommendationCard)
                          .join('')}
                      </div>
                    `,

                error: (message, retryable) =>
                  renderRecommendationError(
                    message,
                    retryable,
                  ),
              })}

            </section>

            <!-- Quick Actions -->
            <section class="mt-9">

              <div class="mb-4">
                <h2 class="text-lg font-bold text-stone-900">
                  Akses Cepat
                </h2>

                <p class="mt-1 text-xs text-stone-500">
                  Lanjutkan aktivitasmu di NutriVillage AI.
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                ${renderQuickAction(
                  'Explore Menu',
                  'Buat rekomendasi baru',
                  'explore',
                  'navigate-explore',
                )}

                ${renderQuickAction(
                  'Meal Planner',
                  'Atur menu selama 7 hari',
                  'calendar',
                  'navigate-meal-planner',
                )}

                ${renderQuickAction(
                  'Daftar Belanja',
                  'Kelola bahan yang akan dibeli',
                  'cart',
                  'navigate-shopping-list',
                )}

                ${renderQuickAction(
                  'Riwayat',
                  'Lihat rekomendasi sebelumnya',
                  'history',
                  'navigate-history',
                )}
              </div>

            </section>

          </div>

          <!-- RIGHT -->
          <aside class="space-y-4">

            <!-- Budget -->
            <section
              class="
                rounded-2xl border border-stone-200
                bg-white p-5
              "
            >
              <div class="flex items-start justify-between">

                <div>
                  <p class="text-[11px] font-medium text-stone-400">
                    Budget Harian
                  </p>

                  <p class="mt-1 text-xl font-bold text-stone-900">
                    ${
                      profile
                        ? formatRupiah(profile.dailyBudget)
                        : '—'
                    }
                  </p>
                </div>

                <span
                  class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white"
                  aria-hidden="true"
                >
                  ${icon('wallet', 18)}
                </span>

              </div>

              <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div
                  class="h-full w-[62%] rounded-full bg-emerald-500"
                ></div>
              </div>

              <p class="mt-2 text-[10px] text-stone-400">
                Estimasi budget berdasarkan profil keluarga
              </p>
            </section>

            <!-- Local food -->
            <section
              class="
                rounded-2xl border border-stone-200
                bg-white p-5
              "
            >

              <div class="flex items-center justify-between">

                <div class="flex items-center gap-2">
                  <span class="text-emerald-700">
                    ${icon('leaf', 18)}
                  </span>

                  <h2 class="text-sm font-bold text-stone-900">
                    Pangan Lokal
                  </h2>
                </div>

                <button
                  type="button"
                  data-action="navigate-explore"
                  class="text-[11px] font-semibold text-emerald-700"
                >
                  Lihat semua
                </button>

              </div>

              <p class="mt-1 text-[11px] text-stone-400">
                Bahan yang sedang tersedia di wilayah Madiun.
              </p>

              <div class="mt-4 grid grid-cols-3 gap-2">

                <div>
                  <div class="flex h-20 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    ${icon('sprout', 26)}
                  </div>

                  <p class="mt-2 text-[11px] font-medium text-stone-700">
                    Bayam
                  </p>
                </div>

                <div>
                  <div class="flex h-20 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    ${icon('leaf', 26)}
                  </div>

                  <p class="mt-2 text-[11px] font-medium text-stone-700">
                    Kangkung
                  </p>
                </div>

                <div>
                  <div class="flex h-20 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    ${icon('apple', 26)}
                  </div>

                  <p class="mt-2 text-[11px] font-medium text-stone-700">
                    Tomat
                  </p>
                </div>

              </div>

            </section>

            <!-- Daily tip -->
            <section
              class="
                overflow-hidden rounded-2xl
                bg-emerald-800 p-5 text-white
              "
            >

              <p class="text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                Tips hari ini
              </p>

              <p class="mt-3 text-sm font-medium leading-relaxed">
                Kombinasikan bahan lokal dengan sumber protein
                agar menu tetap sederhana, terjangkau, dan bergizi.
              </p>

              <div class="mt-5 flex justify-end text-emerald-300">
                ${icon('leaf', 28)}
              </div>

            </section>

          </aside>

        </div>

      </main>
    </div>
  </div>
`;
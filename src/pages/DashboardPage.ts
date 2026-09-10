import { renderBadge } from '../components/Badge';
import { renderButton } from '../components/Button';
import { renderCard } from '../components/Card';
import { formatRupiah } from '../components/utils';
import { AGE_GROUP_LABELS, type AuthSession, type FamilyProfile, type Recommendation } from '../types/domain';
import { matchAsyncState, type AsyncState } from '../types/state';

export interface DashboardPageOptions {
  readonly session: AuthSession;
  readonly profile: FamilyProfile | null;
  readonly recommendations: AsyncState<readonly Recommendation[]>;
}

const renderProfileSummary = (profile: FamilyProfile | null): string => {
  if (!profile) {
    return renderCard({
      variant: 'outline',
      content: `<p class="text-sm text-stone-600">
        Profil keluarga belum lengkap. Silakan isi data keluarga terlebih dahulu.
      </p>`,
    });
  }

  const ageSummary = profile.members
    .map((member) => `${member.name} (${AGE_GROUP_LABELS[member.ageGroup]})`)
    .join(', ');

  const stat = (label: string, value: string): string => `
    <div class="rounded-xl bg-stone-50 px-4 py-3">
      <dt class="text-xs font-medium text-stone-500">${label}</dt>
      <dd class="mt-1 text-base font-bold text-stone-900">${value}</dd>
    </div>`;

  return renderCard({
    title: 'Ringkasan Profil Keluarga',
    description: 'Data ini menjadi dasar penyusunan rekomendasi menu.',
    content: `
      <dl class="grid gap-3 sm:grid-cols-3">
        ${stat('Budget Harian', formatRupiah(profile.dailyBudget))}
        ${stat('Jumlah Anggota', `${profile.members.length} orang`)}
        ${stat('Wilayah', profile.region)}
      </dl>
      <p class="mt-4 text-sm text-stone-600"><span class="font-semibold">Anggota:</span> ${ageSummary}</p>
      ${
        profile.avoidedIngredients.length > 0
          ? `<div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="text-xs font-semibold text-stone-500">Dihindari:</span>
              ${profile.avoidedIngredients.map((item) => renderBadge({ label: item, tone: 'danger' })).join('')}
            </div>`
          : ''
      }`,
  });
};

const renderRecommendationCard = (recommendation: Recommendation): string => {
  const { recipe, scores } = recommendation;
  const nutrient = (label: string, value: string): string => `
    <div class="rounded-lg bg-brand-50 px-3 py-2 text-center">
      <dt class="text-[11px] font-medium text-brand-700">${label}</dt>
      <dd class="text-sm font-bold text-brand-900">${value}</dd>
    </div>`;

  return renderCard({
    variant: 'elevated',
    content: `
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-stone-900">${recipe.name}</h3>
          <p class="mt-1 text-xs text-stone-500">${recipe.category} · ${recipe.servings} porsi</p>
        </div>
        ${renderBadge({ label: `Skor ${scores.total}`, tone: 'harvest', size: 'md' })}
      </div>
      <p class="mt-3 text-sm text-stone-600">${recipe.description}</p>
      <dl class="mt-4 grid grid-cols-3 gap-2">
        ${nutrient('Kalori', `${recipe.nutrition.calories} kkal`)}
        ${nutrient('Protein', `${recipe.nutrition.protein} g`)}
        ${nutrient('Serat', `${recipe.nutrition.fiber} g`)}
      </dl>
      <p class="mt-4 rounded-lg bg-stone-50 p-3 text-xs leading-relaxed text-stone-600">
        ${recommendation.explanation}
      </p>`,
    footer: `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[11px] text-stone-500">Estimasi biaya</p>
          <p class="text-base font-bold text-brand-700">${formatRupiah(recipe.estimatedCost)}</p>
        </div>
        <span class="text-xs text-stone-500">${recipe.ingredients.length} bahan</span>
      </div>`,
  });
};

const renderLoading = (message: string): string => `
  <div class="space-y-4" role="status" aria-live="polite">
    <p class="text-sm text-stone-500">${message}</p>
    <div class="grid gap-5 md:grid-cols-2">
      ${[0, 1, 2, 3]
        .map(
          () => `
        <div class="rounded-card animate-pulse bg-white p-5 shadow-card">
          <div class="h-5 w-2/3 rounded bg-stone-200"></div>
          <div class="mt-3 h-4 w-full rounded bg-stone-100"></div>
          <div class="mt-2 h-4 w-4/5 rounded bg-stone-100"></div>
          <div class="mt-5 grid grid-cols-3 gap-2">
            <div class="h-12 rounded bg-stone-100"></div>
            <div class="h-12 rounded bg-stone-100"></div>
            <div class="h-12 rounded bg-stone-100"></div>
          </div>
        </div>`,
        )
        .join('')}
    </div>
  </div>`;

const renderError = (message: string, retryable: boolean): string =>
  renderCard({
    variant: 'outline',
    content: `
      <div role="alert" class="text-center">
        <p class="text-base font-semibold text-red-700">Gagal memuat rekomendasi</p>
        <p class="mt-1 text-sm text-stone-600">${message}</p>
        ${
          retryable
            ? `<div class="mt-4">${renderButton({ label: 'Coba Lagi', action: 'retry-recommendations' })}</div>`
            : ''
        }
      </div>`,
  });

const renderEmpty = (): string =>
  renderCard({
    variant: 'outline',
    content: `
      <div class="text-center">
        <p class="text-base font-semibold text-stone-800">Belum ada menu yang sesuai budget</p>
        <p class="mt-1 text-sm text-stone-600">
          Coba naikkan anggaran harian pada data keluarga, lalu muat ulang rekomendasi.
        </p>
        <div class="mt-4">${renderButton({ label: 'Muat Ulang', action: 'retry-recommendations' })}</div>
      </div>`,
  });

/** Dashboard utama (FR-07) dengan state async idle/loading/success/error. */
export const renderDashboardPage = ({
  session,
  profile,
  recommendations,
}: DashboardPageOptions): string => `
  <section aria-labelledby="dashboard-title" class="app-container py-10">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-brand-700">Halo, ${session.user.name}</p>
        <h1 id="dashboard-title" class="mt-1 text-3xl">Dashboard Keluarga</h1>
      </div>
      ${renderBadge({ label: 'Pangan Lokal Madiun', tone: 'brand', size: 'md' })}
    </header>

    <div class="mt-6">
      ${renderProfileSummary(profile)}
    </div>

    <section aria-labelledby="recommendation-title" class="mt-10">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="recommendation-title" class="text-2xl">Rekomendasi Menu</h2>
          <p class="mt-1 text-sm text-stone-600">
            Hasil simulasi Recommendation Engine berdasarkan budget keluarga.
          </p>
        </div>
        ${renderButton({ label: 'Muat Ulang', action: 'retry-recommendations', intent: 'secondary', size: 'sm' })}
      </div>

      <div class="mt-6">
        ${matchAsyncState(recommendations, {
          idle: () => renderLoading('Menyiapkan rekomendasi...'),
          loading: (message) => renderLoading(message),
          success: (data) =>
            data.length === 0
              ? renderEmpty()
              : `<div class="grid gap-5 md:grid-cols-2">${data.map(renderRecommendationCard).join('')}</div>`,
          error: (message, retryable) => renderError(message, retryable),
        })}
      </div>
    </section>
  </section>
`;

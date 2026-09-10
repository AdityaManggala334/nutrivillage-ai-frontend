import { renderButton } from '../components/Button';
import { renderInput, renderSelect } from '../components/Input';

export interface OnboardingPageOptions {
  readonly step: number;
}

interface Slide {
  readonly title: string;
  readonly description: string;
}

const SLIDES = [
  {
    title: 'Selamat datang di NutriVillage AI',
    description:
      'Aplikasi ini membantu keluarga menyusun menu harian bergizi dengan mempertimbangkan anggaran dan pangan lokal Madiun.',
  },
  {
    title: 'Sesuaikan dengan budget keluarga',
    description:
      'Tentukan anggaran harian Anda. Menu yang melebihi budget otomatis tidak akan direkomendasikan.',
  },
  {
    title: 'Manfaatkan pangan lokal & musiman',
    description:
      'Rekomendasi mengutamakan komoditas lokal yang sedang musim agar lebih hemat dan segar.',
  },
] as const satisfies readonly Slide[];

let memberRowSequence = 0;

/** Baris anggota keluarga dinamis (dipakai ulang oleh controller saat "Tambah Anggota"). */
export const renderMemberRow = (): string => {
  memberRowSequence += 1;
  const uid = memberRowSequence;

  return `
  <fieldset data-member-row class="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
    <legend data-member-legend class="px-1 text-sm font-semibold text-stone-700">
      Anggota Keluarga
    </legend>
    <div class="mt-2 grid gap-x-4 sm:grid-cols-2">
      ${renderInput({
        id: `member-${uid}-name`,
        name: `member-${uid}-name`,
        label: 'Nama',
        fieldKey: 'name',
        placeholder: 'Nama anggota',
        required: true,
      })}
      ${renderInput({
        id: `member-${uid}-age`,
        name: `member-${uid}-age`,
        label: 'Usia (tahun)',
        type: 'number',
        fieldKey: 'age',
        min: 1,
        max: 120,
        placeholder: 'Contoh: 30',
        required: true,
      })}
      ${renderSelect({
        id: `member-${uid}-gender`,
        name: `member-${uid}-gender`,
        label: 'Jenis Kelamin',
        fieldKey: 'gender',
        required: true,
        options: [
          { value: 'laki-laki', label: 'Laki-laki' },
          { value: 'perempuan', label: 'Perempuan' },
        ],
      })}
      ${renderInput({
        id: `member-${uid}-weight`,
        name: `member-${uid}-weight`,
        label: 'Berat Badan (kg)',
        type: 'number',
        fieldKey: 'weightKg',
        min: 5,
        max: 250,
        step: 0.5,
        placeholder: 'Contoh: 60',
        required: true,
      })}
      ${renderSelect({
        id: `member-${uid}-activity`,
        name: `member-${uid}-activity`,
        label: 'Tingkat Aktivitas',
        fieldKey: 'activityLevel',
        required: true,
        options: [
          { value: 'rendah', label: 'Rendah (jarang olahraga)' },
          { value: 'sedang', label: 'Sedang (olahraga ringan)' },
          { value: 'tinggi', label: 'Tinggi (aktif berolahraga)' },
        ],
      })}
      ${renderInput({
        id: `member-${uid}-allergies`,
        name: `member-${uid}-allergies`,
        label: 'Alergi / Pantangan',
        fieldKey: 'allergies',
        placeholder: 'Contoh: kacang, seafood',
        hint: 'Pisahkan dengan koma. Kosongkan bila tidak ada.',
      })}
    </div>
    <div class="mt-3 text-right">
      ${renderButton({
        label: 'Hapus Anggota',
        action: 'remove-member',
        intent: 'ghost',
        size: 'sm',
      })}
    </div>
  </fieldset>`;
};

const renderProgress = (step: number): string =>
  `<ol class="flex items-center justify-center gap-2" aria-label="Progres onboarding">
    ${[0, 1, 2, 3]
      .map((index) => {
        const isActive = index <= step;
        return `<li class="h-2 w-10 rounded-full ${isActive ? 'bg-brand-600' : 'bg-stone-200'}"></li>`;
      })
      .join('')}
  </ol>`;

const renderIntroSlide = (step: number): string => {
  const slide = SLIDES[step] ?? SLIDES[0];
  const isLast = step >= SLIDES.length - 1;

  return `
  <div class="text-center">
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700"
      aria-hidden="true">${step + 1}</div>
    <h2 class="mt-6 text-2xl">${slide.title}</h2>
    <p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">${slide.description}</p>
  </div>
  <div class="mt-8 flex items-center justify-between gap-3">
    ${renderButton({
      label: 'Kembali',
      action: 'onboarding-prev',
      intent: 'ghost',
      disabled: step === 0,
    })}
    ${renderButton({
      label: isLast ? 'Isi Data Keluarga' : 'Lanjut',
      action: 'onboarding-next',
    })}
  </div>`;
};

const renderFamilyForm = (): string => `
  <form data-form="family" novalidate>
    <div data-form-alert role="alert" aria-live="assertive"
      class="mb-4 hidden rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"></div>

    <h2 class="text-xl">Ringkasan Keluarga</h2>
    <p class="mt-1 text-sm text-stone-600">
      Isi anggaran, wilayah, dan anggota keluarga agar rekomendasi lebih tepat.
    </p>

    <div class="mt-5 grid gap-x-4 sm:grid-cols-2">
      ${renderInput({
        id: 'family-budget',
        name: 'dailyBudget',
        label: 'Budget Harian (Rp)',
        type: 'number',
        fieldKey: 'dailyBudget',
        min: 10000,
        max: 5000000,
        step: 5000,
        placeholder: 'Contoh: 75000',
        required: true,
      })}
      ${renderInput({
        id: 'family-region',
        name: 'region',
        label: 'Wilayah',
        fieldKey: 'region',
        value: 'Kabupaten Madiun',
        required: true,
      })}
      ${renderInput({
        id: 'family-preferences',
        name: 'preferences',
        label: 'Preferensi Makanan',
        fieldKey: 'preferences',
        placeholder: 'Contoh: sayur, ikan',
        hint: 'Pisahkan dengan koma.',
      })}
      ${renderInput({
        id: 'family-avoided',
        name: 'avoidedIngredients',
        label: 'Bahan yang Dihindari',
        fieldKey: 'avoidedIngredients',
        placeholder: 'Contoh: kacang, seafood',
        hint: 'Pisahkan dengan koma.',
      })}
    </div>

    <h3 class="mt-8 text-lg">Anggota Keluarga</h3>
    <p class="mt-1 text-sm text-stone-600">Tambahkan seluruh anggota keluarga.</p>

    <div id="member-list" class="mt-4 space-y-4">
      ${renderMemberRow()}
    </div>

    <div class="mt-4">
      ${renderButton({
        label: '+ Tambah Anggota',
        action: 'add-member',
        intent: 'secondary',
        size: 'sm',
      })}
    </div>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
      ${renderButton({ label: 'Simpan & Lanjut', type: 'submit', fullWidth: true, size: 'lg' })}
    </div>
  </form>`;

/** Halaman Onboarding (FR-04) & Data Keluarga (FR-05). */
export const renderOnboardingPage = ({ step }: OnboardingPageOptions): string => {
  const isForm = step >= SLIDES.length;

  return `
  <section aria-labelledby="onboarding-title" class="app-container flex justify-center py-14">
    <div class="w-full max-w-2xl">
      <h1 id="onboarding-title" class="sr-only">Onboarding NutriVillage AI</h1>
      ${renderProgress(step)}
      <div class="rounded-card mt-6 bg-white p-6 shadow-card sm:p-8">
        ${isForm ? renderFamilyForm() : renderIntroSlide(step)}
      </div>
    </div>
  </section>`;
};

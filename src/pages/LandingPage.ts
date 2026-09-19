import { renderBadge } from '../components/Badge';
import { renderButton } from '../components/Button';
import { renderCard } from '../components/Card';

// =================================================================
// SVG ICONS (Lucide-style, clean & professional)
// =================================================================
const Icons = {
  brain: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/></svg>`,
  wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`,
  leaf: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
  cart: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  bot: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
  chef: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  sparkle: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  trending: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  book: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
};

// =================================================================
// DATA
// =================================================================
interface Feature {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

interface Stat {
  readonly value: string;
  readonly label: string;
  readonly icon: string;
}

interface Step {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

interface FAQ {
  readonly question: string;
  readonly answer: string;
}

const FEATURES: readonly Feature[] = [
  {
    icon: Icons.brain,
    title: 'AI Recommendation Engine',
    description:
      'Algoritma cerdas yang menganalisis kebutuhan gizi keluarga dan mencocokkan dengan menu terbaik dalam hitungan detik.',
  },
  {
    icon: Icons.wallet,
    title: 'Budget-Aware Planning',
    description:
      'Anggaran harian menjadi batas tegas. Menu yang melebihi budget otomatis tidak direkomendasikan. Transparan dan terkontrol.',
  },
  {
    icon: Icons.leaf,
    title: '100% Pangan Lokal Madiun',
    description:
      'Memanfaatkan komoditas lokal Kabupaten Madiun yang sedang musim. Lebih murah, lebih segar, dukung petani lokal.',
  },
  {
    icon: Icons.tag,
    title: 'Estimasi Biaya Real-time',
    description:
      'Setiap rekomendasi disertai estimasi biaya berdasarkan data harga pasar terkini yang diverifikasi admin.',
  },
  {
    icon: Icons.calendar,
    title: 'Meal Planner Mingguan',
    description:
      'Jadwalkan menu masak 7 hari ke depan. Sistem otomatis generate daftar belanja dari jadwal yang kamu buat.',
  },
  {
    icon: Icons.cart,
    title: 'Smart Shopping List',
    description:
      'Daftar belanja otomatis dari Meal Planner. Tinggal centang saat belanja, tidak ada bahan yang terlewat.',
  },
];

const STATS: readonly Stat[] = [
  { value: '500+', label: 'Resep Menu Lokal', icon: Icons.book },
  { value: '50+', label: 'Bahan Pangan Madiun', icon: Icons.leaf },
  { value: '30%', label: 'Lebih Hemat Budget', icon: Icons.trending },
  { value: '100%', label: 'Gizi Terjamin', icon: Icons.check },
];

const STEPS: readonly Step[] = [
  {
    number: '01',
    title: 'Isi Data Keluarga',
    description:
      'Masukkan jumlah anggota keluarga, usia, budget harian, dan alergi. Semudah mengisi profil media sosial.',
    icon: Icons.users,
  },
  {
    number: '02',
    title: 'AI Meracik Menu',
    description:
      'Sistem menganalisis kebutuhan gizi, mencocokkan dengan bahan lokal yang sedang musim, dan meranking menu terbaik.',
    icon: Icons.bot,
  },
  {
    number: '03',
    title: 'Masak & Nikmati',
    description:
      'Dapatkan resep lengkap, estimasi biaya, dan daftar belanja otomatis. Tinggal masak, keluarga sehat!',
    icon: Icons.chef,
  },
];

const FAQS: readonly FAQ[] = [
  {
    question: 'Apakah NutriVillage AI gratis digunakan?',
    answer:
      'Ya! Fitur dasar seperti Explore Menu, Meal Planner, dan Shopping List dapat diakses secara gratis. Kami percaya setiap keluarga berhak mendapatkan panduan gizi yang baik.',
  },
  {
    question: 'Bagaimana sistem menentukan menu yang direkomendasikan?',
    answer:
      'Sistem menggunakan 4 parameter: skor gizi (40%), efisiensi budget (30%), ketersediaan musiman (15%), dan komoditas lokal Madiun (15%). Menu di atas budget otomatis tidak direkomendasikan.',
  },
  {
    question: 'Apakah data harga yang ditampilkan akurat?',
    answer:
      'Data harga diperoleh dari scraper otomatis portal pemerintah dan diverifikasi oleh admin. Harga yang ditampilkan adalah estimasi berdasarkan data terkini. Harga aktual dapat berbeda sesuai lokasi dan waktu pembelian.',
  },
  {
    question: 'Bisakah saya mengatur menu untuk anggota keluarga yang alergi?',
    answer:
      'Tentu! Saat mengisi data keluarga, kamu bisa menandai bahan-bahan yang menjadi alergi atau pantangan. Sistem akan otomatis menghindari menu yang mengandung bahan tersebut.',
  },
];

// =================================================================
// RENDER HELPERS
// =================================================================
const renderFeatureCard = (feature: Feature): string =>
  renderCard({
    variant: 'outline',
    content: `
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-brand-700 mb-5">
        ${feature.icon}
      </div>
      <h3 class="text-lg font-bold text-stone-900 mb-2">${feature.title}</h3>
      <p class="text-sm leading-relaxed text-stone-600">${feature.description}</p>
    `,
  });

const renderStatCard = (stat: Stat): string => `
  <div class="text-center p-6 bg-white rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div class="w-12 h-12 mx-auto rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
      ${stat.icon}
    </div>
    <div class="text-3xl font-black text-stone-900 mb-1">${stat.value}</div>
    <div class="text-sm text-stone-600">${stat.label}</div>
  </div>
`;

const renderStepCard = (step: Step, index: number): string => `
  <div class="relative">
    ${index < STEPS.length - 1 ? '<div class="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-brand-200 to-transparent -translate-x-8"></div>' : ''}
    <div class="bg-white rounded-3xl p-8 shadow-lg border border-stone-100 hover:shadow-xl transition-all hover:-translate-y-1 h-full">
      <div class="flex items-start justify-between mb-6">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white">
          ${step.icon}
        </div>
        <div class="text-6xl font-black text-brand-100 leading-none">${step.number}</div>
      </div>
      <h3 class="text-xl font-bold text-stone-900 mb-3">${step.title}</h3>
      <p class="text-sm leading-relaxed text-stone-600">${step.description}</p>
    </div>
  </div>
`;

const renderFAQItem = (faq: FAQ): string => `
  <details class="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-brand-300 transition-colors">
    <summary class="flex items-center justify-between p-6 cursor-pointer list-none">
      <h3 class="font-semibold text-stone-900 pr-4">${faq.question}</h3>
      <span class="flex-shrink-0 w-8 h-8 bg-brand-50 rounded-full flex items-center justify-center group-open:rotate-45 transition-transform duration-300">
        <span class="text-brand-600">${Icons.plus}</span>
      </span>
    </summary>
    <div class="px-6 pb-6 text-sm leading-relaxed text-stone-600">
      ${faq.answer}
    </div>
  </details>
`;

// =================================================================
// LANDING PAGE
// =================================================================
/** Landing page (HTML semantik + ARIA) — FR-03 pintu masuk aplikasi. */
export const renderLandingPage = (): string => `
  <!-- HERO SECTION -->
  <section aria-labelledby="hero-title" class="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-harvest-50">
    <!-- Abstract Background Shapes -->
    <div class="absolute top-20 left-10 w-72 h-72 bg-brand-200/40 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-harvest-200/40 rounded-full blur-3xl"></div>
    <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-brand-300/20 rounded-full blur-3xl"></div>
    
    <div class="app-container relative py-20 lg:py-32">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left Content -->
        <div class="space-y-8">
          <div class="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-brand-200 rounded-full px-4 py-2 shadow-sm">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span class="text-xs font-semibold text-brand-700">${Icons.leaf} Pangan Lokal Kabupaten Madiun</span>
          </div>
          
          <h1 id="hero-title" class="text-5xl lg:text-6xl font-black leading-tight text-stone-900">
            Makan Enak, Gizi Oke, 
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Dompet Aman</span>
          </h1>
          
          <p class="text-lg leading-relaxed text-stone-600 max-w-xl">
            NutriVillage AI membantu keluarga menyusun menu harian yang sesuai kebutuhan gizi, 
            batas anggaran, dan ketersediaan pangan musiman di Kabupaten Madiun. 
            <strong class="text-stone-900">Anti ribet, anti boncos!</strong>
          </p>
          
          <div class="flex flex-wrap gap-4">
            ${renderButton({ label: 'Mulai Eksplorasi Menu', action: 'nav-login', size: 'lg' })}
            ${renderButton({
              label: 'Lihat Menu Tanpa Daftar',
              action: 'guest-login',
              intent: 'secondary',
              size: 'lg',
            })}
          </div>
          
          <div class="flex items-center space-x-6 pt-4">
            <div class="flex -space-x-2">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">A</div>
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-harvest-400 to-harvest-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">B</div>
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 border-2 border-white flex items-center justify-center text-white text-xs font-bold">C</div>
            </div>
            <div class="text-sm text-stone-600">
              <strong class="text-stone-900">1000+ keluarga</strong> sudah menggunakan
            </div>
          </div>
        </div>
        
        <!-- Right Visual - App Mockup -->
        <div class="relative">
          <div class="relative bg-white rounded-3xl shadow-2xl p-6 border border-stone-100">
            <div class="flex items-center justify-between mb-6">
              <div>
                <div class="text-sm text-stone-500 mb-1">Rekomendasi Hari Ini</div>
                <div class="text-2xl font-bold text-stone-900">Menu Bergizi untuk Keluarga</div>
              </div>
              ${renderBadge({ label: '4 menu', tone: 'harvest' })}
            </div>
            
            <div class="space-y-3">
              ${[
                { name: 'Nasi Pecel Madiun', score: 96, cost: 'Rp 25.000', icon: Icons.leaf },
                { name: 'Sayur Lodeh Tempe', score: 93, cost: 'Rp 22.000', icon: Icons.leaf },
                { name: 'Sup Ayam Jagung', score: 90, cost: 'Rp 28.000', icon: Icons.leaf },
                { name: 'Pepes Ikan Nila', score: 87, cost: 'Rp 30.000', icon: Icons.leaf },
              ]
                .map(
                  (item) => `
                  <div class="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-brand-50 transition-colors group">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                        ${item.icon}
                      </div>
                      <div>
                        <div class="font-semibold text-stone-900">${item.name}</div>
                        <div class="text-xs text-stone-500">${item.cost}</div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold">
                        Skor ${item.score}
                      </div>
                    </div>
                  </div>
                `,
                )
                .join('')}
            </div>
            
            <div class="mt-6 p-4 bg-gradient-to-r from-brand-50 to-harvest-50 rounded-xl border border-brand-100">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-brand-600 shadow-sm">
                  ${Icons.sparkle}
                </div>
                <div class="text-sm text-stone-700">
                  <strong>AI Insight:</strong> Tempe sedang musim panen di Madiun! 
                  Menu dengan tempe 40% lebih hemat hari ini.
                </div>
              </div>
            </div>
          </div>
          
          <!-- Floating Elements -->
          <div class="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-stone-100 animate-bounce">
            <div class="flex items-center space-x-2">
              <div class="w-10 h-10 rounded-lg bg-harvest-100 flex items-center justify-center text-harvest-600">
                ${Icons.trending}
              </div>
              <div>
                <div class="text-xs text-stone-500">Hemat Budget</div>
                <div class="font-bold text-brand-600">30%</div>
              </div>
            </div>
          </div>
          
          <div class="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-stone-100">
            <div class="flex items-center space-x-2">
              <div class="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                ${Icons.check}
              </div>
              <div>
                <div class="text-xs text-stone-500">Gizi Terpenuhi</div>
                <div class="font-bold text-brand-600">95/100</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- STATS SECTION -->
  <section aria-labelledby="stats-title" class="py-16 bg-white border-y border-stone-100">
    <div class="app-container">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        ${STATS.map(renderStatCard).join('')}
      </div>
    </div>
  </section>

  <!-- FEATURES SECTION -->
  <section aria-labelledby="features-title" class="py-20 bg-stone-50">
    <div class="app-container">
      <div class="text-center max-w-3xl mx-auto mb-16">
        ${renderBadge({ label: 'FITUR UNGGULAN', tone: 'brand', size: 'sm' })}
        <h2 id="features-title" class="text-4xl lg:text-5xl font-black text-stone-900 mt-6 mb-4">
          Bukan Sekadar Aplikasi Resep
        </h2>
        <p class="text-lg text-stone-600">
          NutriVillage AI adalah asisten pribadi dapurmu yang paham kondisi kantong dan gizi keluargamu.
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${FEATURES.map(renderFeatureCard).join('')}
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS SECTION -->
  <section aria-labelledby="howto-title" class="py-20 bg-white">
    <div class="app-container">
      <div class="text-center max-w-3xl mx-auto mb-16">
        ${renderBadge({ label: 'CARA KERJA', tone: 'harvest', size: 'sm' })}
        <h2 id="howto-title" class="text-4xl lg:text-5xl font-black text-stone-900 mt-6 mb-4">
          Anti Ribet Club. Cuma 3 Langkah.
        </h2>
        <p class="text-lg text-stone-600">
          Dari input data sampai dapat menu bergizi, semudah chat sama teman.
        </p>
      </div>
      
      <div class="grid lg:grid-cols-3 gap-8">
        ${STEPS.map((step, index) => renderStepCard(step, index)).join('')}
      </div>
    </div>
  </section>

  <!-- WHY CHOOSE US SECTION -->
  <section aria-labelledby="why-title" class="py-20 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
      <div class="absolute top-40 right-20 w-24 h-24 border-4 border-white rounded-full"></div>
      <div class="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-white rounded-full"></div>
      <div class="absolute bottom-40 right-1/3 w-20 h-20 border-4 border-white rounded-full"></div>
    </div>
    
    <div class="app-container relative">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          ${renderBadge({ label: 'MENGAPA MEMILIH KAMI', tone: 'harvest', size: 'sm' })}
          <h2 id="why-title" class="text-4xl lg:text-5xl font-black mt-6 mb-6">
            Dirancang Khusus untuk Keluarga Madiun
          </h2>
          <p class="text-lg text-brand-100 mb-8">
            Kami memahami tantangan keluarga Indonesia dalam menyusun menu harian. 
            NutriVillage AI hadir sebagai solusi yang praktis, terjangkau, dan berbasis pangan lokal.
          </p>
          
          <div class="space-y-4">
            ${[
              { icon: Icons.sparkle, text: 'Rekomendasi personal sesuai kebutuhan gizi keluarga' },
              {
                icon: Icons.wallet,
                text: 'Budget constraint yang ketat, tidak ada menu over-budget',
              },
              { icon: Icons.leaf, text: 'Dukung petani lokal dengan bahan musiman Madiun' },
              { icon: Icons.clock, text: 'Akses mudah dari mana saja, kapan saja' },
            ]
              .map(
                (item) => `
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white border border-white/20">
                    ${item.icon}
                  </div>
                  <div class="text-lg">${item.text}</div>
                </div>
              `,
              )
              .join('')}
          </div>
        </div>
        
        <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h3 class="text-2xl font-bold mb-6">Testimoni Pengguna</h3>
          <div class="space-y-6">
            ${[
              {
                name: 'Ibu Sari',
                role: 'Ibu Rumah Tangga',
                text: 'Akhirnya nggak pusing lagi mikir "hari ini masak apa". Menu yang direkomendasikan selalu pas di budget dan anak-anak suka!',
                avatar: 'A',
              },
              {
                name: 'Pak Budi',
                role: 'Karyawan Swasta',
                text: 'Fitur Meal Planner-nya keren banget. Saya bisa planning menu seminggu sekaligus, dan daftar belanjanya otomatis. Hemat waktu!',
                avatar: 'B',
              },
            ]
              .map(
                (testi) => `
                <div class="bg-white/10 rounded-2xl p-6 border border-white/10">
                  <div class="flex items-center space-x-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                      ${testi.avatar}
                    </div>
                    <div>
                      <div class="font-semibold">${testi.name}</div>
                      <div class="text-sm text-brand-200">${testi.role}</div>
                    </div>
                  </div>
                  <p class="text-sm leading-relaxed text-brand-50">"${testi.text}"</p>
                </div>
              `,
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ SECTION -->
  <section aria-labelledby="faq-title" class="py-20 bg-stone-50">
    <div class="app-container max-w-4xl">
      <div class="text-center mb-16">
        ${renderBadge({ label: 'FAQ', tone: 'brand', size: 'sm' })}
        <h2 id="faq-title" class="text-4xl lg:text-5xl font-black text-stone-900 mt-6 mb-4">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p class="text-lg text-stone-600">
          Belum menemukan jawaban? Hubungi kami di halaman kontak.
        </p>
      </div>
      
      <div class="space-y-4">
        ${FAQS.map(renderFAQItem).join('')}
      </div>
    </div>
  </section>

  <!-- CTA SECTION -->
  <section aria-labelledby="cta-title" class="py-20 bg-white">
    <div class="app-container">
      <div class="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 rounded-3xl p-12 lg:p-16 text-center text-white overflow-hidden">
        <!-- Abstract Background -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div class="absolute top-20 right-20 w-24 h-24 border-4 border-white rounded-full"></div>
          <div class="absolute bottom-10 left-1/4 w-40 h-40 border-4 border-white rounded-full"></div>
          <div class="absolute bottom-20 right-1/3 w-20 h-20 border-4 border-white rounded-full"></div>
        </div>
        
        <div class="relative">
          <h2 id="cta-title" class="text-4xl lg:text-5xl font-black mb-6">
            Siap Menyusun Menu Keluarga?
          </h2>
          <p class="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            Buat akun gratis, isi data keluarga, dan dapatkan rekomendasi menu yang sesuai anggaran Anda. 
            Mulai hidup sehat hari ini!
          </p>
          
          <div class="flex flex-wrap justify-center gap-4">
            ${renderButton({ label: 'Daftar Sekarang - Gratis!', action: 'nav-login', intent: 'harvest', size: 'lg' })}
            ${renderButton({
              label: 'Pelajari Lebih Lanjut',
              action: 'guest-login',
              intent: 'secondary',
              size: 'lg',
            })}
          </div>
          
          <div class="mt-8 flex items-center justify-center space-x-6 text-sm text-brand-200">
            <div class="flex items-center space-x-2">
              <span class="text-brand-300">${Icons.check}</span>
              <span>100% Gratis</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-brand-300">${Icons.check}</span>
              <span>Tanpa Iklan</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-brand-300">${Icons.check}</span>
              <span>Data Aman</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-stone-900 text-stone-400 py-12" role="contentinfo">
    <div class="app-container">
      <div class="grid lg:grid-cols-4 gap-8 mb-8">
        <div class="lg:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">N</div>
            <div>
              <div class="text-white font-bold text-lg">NutriVillage AI</div>
              <div class="text-xs text-stone-500">Menu Bergizi, Hemat, Pangan Lokal</div>
            </div>
          </div>
          <p class="text-sm leading-relaxed mb-4 max-w-md">
            Aplikasi rekomendasi menu bergizi berbasis pangan lokal Kabupaten Madiun. 
            Membantu keluarga Indonesia makan sehat tanpa menguras kantong.
          </p>
          <div class="flex space-x-3">
            ${[
              { icon: Icons.facebook, label: 'Facebook' },
              { icon: Icons.instagram, label: 'Instagram' },
              { icon: Icons.twitter, label: 'Twitter' },
              { icon: Icons.youtube, label: 'YouTube' },
            ]
              .map(
                (social) => `
                <a href="#" class="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center hover:bg-brand-600 transition-colors text-stone-400 hover:text-white" aria-label="${social.label}">
                  ${social.icon}
                </a>
              `,
              )
              .join('')}
          </div>
        </div>
        
        <div>
          <h3 class="text-white font-semibold mb-4">Fitur</h3>
          <ul class="space-y-2 text-sm">
            ${['Explore Menu', 'Meal Planner', 'Shopping List', 'Riwayat', 'Menu Favorit']
              .map(
                (item) => `
                <li><a href="#" class="hover:text-brand-400 transition-colors">${item}</a></li>
              `,
              )
              .join('')}
          </ul>
        </div>
        
        <div>
          <h3 class="text-white font-semibold mb-4">Perusahaan</h3>
          <ul class="space-y-2 text-sm">
            ${['Tentang Kami', 'Kebijakan Privasi', 'Syarat & Ketentuan', 'Kontak', 'FAQ']
              .map(
                (item) => `
                <li><a href="#" class="hover:text-brand-400 transition-colors">${item}</a></li>
              `,
              )
              .join('')}
          </ul>
        </div>
      </div>
      
      <div class="pt-8 border-t border-stone-800 flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
        <p class="text-sm text-center lg:text-left">
          &copy; 2026 NutriVillage AI. Dikembangkan untuk Kabupaten Madiun. 
          Tugas Praktikum Front-End D3 TI SV UNS.
        </p>
        <div class="flex items-center space-x-2 text-sm">
          <span>Dibuat dengan</span>
          <span class="text-red-500">❤</span>
          <span>di Madiun</span>
        </div>
      </div>
    </div>
  </footer>
`;

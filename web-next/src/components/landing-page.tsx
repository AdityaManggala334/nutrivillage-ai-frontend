import {
  Bot,
  Brain,
  BookOpen,
  Calendar,
  Check,
  ChefHat,
  Clock,
  Leaf,
  Plus,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { GuestLoginButton } from "@/components/guest-login-button";
import { Badge, ButtonLink } from "@/components/ui";

/* Brand icons (tidak tersedia di lucide-react, diambil dari desain Modul 1-4). */
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FEATURES = [
  {
    Icon: Brain,
    title: "AI Recommendation Engine",
    description:
      "Algoritma cerdas yang menganalisis kebutuhan gizi keluarga dan mencocokkan dengan menu terbaik dalam hitungan detik.",
  },
  {
    Icon: Wallet,
    title: "Budget-Aware Planning",
    description:
      "Anggaran harian menjadi batas tegas. Menu yang melebihi budget otomatis tidak direkomendasikan. Transparan dan terkontrol.",
  },
  {
    Icon: Leaf,
    title: "100% Pangan Lokal Madiun",
    description:
      "Memanfaatkan komoditas lokal Kabupaten Madiun yang sedang musim. Lebih murah, lebih segar, dukung petani lokal.",
  },
  {
    Icon: Tag,
    title: "Estimasi Biaya Real-time",
    description:
      "Setiap rekomendasi disertai estimasi biaya berdasarkan data harga pasar terkini yang diverifikasi admin.",
  },
  {
    Icon: Calendar,
    title: "Meal Planner Mingguan",
    description:
      "Jadwalkan menu masak 7 hari ke depan. Sistem otomatis generate daftar belanja dari jadwal yang kamu buat.",
  },
  {
    Icon: ShoppingCart,
    title: "Smart Shopping List",
    description:
      "Daftar belanja otomatis dari Meal Planner. Tinggal centang saat belanja, tidak ada bahan yang terlewat.",
  },
] as const;

const STATS = [
  { value: "500+", label: "Resep Menu Lokal", Icon: BookOpen },
  { value: "50+", label: "Bahan Pangan Madiun", Icon: Leaf },
  { value: "30%", label: "Lebih Hemat Budget", Icon: TrendingUp },
  { value: "100%", label: "Gizi Terjamin", Icon: Check },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Isi Data Keluarga",
    description:
      "Masukkan jumlah anggota keluarga, usia, budget harian, dan alergi. Semudah mengisi profil media sosial.",
    Icon: Users,
  },
  {
    number: "02",
    title: "AI Meracik Menu",
    description:
      "Sistem menganalisis kebutuhan gizi, mencocokkan dengan bahan lokal yang sedang musim, dan meranking menu terbaik.",
    Icon: Bot,
  },
  {
    number: "03",
    title: "Masak & Nikmati",
    description:
      "Dapatkan resep lengkap, estimasi biaya, dan daftar belanja otomatis. Tinggal masak, keluarga sehat!",
    Icon: ChefHat,
  },
] as const;

const FAQS = [
  {
    question: "Apakah NutriVillage AI gratis digunakan?",
    answer:
      "Ya! Fitur dasar seperti Explore Menu, Meal Planner, dan Shopping List dapat diakses secara gratis. Kami percaya setiap keluarga berhak mendapatkan panduan gizi yang baik.",
  },
  {
    question: "Bagaimana sistem menentukan menu yang direkomendasikan?",
    answer:
      "Sistem menggunakan 4 parameter: skor gizi (40%), efisiensi budget (30%), ketersediaan musiman (15%), dan komoditas lokal Madiun (15%). Menu di atas budget otomatis tidak direkomendasikan.",
  },
  {
    question: "Apakah data harga yang ditampilkan akurat?",
    answer:
      "Data harga diperoleh dari scraper otomatis portal pemerintah dan diverifikasi oleh admin. Harga yang ditampilkan adalah estimasi berdasarkan data terkini. Harga aktual dapat berbeda sesuai lokasi dan waktu pembelian.",
  },
  {
    question: "Bisakah saya mengatur menu untuk anggota keluarga yang alergi?",
    answer:
      "Tentu! Saat mengisi data keluarga, kamu bisa menandai bahan-bahan yang menjadi alergi atau pantangan. Sistem akan otomatis menghindari menu yang mengandung bahan tersebut.",
  },
] as const;

const HERO_MENUS = [
  { name: "Nasi Pecel Madiun", score: 96, cost: "Rp 25.000" },
  { name: "Sayur Lodeh Tempe", score: 93, cost: "Rp 22.000" },
  { name: "Sup Ayam Jagung", score: 90, cost: "Rp 28.000" },
  { name: "Pepes Ikan Nila", score: 87, cost: "Rp 30.000" },
] as const;

const WHY_ITEMS = [
  { Icon: Sparkles, text: "Rekomendasi personal sesuai kebutuhan gizi keluarga" },
  { Icon: Wallet, text: "Budget constraint yang ketat, tidak ada menu over-budget" },
  { Icon: Leaf, text: "Dukung petani lokal dengan bahan musiman Madiun" },
  { Icon: Clock, text: "Akses mudah dari mana saja, kapan saja" },
] as const;

const TESTIMONIALS = [
  {
    name: "Ibu Sari",
    role: "Ibu Rumah Tangga",
    text: 'Akhirnya nggak pusing lagi mikir "hari ini masak apa". Menu yang direkomendasikan selalu pas di budget dan anak-anak suka!',
    avatar: "A",
  },
  {
    name: "Pak Budi",
    role: "Karyawan Swasta",
    text: "Fitur Meal Planner-nya keren banget. Saya bisa planning menu seminggu sekaligus, dan daftar belanjanya otomatis. Hemat waktu!",
    avatar: "B",
  },
] as const;

function SectionBadge({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "harvest" }) {
  return <Badge tone={tone}>{children}</Badge>;
}

/** Landing page (FR-03) — port desain penuh dari proyek Modul 1-4. */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* HERO */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-harvest-50 dark:from-brand-950 dark:via-stone-950 dark:to-harvest-900/40"
      >
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-harvest-200/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-brand-300/20 blur-3xl" />

        <div className="app-container relative py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm dark:border-brand-800 dark:bg-stone-900/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                  <Leaf className="size-3.5" aria-hidden="true" /> Pangan Lokal Kabupaten Madiun
                </span>
              </div>

              <h1
                id="hero-title"
                className="text-5xl leading-tight font-black text-stone-900 lg:text-6xl"
              >
                Makan Enak, Gizi Oke,{" "}
                <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                  Dompet Aman
                </span>
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-stone-600">
                NutriVillage AI membantu keluarga menyusun menu harian yang sesuai kebutuhan gizi,
                batas anggaran, dan ketersediaan pangan musiman di Kabupaten Madiun.{" "}
                <strong className="text-stone-900">Anti ribet, anti boncos!</strong>
              </p>

              <div className="flex flex-wrap gap-4">
                <ButtonLink size="lg" href="/login">
                  Mulai Eksplorasi Menu
                </ButtonLink>
                <GuestLoginButton variant="button" intent="secondary" size="lg">
                  Lihat Menu Tanpa Daftar
                </GuestLoginButton>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-2">
                  {["A", "B", "C"].map((initial) => (
                    <div
                      key={initial}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-stone-600">
                  <strong className="text-stone-900">1000+ keluarga</strong> sudah menggunakan
                </div>
              </div>
            </div>

            {/* App mockup */}
            <div className="relative">
              <div className="relative rounded-3xl border border-stone-100 bg-white p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="mb-1 text-sm text-stone-500">Rekomendasi Hari Ini</div>
                    <div className="text-2xl font-bold text-stone-900">
                      Menu Bergizi untuk Keluarga
                    </div>
                  </div>
                  <Badge tone="harvest" className="px-2.5 py-1 text-xs">
                    4 menu
                  </Badge>
                </div>

                <div className="space-y-3">
                  {HERO_MENUS.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl bg-stone-50 p-4 transition-colors hover:bg-brand-50 dark:hover:bg-stone-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                          <Leaf className="size-5" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900">{item.name}</div>
                          <div className="text-xs text-stone-500">{item.cost}</div>
                        </div>
                      </div>
                      <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                        Skor {item.score}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-harvest-50 p-4 dark:border-brand-900 dark:from-brand-950/40 dark:to-harvest-900/30">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                      <Sparkles className="size-5" aria-hidden="true" />
                    </div>
                    <div className="text-sm text-stone-700">
                      <strong>AI Insight:</strong> Tempe sedang musim panen di Madiun! Menu dengan
                      tempe 40% lebih hemat hari ini.
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 animate-bounce rounded-2xl border border-stone-100 bg-white p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-harvest-100 text-harvest-600">
                    <TrendingUp className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500">Hemat Budget</div>
                    <div className="font-bold text-brand-600">30%</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 rounded-2xl border border-stone-100 bg-white p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                    <Check className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500">Gizi Terpenuhi</div>
                    <div className="font-bold text-brand-600">95/100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section aria-labelledby="stats-title" className="border-y border-stone-100 bg-white py-16">
        <div className="app-container">
          <h2 id="stats-title" className="sr-only">
            Statistik NutriVillage AI
          </h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map(({ value, label, Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-stone-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <div className="mb-1 text-3xl font-black text-stone-900">{value}</div>
                <div className="text-sm text-stone-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section aria-labelledby="features-title" className="bg-stone-50 py-20">
        <div className="app-container">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <SectionBadge>FITUR UNGGULAN</SectionBadge>
            <h2
              id="features-title"
              className="mt-6 mb-4 text-4xl font-black text-stone-900 lg:text-5xl"
            >
              Bukan Sekadar Aplikasi Resep
            </h2>
            <p className="text-lg text-stone-600">
              NutriVillage AI adalah asisten pribadi dapurmu yang paham kondisi kantong dan gizi
              keluargamu.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, description }) => (
              <article
                key={title}
                className="rounded-card bg-white p-5 shadow-card ring-1 ring-stone-200 ring-inset"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 dark:from-brand-900/60 dark:to-brand-950/40">
                  <Icon className="size-8" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-stone-900">{title}</h3>
                <p className="text-sm leading-relaxed text-stone-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section aria-labelledby="howto-title" className="bg-white py-20">
        <div className="app-container">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <SectionBadge tone="harvest">CARA KERJA</SectionBadge>
            <h2
              id="howto-title"
              className="mt-6 mb-4 text-4xl font-black text-stone-900 lg:text-5xl"
            >
              Anti Ribet Club. Cuma 3 Langkah.
            </h2>
            <p className="text-lg text-stone-600">
              Dari input data sampai dapat menu bergizi, semudah chat sama teman.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {STEPS.map(({ number, title, description, Icon }, index) => (
              <div key={number} className="relative">
                {index < STEPS.length - 1 ? (
                  <div className="absolute top-12 left-full hidden h-0.5 w-full -translate-x-8 bg-gradient-to-r from-brand-200 to-transparent lg:block" />
                ) : null}
                <div className="h-full rounded-3xl border border-stone-100 bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                      <Icon className="size-7" aria-hidden="true" />
                    </div>
                    <div className="text-6xl leading-none font-black text-brand-100 dark:text-brand-900/40">
                      {number}
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-stone-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-stone-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section
        aria-labelledby="why-title"
        className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 py-20 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-32 w-32 rounded-full border-4 border-white" />
          <div className="absolute top-40 right-20 h-24 w-24 rounded-full border-4 border-white" />
          <div className="absolute bottom-20 left-1/4 h-40 w-40 rounded-full border-4 border-white" />
          <div className="absolute right-1/3 bottom-40 h-20 w-20 rounded-full border-4 border-white" />
        </div>

        <div className="app-container relative">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionBadge tone="harvest">MENGAPA MEMILIH KAMI</SectionBadge>
              <h2 id="why-title" className="mt-6 mb-6 text-4xl font-black lg:text-5xl">
                Dirancang Khusus untuk Keluarga Madiun
              </h2>
              <p className="mb-8 text-lg text-brand-100">
                Kami memahami tantangan keluarga Indonesia dalam menyusun menu harian. NutriVillage
                AI hadir sebagai solusi yang praktis, terjangkau, dan berbasis pangan lokal.
              </p>

              <div className="space-y-4">
                {WHY_ITEMS.map(({ Icon, text }) => (
                  <div key={text} className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm">
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <div className="text-lg">{text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-lg">
              <h3 className="mb-6 text-2xl font-bold">Testimoni Pengguna</h3>
              <div className="space-y-6">
                {TESTIMONIALS.map((testi) => (
                  <div
                    key={testi.name}
                    className="rounded-2xl border border-white/10 bg-white/10 p-6"
                  >
                    <div className="mb-4 flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white">
                        {testi.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{testi.name}</div>
                        <div className="text-sm text-brand-200">{testi.role}</div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-brand-50">&quot;{testi.text}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="bg-stone-50 py-20">
        <div className="app-container max-w-4xl">
          <div className="mb-16 text-center">
            <SectionBadge>FAQ</SectionBadge>
            <h2 id="faq-title" className="mt-6 mb-4 text-4xl font-black text-stone-900 lg:text-5xl">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-lg text-stone-600">
              Belum menemukan jawaban? Hubungi kami di halaman kontak.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition-colors hover:border-brand-300"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <h3 className="pr-4 font-semibold text-stone-900">{faq.question}</h3>
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 transition-transform duration-300 group-open:rotate-45">
                    <Plus className="size-4 text-brand-600" aria-hidden="true" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-sm leading-relaxed text-stone-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-title" className="bg-white py-20">
        <div className="app-container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-12 text-center text-white lg:p-16">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 h-32 w-32 rounded-full border-4 border-white" />
              <div className="absolute top-20 right-20 h-24 w-24 rounded-full border-4 border-white" />
              <div className="absolute bottom-10 left-1/4 h-40 w-40 rounded-full border-4 border-white" />
              <div className="absolute right-1/3 bottom-20 h-20 w-20 rounded-full border-4 border-white" />
            </div>

            <div className="relative">
              <h2 id="cta-title" className="mb-6 text-4xl font-black lg:text-5xl">
                Siap Menyusun Menu Keluarga?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-brand-100">
                Buat akun gratis, isi data keluarga, dan dapatkan rekomendasi menu yang sesuai
                anggaran Anda. Mulai hidup sehat hari ini!
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <ButtonLink intent="harvest" size="lg" href="/login">
                  Daftar Sekarang - Gratis!
                </ButtonLink>
                <GuestLoginButton variant="button" intent="secondary" size="lg">
                  Pelajari Lebih Lanjut
                </GuestLoginButton>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-brand-200">
                {["100% Gratis", "Tanpa Iklan", "Data Aman"].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Check className="size-5 text-brand-300" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer role="contentinfo" className="bg-stone-900 py-12 text-stone-400">
        <div className="app-container">
          <div className="mb-8 grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">
                  N
                </div>
                <div>
                  <div className="text-lg font-bold text-white">NutriVillage AI</div>
                  <div className="text-xs text-stone-500">Menu Bergizi, Hemat, Pangan Lokal</div>
                </div>
              </div>
              <p className="mb-4 max-w-md text-sm leading-relaxed">
                Aplikasi rekomendasi menu bergizi berbasis pangan lokal Kabupaten Madiun. Membantu
                keluarga Indonesia makan sehat tanpa menguras kantong.
              </p>
              <div className="flex space-x-3">
                {[
                  { label: "Facebook", Icon: FacebookIcon },
                  { label: "Instagram", Icon: InstagramIcon },
                  { label: "Twitter", Icon: TwitterIcon },
                  { label: "YouTube", Icon: YoutubeIcon },
                ].map(({ label, Icon }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-800 text-stone-400 transition-colors hover:bg-brand-600 hover:text-white"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Fitur</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Explore Menu", href: "/explore" },
                  { label: "Meal Planner", href: "/meal-planner" },
                  { label: "Shopping List", href: "/shopping-list" },
                  { label: "Riwayat", href: "/history" },
                  { label: "Menu Favorit", href: "/favorites" },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="transition-colors hover:text-brand-400">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Perusahaan</h3>
              <ul className="space-y-2 text-sm">
                {["Tentang Kami", "Kebijakan Privasi", "Syarat & Ketentuan", "Kontak", "FAQ"].map(
                  (item) => (
                    <li key={item}>
                      <a href="#" className="transition-colors hover:text-brand-400">
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between space-y-4 border-t border-stone-800 pt-8 lg:flex-row lg:space-y-0">
            <p className="text-center text-sm lg:text-left">
              &copy; 2026 NutriVillage AI. Dikembangkan untuk Kabupaten Madiun. Tugas Praktikum
              Front-End D3 TI SV UNS.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <span>Dibuat dengan</span>
              <span className="text-red-500">❤</span>
              <span>di Madiun</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import {
  Bot,
  BookOpen,
  Calendar,
  Check,
  ChefHat,
  Clock,
  Leaf,
  Plus,
  Scale,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { GuestLoginButton } from "@/components/guest-login-button";
import { Reveal } from "@/components/motion/reveal";
import { Badge, ButtonLink, GlassCard } from "@/components/ui";

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
    Icon: Bot,
    title: "Mesin Rekomendasi SAW",
    description:
      "Algoritma Simple Additive Weighting menyusun peringkat menu secara transparan dari kriteria gizi, anggaran, pangan lokal, dan musim.",
  },
  {
    Icon: Wallet,
    title: "Sadar Anggaran",
    description:
      "Batas anggaran bahan pangan jadi pertimbangan utama. Setiap rekomendasi menampilkan estimasi biaya, bukan sekadar resep.",
  },
  {
    Icon: Leaf,
    title: "Berbasis Pangan Lokal",
    description:
      "Mengutamakan komoditas lokal Kabupaten Madiun yang sedang musim agar lebih hemat dan segar.",
  },
  {
    Icon: Tag,
    title: "Harga Terverifikasi",
    description:
      "Estimasi biaya mengacu pada data harga yang sumbernya tercatat dan status verifikasinya jelas.",
  },
  {
    Icon: Calendar,
    title: "Perencanaan Beberapa Hari",
    description:
      "Susun rencana menu hingga tujuh hari, lengkap dengan kebutuhan bahan pangan dari setiap menu.",
  },
  {
    Icon: ShoppingCart,
    title: "Daftar Belanja Otomatis",
    description:
      "Kebutuhan bahan pangan dihitung dari menu dan jumlah porsi, menggabungkan bahan yang sama setelah satuan diseragamkan.",
  },
] as const;

/* Kapabilitas sistem (bukan angka statistik produksi). */
const CAPABILITIES = [
  { value: "4", label: "Kriteria penilaian SAW", Icon: Scale },
  { value: "7 hari", label: "Perencanaan menu", Icon: Calendar },
  { value: "Lokal", label: "Prioritas komoditas Madiun", Icon: Leaf },
  { value: "Terverifikasi", label: "Status sumber data harga", Icon: Check },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Isi Data Keluarga atau Sekolah",
    description:
      "Masyarakat mengisi data keluarga; Petugas SPPG mengelola sekolah dan jumlah siswa per kelompok penerima.",
    Icon: Users,
  },
  {
    number: "02",
    title: "Mesin Menyusun Rekomendasi",
    description:
      "Kebutuhan gizi, anggaran bahan pangan, pangan lokal, dan musim dihitung untuk meranking menu terbaik.",
    Icon: Bot,
  },
  {
    number: "03",
    title: "Rencanakan & Belanja",
    description:
      "Masukkan menu ke rencana beberapa hari, lalu peroleh kebutuhan bahan pangan dan estimasi biaya otomatis.",
    Icon: ChefHat,
  },
] as const;

const SCORING = [
  { label: "Gizi", weight: "40%", tone: "brand" as const },
  { label: "Anggaran", weight: "30%", tone: "harvest" as const },
  { label: "Pangan lokal", weight: "15%", tone: "brand" as const },
  { label: "Musim", weight: "15%", tone: "harvest" as const },
] as const;

const FAQS = [
  {
    question: "Apakah NutriVillage AI gratis digunakan?",
    answer:
      "Ya. Fitur dasar seperti Explore Menu, Meal Planner, dan Shopping List dapat diakses secara gratis, termasuk mode tamu untuk melihat katalog.",
  },
  {
    question: "Bagaimana sistem menentukan menu yang direkomendasikan?",
    answer:
      "Sistem memakai algoritma Simple Additive Weighting (SAW) dengan empat kriteria berbobot: gizi (40%), efisiensi anggaran bahan pangan (30%), ketersediaan pangan lokal (15%), dan kesesuaian musim (15%). Bobot dapat menyesuaikan tujuan gizi yang dipilih.",
  },
  {
    question: "Apakah data harga yang ditampilkan akurat?",
    answer:
      "Harga mengacu pada data yang sumbernya tercatat dan berstatus verifikasi admin. Angka yang tampil adalah estimasi, bukan harga final di pasar. Harga aktual dapat berbeda sesuai lokasi dan waktu.",
  },
  {
    question: "Bisakah saya mengatur menu untuk anggota keluarga yang alergi?",
    answer:
      "Bisa. Saat mengisi data keluarga, tandai bahan alergi atau pantangan. Sistem akan menghindari menu yang memuat bahan tersebut.",
  },
] as const;

/* Ilustrasi tampilan aplikasi (bukan data pengguna nyata). */
const HERO_MENUS = [
  { name: "Nasi Pecel Madiun", score: 96, cost: "Rp 25.000" },
  { name: "Sayur Lodeh Tempe", score: 93, cost: "Rp 22.000" },
  { name: "Sup Ayam Jagung", score: 90, cost: "Rp 28.000" },
  { name: "Pepes Ikan Nila", score: 87, cost: "Rp 30.000" },
] as const;

const WHY_ITEMS = [
  { Icon: Sparkles, text: "Rekomendasi personal sesuai kebutuhan gizi keluarga atau kelompok penerima" },
  { Icon: Wallet, text: "Batas anggaran bahan pangan jadi pertimbangan utama, transparan dan dapat ditinjau" },
  { Icon: Leaf, text: "Mendukung petani lokal dengan mengutamakan komoditas musiman Madiun" },
  { Icon: Clock, text: "Akses mudah dari mana saja, dengan status loading dan error yang jelas" },
] as const;

function SectionBadge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "harvest";
}) {
  return <Badge tone={tone}>{children}</Badge>;
}

/** Landing page (FR-03) — redesign glassmorphism + animasi scroll. */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* HERO */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-harvest-50 dark:from-brand-950 dark:via-stone-950 dark:to-harvest-900/40"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="animate-mesh absolute top-16 left-10 h-72 w-72 rounded-full bg-brand-300/40 blur-3xl" />
          <div className="animate-mesh absolute right-8 bottom-16 h-96 w-96 rounded-full bg-harvest-300/40 blur-3xl [animation-delay:-6s]" />
          <div className="animate-mesh absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-brand-400/25 blur-3xl [animation-delay:-11s]" />
        </div>

        <div className="app-container relative py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="space-y-8">
              <div className="glass inline-flex items-center space-x-2 rounded-full px-4 py-2">
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
                className="text-4xl leading-tight font-black text-stone-900 sm:text-5xl lg:text-6xl"
              >
                Makan Enak, Gizi Oke,{" "}
                <span className="text-gradient-brand">Dompet Aman</span>
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-stone-600">
                NutriVillage AI membantu keluarga dan Petugas SPPG menyusun menu yang sesuai
                kebutuhan gizi, batas anggaran bahan pangan, dan ketersediaan pangan musiman di
                Kabupaten Madiun.{" "}
                <strong className="text-stone-900">Anti ribet, anti boncos!</strong>
              </p>

              <div className="flex flex-wrap gap-4">
                <ButtonLink size="lg" href="/login" className="press">
                  Mulai Eksplorasi Menu
                </ButtonLink>
                <GuestLoginButton variant="button" intent="secondary" size="lg">
                  Lihat Menu Tanpa Daftar
                </GuestLoginButton>
              </div>

              <div className="flex items-center space-x-6 pt-2">
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
                  Untuk keluarga &amp; dapur SPPG di Madiun
                </div>
              </div>
            </Reveal>

            {/* App mockup (ilustrasi) */}
            <Reveal direction="scale" delay={120} className="relative">
              <span className="sr-only">Ilustrasi tampilan aplikasi</span>
              <GlassCard tone="strong" className="relative p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="mb-1 text-sm text-stone-500">Rekomendasi Hari Ini</div>
                    <div className="text-2xl font-bold text-stone-900">
                      Menu Bergizi untuk Keluarga
                    </div>
                  </div>
                  <Badge tone="harvest" className="px-2.5 py-1 text-xs">
                    Contoh tampilan
                  </Badge>
                </div>

                <div className="space-y-3">
                  {HERO_MENUS.map((item) => (
                    <div
                      key={item.name}
                      className="lift flex items-center justify-between rounded-xl bg-white/60 p-4 dark:bg-stone-800/50"
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

                <div className="mt-6 rounded-xl border border-brand-100 bg-white/60 p-4 dark:border-brand-900 dark:bg-stone-800/40">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                      <Sparkles className="size-5" aria-hidden="true" />
                    </div>
                    <div className="text-sm text-stone-700">
                      <strong>Skor SAW:</strong> setiap menu diberi skor 0–100 dari empat kriteria
                      berbobot, sehingga peringkatnya bisa ditelusuri.
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="animate-float absolute -top-4 -right-4 rounded-2xl">
                <GlassCard tone="strong" radius="2xl" className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-harvest-100 text-harvest-600">
                      <TrendingUp className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs text-stone-500">Estimasi biaya</div>
                      <div className="font-bold text-brand-600">Per porsi</div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="animate-float absolute -bottom-4 -left-4 rounded-2xl [animation-delay:-3s]">
                <GlassCard tone="strong" radius="2xl" className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                      <Check className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs text-stone-500">Kriteria</div>
                      <div className="font-bold text-brand-600">Gizi &amp; anggaran</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section aria-labelledby="capabilities-title" className="py-16">
        <div className="app-container">
          <h2 id="capabilities-title" className="sr-only">
            Kapabilitas NutriVillage AI
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CAPABILITIES.map(({ value, label, Icon }, index) => (
              <Reveal key={label} delay={index * 90}>
                <GlassCard className="lift h-full p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <div className="mb-1 text-2xl font-black text-stone-900 sm:text-3xl">
                    {value}
                  </div>
                  <div className="text-sm text-stone-600">{label}</div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section aria-labelledby="features-title" className="py-20">
        <div className="app-container">
          <Reveal className="mx-auto mb-16 max-w-3xl text-center">
            <SectionBadge>FITUR UNGGULAN</SectionBadge>
            <h2
              id="features-title"
              className="mt-6 mb-4 text-3xl font-black text-stone-900 sm:text-4xl lg:text-5xl"
            >
              Bukan Sekadar Aplikasi Resep
            </h2>
            <p className="text-lg text-stone-600">
              NutriVillage AI adalah asisten dapur yang paham gizi, anggaran bahan pangan, dan
              ketersediaan pangan lokal.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, description }, index) => (
              <Reveal key={title} delay={(index % 3) * 90}>
                <GlassCard className="lift h-full p-6">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-700 dark:from-brand-900/60 dark:to-brand-950/40">
                    <Icon className="size-7" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-stone-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-stone-600">{description}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section aria-labelledby="howto-title" className="py-20">
        <div className="app-container">
          <Reveal className="mx-auto mb-16 max-w-3xl text-center">
            <SectionBadge tone="harvest">CARA KERJA</SectionBadge>
            <h2
              id="howto-title"
              className="mt-6 mb-4 text-3xl font-black text-stone-900 sm:text-4xl lg:text-5xl"
            >
              Anti Ribet Club. Cuma 3 Langkah.
            </h2>
            <p className="text-lg text-stone-600">
              Dari input data sampai dapat menu bergizi, semudah chat sama teman.
            </p>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-3">
            {STEPS.map(({ number, title, description, Icon }, index) => (
              <Reveal key={number} delay={index * 120} className="relative h-full">
                {index < STEPS.length - 1 ? (
                  <div className="absolute top-12 left-full hidden h-0.5 w-full -translate-x-8 bg-gradient-to-r from-brand-200 to-transparent lg:block" />
                ) : null}
                <GlassCard className="lift h-full p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                      <Icon className="size-7" aria-hidden="true" />
                    </div>
                    <div className="text-6xl leading-none font-black text-brand-200/70 dark:text-brand-900/50">
                      {number}
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-stone-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-stone-600">{description}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY + SCORING */}
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
            <Reveal direction="left">
              <SectionBadge tone="harvest">MENGAPA MEMILIH KAMI</SectionBadge>
              <h2 id="why-title" className="mt-6 mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                Dirancang untuk Keluarga &amp; Dapur SPPG
              </h2>
              <p className="mb-8 text-lg text-brand-100">
                Kami memahami tantangan menyusun menu harian maupun menu massal. NutriVillage AI
                hadir sebagai solusi praktis, terjangkau, dan berbasis pangan lokal.
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
            </Reveal>

            <Reveal direction="right" delay={120}>
              <GlassCard className="border-white/20 bg-white/10 p-8">
                <h3 className="mb-2 text-2xl font-bold text-white">Cara Skor Dihitung</h3>
                <p className="mb-6 text-sm text-brand-100">
                  Bobot default mesin SAW. Peringkat berasal dari mesin rekomendasi, bukan ditebak
                  di antarmuka.
                </p>
                <div className="space-y-4">
                  {SCORING.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-white">{item.label}</span>
                        <span className="font-bold text-brand-100">{item.weight}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/15">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-300 to-harvest-300"
                          style={{ width: item.weight }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 rounded-xl border border-white/15 bg-white/10 p-4 text-xs leading-relaxed text-brand-50">
                  Menu di atas batas anggaran bahan pangan tidak direkomendasikan. Angka estimasi
                  bersifat indikatif dan mengacu pada data harga yang sumbernya tercatat.
                </p>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="py-20">
        <div className="app-container max-w-4xl">
          <Reveal className="mb-16 text-center">
            <SectionBadge>FAQ</SectionBadge>
            <h2 id="faq-title" className="mt-6 mb-4 text-4xl font-black text-stone-900 lg:text-5xl">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-lg text-stone-600">
              Belum menemukan jawaban? Hubungi kami melalui halaman kontak.
            </p>
          </Reveal>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 70}>
                <details className="glass group overflow-hidden rounded-2xl transition-colors hover:border-brand-300">
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                    <h3 className="pr-4 font-semibold text-stone-900">{faq.question}</h3>
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 transition-transform duration-300 group-open:rotate-45">
                      <Plus className="size-4 text-brand-600" aria-hidden="true" />
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-sm leading-relaxed text-stone-600">
                    {faq.answer}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-title" className="py-20">
        <div className="app-container">
          <Reveal direction="scale">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-12 text-center text-white lg:p-16">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 h-32 w-32 rounded-full border-4 border-white" />
                <div className="absolute top-20 right-20 h-24 w-24 rounded-full border-4 border-white" />
                <div className="absolute bottom-10 left-1/4 h-40 w-40 rounded-full border-4 border-white" />
                <div className="absolute right-1/3 bottom-20 h-20 w-20 rounded-full border-4 border-white" />
              </div>

              <div className="relative">
                <h2 id="cta-title" className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                  Siap Menyusun Menu?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-xl text-brand-100">
                  Buat akun gratis, lengkapi data keluarga atau sekolah, lalu dapatkan rekomendasi
                  menu yang sesuai anggaran bahan pangan Anda.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <ButtonLink intent="harvest" size="lg" href="/login">
                    Daftar Sekarang - Gratis!
                  </ButtonLink>
                  <GuestLoginButton variant="button" intent="secondary" size="lg">
                    Jelajahi Katalog
                  </GuestLoginButton>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-200">
                  {["100% Gratis", "Tanpa Iklan", "Data Aman"].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Check className="size-5 text-brand-300" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
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
                keluarga dan dapur SPPG menyusun menu sehat tanpa menguras anggaran.
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
                  { label: "Katalog Resep", href: "/katalog" },
                  { label: "Artikel Gizi", href: "/artikel" },
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
              &copy; 2026 NutriVillage AI. Dikembangkan untuk Kabupaten Madiun.{" "}
              <BookOpen className="inline size-4" aria-hidden="true" /> Tugas Praktikum Front-End D3
              TI SV UNS.
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

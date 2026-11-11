import { Calendar, Coins, Leaf, Salad } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const PILLARS = [
  {
    Icon: Salad,
    title: "Nutrition",
    weight: "40%",
    description: "Kandungan gizi (mengacu TKPI) dan kebutuhan tiap anggota keluarga.",
  },
  {
    Icon: Coins,
    title: "Budget",
    weight: "30%",
    description: "Batas anggaran adalah kendala keras — menu yang melewatinya tidak direkomendasikan.",
  },
  {
    Icon: Leaf,
    title: "Local Food",
    weight: "15%",
    description: "Komoditas lokal Kabupaten Madiun diutamakan agar hemat dan mudah diperoleh.",
  },
  {
    Icon: Calendar,
    title: "Seasonal Availability",
    weight: "15%",
    description: "Ketersediaan bahan per musim tanam sehingga bahan selalu segar.",
  },
] as const;

/** About gaya kartu gelap overlap: foto kiri + kartu konten menimpa. */
export function V3About() {
  return (
    <section id="tentang" aria-labelledby="tentang-title" className="py-24 sm:py-32">
      <div className="landing-container">
        <div className="relative grid lg:grid-cols-2">
          {/* Foto piring A10 (top-down): utuh di samping kiri kartu, tidak tertutup.
              Berputar pelan, shadow bulat diam. */}
          <div className="relative flex items-center justify-center py-10 lg:py-16">
            <div className="relative w-full max-w-[28rem]">
              {/* Shadow bulat lembut mengikuti bentuk piring (tidak ikut berputar) */}
              <div
                aria-hidden="true"
                className="absolute inset-[3%] rounded-full bg-black/50 blur-2xl"
              />
              <img
                src="/assets/ingredients/ingredients-piring-putar.webp"
                alt="Piring menu pangan lokal khas Indonesia yang siap disajikan"
                loading="lazy"
                className="landing-plate-spin relative w-full rounded-full"
              />
            </div>
          </div>

          {/* Kartu konten: lebih lapang agar teks mudah dibaca */}
          <Reveal delay={120} className="relative z-10 lg:self-center">
            <div className="rounded-3xl border border-white/10 bg-forest p-8 shadow-2xl shadow-black/40 sm:p-12 lg:p-14">
              <p className="landing-eyebrow">Tentang Kami</p>
              <h2 id="tentang-title" className="mt-4 text-3xl leading-tight sm:text-4xl">
                Lebih dari Sekadar Rekomendasi Makanan
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-cream/70">
                Setiap menu dinilai mesin rekomendasi dengan algoritma Simple Additive
                Weighting (SAW) — empat kriteria berbobot. Perangkingan dihitung mesin;
                model bahasa hanya menjelaskan hasilnya.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {PILLARS.map(({ Icon, title, weight, description }, index) => (
                  <Reveal key={title} delay={index * 80}>
                    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center justify-between">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-brand/20 text-emerald-brand">
                          <Icon className="size-4.5" aria-hidden="true" />
                        </span>
                        <span className="font-editorial text-base font-semibold text-gold">{weight}</span>
                      </div>
                      <h3 className="mt-3 font-body text-sm font-bold text-cream">{title}</h3>
                      <p className="mt-1 font-body text-xs leading-relaxed text-cream/60">{description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

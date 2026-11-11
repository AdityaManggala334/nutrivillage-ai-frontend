import { Calendar, Coins, Leaf, Salad } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const PILLARS = [
  {
    Icon: Salad,
    title: "Gizi",
    weight: "40%",
    description:
      "Kebutuhan gizi tiap anggota keluarga menjadi kriteria dengan bobot terbesar dalam penilaian menu.",
  },
  {
    Icon: Coins,
    title: "Anggaran",
    weight: "30%",
    description:
      "Batas anggaran bahan pangan adalah kendala keras — menu yang melewatinya tidak direkomendasikan.",
  },
  {
    Icon: Leaf,
    title: "Pangan Lokal",
    weight: "15%",
    description:
      "Komoditas lokal Kabupaten Madiun diutamakan agar biaya lebih hemat dan pasokan lebih dekat.",
  },
  {
    Icon: Calendar,
    title: "Ketersediaan Musiman",
    weight: "15%",
    description:
      "Menu disesuaikan dengan musim tanam sehingga bahan segar lebih mudah diperoleh.",
  },
] as const;

/** Tentang NutriVillage AI: foto rempah + empat pilar bobot mesin rekomendasi. */
export function About() {
  return (
    <section id="tentang" aria-labelledby="tentang-title" className="py-24 sm:py-32">
      <div className="landing-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Foto editorial dengan frame asimetris */}
          <Reveal direction="right" className="relative">
            <div className="overflow-hidden rounded-t-[10rem] rounded-b-3xl">
              <img
                src="/assets/ingredients/ingredients-bumbu-rempah-lokal.webp"
                alt="Aneka bumbu dan rempah pangan lokal Indonesia di atas nampan"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -right-3 -bottom-6 rounded-2xl border border-gold/30 bg-forest px-6 py-4 shadow-xl shadow-black/30 sm:-right-6">
              <p className="font-editorial text-2xl text-gold">4 Kriteria</p>
              <p className="mt-0.5 font-body text-xs text-cream/70">berbobot dalam mesin SAW</p>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="landing-eyebrow">Tentang Kami</p>
              <h2 id="tentang-title" className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
                Gizi, Anggaran, dan Pangan Lokal dalam Satu Peringkat
              </h2>
              <p className="mt-5 font-body text-base leading-relaxed text-cream/70">
                NutriVillage AI menyusun peringkat menu menggunakan algoritma Simple Additive
                Weighting (SAW) dengan empat kriteria berbobot. Peringkat dihitung mesin
                rekomendasi — model bahasa hanya menjelaskan hasilnya, bukan menentukannya.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {PILLARS.map(({ Icon, title, weight, description }, index) => (
                <Reveal key={title} delay={index * 90}>
                  <div className="lift h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-brand/20 text-emerald-brand">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="font-editorial text-lg font-semibold text-gold">
                        {weight}
                      </span>
                    </div>
                    <h3 className="mt-4 font-body text-base font-bold text-cream">{title}</h3>
                    <p className="mt-1.5 font-body text-sm leading-relaxed text-cream/60">
                      {description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

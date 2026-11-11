import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/** Hero full-bleed gaya travel editorial: foto dramatis, headline serif besar ter-center. */
export function V3Hero() {
  return (
    <section
      id="beranda"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh flex-col justify-between overflow-hidden"
    >
      <img
        src="/assets/hero/hero-nasi-tumpeng-hangat.webp"
        alt="Tumpeng dan aneka menu pangan lokal Indonesia yang hangat di atas meja kayu"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest-deep/35 to-forest-deep"
      />

      {/* Animasi asap hangat dari tengah area makanan */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
      >
        <span className="landing-steam top-[38%] left-[46%]" style={{ animationDelay: '0s' }} />
        <span className="landing-steam top-[40%] left-[52%]" style={{ animationDelay: '1.2s', '--steam-drift': '-16px' } as CSSProperties} />
        <span className="landing-steam top-[36%] left-[50%]" style={{ animationDelay: '2.4s', '--steam-drift': '22px' } as CSSProperties} />
        <span className="landing-steam top-[42%] left-[48%]" style={{ animationDelay: '3.6s', '--steam-drift': '-10px' } as CSSProperties} />
      </div>

      {/* Baris label atas — satu label di mobile, dua di layar lebih besar */}
      <div className="landing-container relative flex items-center justify-between pt-36 sm:pt-44">
        <p className="landing-eyebrow">AI-Powered Nutrition</p>
        <p className="hidden landing-eyebrow md:block">Local Food — Kab. Madiun</p>
      </div>

      {/* Headline besar ter-center */}
      <div className="landing-container relative flex flex-1 flex-col items-center justify-center py-16 text-center sm:pt-4">
        <Reveal>
          <h1
            id="hero-title"
            className="mx-auto max-w-4xl text-4xl leading-[1.1] font-semibold text-cream sm:text-6xl lg:text-7xl"
          >
            Rasakan Kelezatan
            <br />
            <span className="text-gold italic">Pangan Lokal Nusantara</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl font-body text-base leading-relaxed text-cream/75 sm:text-lg">
            Rekomendasi menu bergizi dan terjangkau berdasarkan kebutuhan, anggaran, serta
            potensi pangan lokal Kabupaten Madiun — disusun mesin, dijelaskan AI.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a href="/katalog" className="landing-btn landing-btn-solid">
              Jelajahi Rekomendasi Menu <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a href="#tentang" className="landing-btn landing-btn-outline">
              Pelajari NutriVillage AI
            </a>
          </div>
        </Reveal>
      </div>

      {/* Strip statistik bawah */}
      <div className="relative border-t border-white/10 bg-forest-deep/60 backdrop-blur-sm">
        <div className="landing-container grid grid-cols-2 gap-6 py-8 text-center sm:grid-cols-4">
          {[
            { value: "40%", label: "bobot gizi" },
            { value: "30%", label: "bobot anggaran" },
            { value: "15%", label: "pangan lokal" },
            { value: "15%", label: "musiman" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-editorial text-2xl text-gold sm:text-3xl">{stat.value}</p>
              <p className="mt-1 font-body text-xs text-cream/60 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

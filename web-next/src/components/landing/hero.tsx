import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/** Hero editorial: foto besar hijau gelap + headline Playfair. */
export function Hero() {
  return (
    <section
      id="beranda"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh items-end overflow-hidden"
    >
      {/* Foto latar full-bleed */}
      <img
        src="/assets/hero/hero-pangan-lokal-meja-hijau.webp"
        alt="Aneka menu bergizi Indonesia dengan lauk pauk dan sayuran segar di atas meja kayu"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      {/* Overlay gradasi forest green: gelap merata agar teks selalu terbaca */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/80 to-forest-deep/45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-forest-deep/70 via-transparent to-transparent"
      />

      <div className="landing-container relative pb-20 pt-36 sm:pb-28">
        <Reveal className="max-w-3xl">
          <p className="landing-eyebrow">Platform Gizi &amp; Pangan Lokal — Kabupaten Madiun</p>
          <h1
            id="hero-title"
            className="mt-6 text-4xl leading-[1.08] font-semibold text-cream sm:text-5xl lg:text-6xl"
          >
            Gizi Lebih Baik, Pangan Lokal,{" "}
            <span className="text-gold italic">Masa Depan Lebih Sehat.</span>
          </h1>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-cream/75 sm:text-lg">
            NutriVillage AI membantu keluarga dan Petugas SPPG menyusun menu yang sesuai
            kebutuhan gizi, batas anggaran bahan pangan, serta ketersediaan komoditas lokal
            dan musiman di Kabupaten Madiun — lengkap dengan estimasi biaya.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href="/katalog" className="landing-btn landing-btn-solid">
              Jelajahi Rekomendasi Menu <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a href="#tentang" className="landing-btn landing-btn-outline">
              Pelajari NutriVillage AI
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const AUDIENCES = [
  {
    id: "masyarakat",
    eyebrow: "Untuk Masyarakat Umum",
    title: "Menu Sehari-hari Sesuai Anggaran Keluarga",
    image: "/assets/audience/audience-masyarakat-keluarga.webp",
    alt: "Mangkuk makanan sehat keluarga dengan sayuran dan protein berkualitas",
    description:
      "Temukan inspirasi menu sehari-hari yang bergizi, terjangkau, dan sesuai dengan kebutuhan keluarga.",
    benefits: [
      "Rekomendasi menu harian",
      "Penyesuaian batas anggaran",
      "Informasi nutrisi per porsi",
      "Meal Planner & Shopping List",
    ],
    cta: { label: "Jelajahi untuk Masyarakat", href: "/explore" },
    dark: false,
  },
  {
    id: "sppg",
    eyebrow: "Untuk Petugas SPPG MBG",
    title: "Referensi Perencanaan Menu Berbasis Pangan Lokal",
    image: "/assets/audience/audience-sppg-mbg-dapur.webp",
    alt: "Petugas dapur menyiapkan nampan makanan bergizi program makan bergizi",
    description:
      "Kenali potensi NutriVillage AI sebagai pendukung informasi dan referensi perencanaan menu berbasis pangan lokal untuk kebutuhan penyediaan makanan bergizi.",
    benefits: [
      "Referensi komposisi menu",
      "Informasi bahan pangan lokal",
      "Estimasi biaya bahan per porsi",
      "Informasi kandungan nutrisi yang tersedia",
    ],
    cta: { label: "Pelajari untuk SPPG", href: "/katalog" },
    dark: true,
  },
] as const;

/** Dua area audiens: kartu foto besar + overlay, latar selang-seling. */
export function V3Audience() {
  return (
    <section aria-label="Audiens NutriVillage AI" className="pb-24 sm:pb-32">
      <Reveal className="landing-container mb-14 max-w-2xl text-center">
        <p className="landing-eyebrow">Target Audiens</p>
        <h2 className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
          Solusi untuk Kebutuhan Pangan yang Lebih Baik
        </h2>
      </Reveal>

      <div className="landing-container grid gap-8 lg:grid-cols-2 lg:gap-10">
        {AUDIENCES.map((audience, index) => (
          <Reveal key={audience.id} delay={index * 120} direction={index === 0 ? "right" : "left"}>
            <article
              id={audience.id}
              className={`lift group relative flex min-h-[34rem] flex-col justify-end overflow-hidden rounded-3xl scroll-mt-24 ${
                audience.dark ? "ring-1 ring-gold/40" : ""
              }`}
            >
              <img
                src={audience.image}
                alt={audience.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/80 to-forest-deep/30"
              />
              <div className="relative p-7 sm:p-9">
                <p className="landing-eyebrow">{audience.eyebrow}</p>
                <h3 className="mt-3 text-2xl leading-tight text-cream sm:text-3xl">{audience.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-cream/75">
                  {audience.description}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {audience.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-brand/25 text-emerald-brand">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                      <span className="font-body text-sm text-cream/85">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <a href={audience.cta.href} className="landing-btn landing-btn-solid mt-7">
                  {audience.cta.label} <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

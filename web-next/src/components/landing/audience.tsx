import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const AUDIENCES = [
  {
    id: "masyarakat",
    eyebrow: "Untuk Masyarakat Umum",
    title: "Menu Sehat Sesuai Anggaran Keluarga",
    image: "/assets/audience/audience-masyarakat-keluarga.webp",
    alt: "Mangkuk makanan sehat keluarga dengan sayuran dan protein berkualitas",
    description:
      "Isi data anggota keluarga sekali — usia, aktivitas, alergi, dan anggaran harian. NutriVillage AI menyusun rekomendasi menu beberapa hari beserta daftar belanja yang siap dipakai.",
    benefits: [
      "Rekomendasi menu harian hingga 7 hari",
      "Daftar belanja otomatis dari porsi menu",
      "Menu alergi dan pantangan dihindarkan",
      "Estimasi biaya jelas sebelum belanja",
    ],
  },
  {
    id: "sppg",
    eyebrow: "Untuk Petugas SPPG MBG",
    title: "Perencanaan Menu Skola dalam Skala Besar",
    image: "/assets/audience/audience-sppg-mbg-dapur.webp",
    alt: "Petugas dapur SPPG menyiapkan nampan makanan bergizi program MBG",
    description:
      "Petugas SPPG dapat mengelola data sekolah dan kelompok penerima, lalu menyusun usulan menu massal yang memperhitungkan anggaran per porsi serta ketersediaan bahan lokal musiman.",
    benefits: [
      "Kelola data sekolah dan kelompok penerima",
      "Perencanaan menu massal per kelompok",
      "Estimasi kebutuhan bahan per porsi",
      "Prioritas komoditas lokal musiman",
    ],
  },
] as const;

/** Dua area konten audiens yang tampak jelas berbeda (foto + manfaat). */
export function Audience() {
  return (
    <section aria-label="Audiens NutriVillage AI">
      {AUDIENCES.map((audience, index) => (
        <div
          key={audience.id}
          id={audience.id}
          className={`relative overflow-hidden py-20 sm:py-28 ${
            index % 2 === 1 ? "bg-forest" : ""
          }`}
        >
          <div className="landing-container">
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <Reveal direction={index % 2 === 1 ? "left" : "right"}>
                <div className="overflow-hidden rounded-3xl">
                  <img
                    src={audience.image}
                    alt={audience.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </Reveal>

              <Reveal>
                <p className="landing-eyebrow">{audience.eyebrow}</p>
                <h2 className="mt-4 text-3xl leading-tight sm:text-4xl">{audience.title}</h2>
                <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-cream/70">
                  {audience.description}
                </p>
                <ul className="mt-7 space-y-3">
                  {audience.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-brand/25 text-emerald-brand">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                      <span className="font-body text-sm leading-relaxed text-cream/85">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

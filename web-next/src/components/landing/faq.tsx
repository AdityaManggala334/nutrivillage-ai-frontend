import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

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
  {
    question: "Apakah NutriVillage AI memberi diagnosis atau jaminan gizi?",
    answer:
      "Tidak. NutriVillage AI adalah alat bantu perencanaan menu, bukan alat diagnosis medis. Angka gizi merupakan estimasi perhitungan, bukan jaminan kebutuhan gizi individual yang tepat.",
  },
] as const;

/** FAQ interaktif memakai <details> tanpa dependensi tambahan. */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-24 sm:py-32">
      <div className="landing-container max-w-3xl">
        <Reveal className="mb-12 text-center">
          <p className="landing-eyebrow">FAQ</p>
          <h2 id="faq-title" className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Pertanyaan yang Sering Diajukan
          </h2>
        </Reveal>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 60}>
              <details className="group rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-gold/30 open:border-gold/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-body text-base font-semibold text-cream">{faq.question}</h3>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition-transform duration-300 group-open:rotate-45">
                    <Plus className="size-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="px-5 pb-5 font-body text-sm leading-relaxed text-cream/70 sm:px-6 sm:pb-6">
                  {faq.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

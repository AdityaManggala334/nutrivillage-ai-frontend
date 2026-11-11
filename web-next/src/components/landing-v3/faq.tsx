import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const FAQS = [
  {
    question: "Apa itu NutriVillage AI?",
    answer:
      "NutriVillage AI adalah aplikasi rekomendasi menu bergizi, terjangkau, dan berbasis pangan lokal Kabupaten Madiun. Sistem membantu keluarga menyusun menu harian beserta daftar belanjanya.",
  },
  {
    question: "Bagaimana sistem menghasilkan rekomendasi menu?",
    answer:
      "Sistem memakai algoritma Simple Additive Weighting (SAW) dengan empat kriteria berbobot: gizi (40%), efisiensi anggaran bahan pangan (30%), ketersediaan pangan lokal (15%), dan kesesuaian musim (15%). Recommendation Engine menyusun perangkingan; model bahasa hanya menjelaskan hasilnya.",
  },
  {
    question: "Apakah rekomendasi dapat disesuaikan dengan anggaran?",
    answer:
      "Bisa. Batas anggaran bahan pangan merupakan kendala keras — menu yang melewatinya tidak akan muncul dalam rekomendasi.",
  },
  {
    question: "Dari mana informasi nutrisi diperoleh?",
    answer:
      "Informasi nutrisi mengacu pada data komposisi pangan Indonesia (TKPI) dan merupakan hasil perhitungan estimasi, bukan jaminan nilai gizi individual yang tepat.",
  },
  {
    question: "Apakah harga bahan pangan merupakan harga pasti?",
    answer:
      "Tidak. Harga mengacu pada data yang sumbernya tercatat dan berstatus verifikasi admin. Angka yang tampil adalah estimasi; harga aktual dapat berbeda sesuai lokasi dan waktu.",
  },
  {
    question: "Apakah NutriVillage AI dapat digunakan petugas SPPG?",
    answer:
      "NutriVillage AI menawarkan referensi komposisi menu, informasi bahan lokal, dan estimasi biaya yang dapat membantu perencanaan menu. SPPG adalah target audiens yang diusulkan — belum ada integrasi resmi dengan program MBG.",
  },
  {
    question: "Apakah pengguna harus mendaftar terlebih dahulu?",
    answer:
      "Tidak wajib. Fitur dasar seperti Explore Menu dan Katalog dapat diakses lewat mode tamu tanpa daftar. Untuk menyimpan profil keluarga dan Meal Planner, Anda perlu membuat akun.",
  },
] as const;

/** FAQ accordion memakai <details> tanpa dependensi tambahan. */
export function V3Faq() {
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
            <Reveal key={faq.question} delay={index * 50}>
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

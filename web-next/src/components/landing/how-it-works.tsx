import { ClipboardList, Sparkles, UtensilsCrossed } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const STEPS = [
  {
    number: "01",
    Icon: ClipboardList,
    title: "Isi Kebutuhan Anda",
    description:
      "Data keluarga atau sekolah: usia, aktivitas, alergi, dan batas anggaran bahan pangan per hari.",
  },
  {
    number: "02",
    Icon: Sparkles,
    title: "Mesin Menyusun Peringkat",
    description:
      "Mesin rekomendasi menghitung skor gizi, anggaran, pangan lokal, dan musim untuk meranking menu terbaik.",
  },
  {
    number: "03",
    Icon: UtensilsCrossed,
    title: "Tinjau & Rencanakan",
    description:
      "Tinjau rekomendasi beserta rincian skornya, lalu susun rencana menu dan daftar belanja beberapa hari.",
  },
] as const;

/** Cara kerja: 3 langkah, garis emas penghubung antar-langkah. */
export function HowItWorks() {
  return (
    <section aria-labelledby="cara-kerja-title" className="py-24 sm:py-32">
      <div className="landing-container">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="landing-eyebrow">Cara Kerja</p>
          <h2 id="cara-kerja-title" className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Tiga Langkah Menuju Menu Terbaik
          </h2>
        </Reveal>

        <ol className="relative grid gap-10 lg:grid-cols-3 lg:gap-8">
          {/* Garis penghubung horizontal (desktop saja) */}
          <div
            aria-hidden="true"
            className="landing-divider absolute top-7 right-[12%] left-[12%] hidden lg:block"
          />
          {STEPS.map(({ number, Icon, title, description }, index) => (
            <li key={number}>
              <Reveal delay={index * 120} className="relative text-center lg:text-left">
                <div className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-full border border-gold/40 bg-forest-deep text-gold lg:mx-0">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <p className="mt-6 font-editorial text-sm tracking-[0.3em] text-gold">{number}</p>
                <h3 className="mt-2 font-body text-lg font-bold text-cream">{title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-cream/60">
                  {description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

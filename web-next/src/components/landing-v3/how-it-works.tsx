import { ClipboardList, Sparkles, UtensilsCrossed } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const STEPS = [
  {
    number: "01",
    Icon: ClipboardList,
    title: "Kenali Kebutuhan",
    description: "Masukkan kebutuhan gizi, batas anggaran, preferensi, dan pantangan makanan Anda.",
  },
  {
    number: "02",
    Icon: Sparkles,
    title: "Analisis Rekomendasi AI",
    description: "Recommendation Engine menilai dan memeringkat menu berdasarkan empat kriteria berbobot.",
  },
  {
    number: "03",
    Icon: UtensilsCrossed,
    title: "Pilih dan Rencanakan",
    description: "Tinjau hasil rekomendasi, detail menu, simpan menu, dan susun rencana makan Anda.",
  },
] as const;

/** Cara kerja: 3 langkah dengan garis emas penghubung. */
export function V3HowItWorks() {
  return (
    <section aria-labelledby="cara-kerja-title" className="py-24 sm:py-32">
      <div className="landing-container">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="landing-eyebrow">Cara Kerja</p>
          <h2 id="cara-kerja-title" className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Perjalanan Menu Bergizi Dimulai dari Sini
          </h2>
        </Reveal>

        <ol className="relative grid gap-10 lg:grid-cols-3 lg:gap-8">
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
                <p className="mt-2 font-body text-sm leading-relaxed text-cream/60">{description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

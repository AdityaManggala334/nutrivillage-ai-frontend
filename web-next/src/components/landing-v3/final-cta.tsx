import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

const NAV_LINKS = [
  { label: "Beranda", href: "/landing-v3/#beranda" },
  { label: "Rekomendasi Menu", href: "/landing-v3/#menu" },
  { label: "Tentang Kami", href: "/landing-v3/#tentang" },
  { label: "Untuk Masyarakat", href: "/landing-v3/#masyarakat" },
  { label: "Untuk SPPG", href: "/landing-v3/#sppg" },
  { label: "FAQ", href: "/landing-v3/#faq" },
] as const;

const APP_LINKS = [
  { label: "Explore Menu", href: "/explore" },
  { label: "Katalog Menu", href: "/katalog" },
  { label: "Meal Planner", href: "/meal-planner" },
  { label: "Artikel Gizi", href: "/artikel" },
  { label: "Masuk / Daftar", href: "/login" },
] as const;

/** CTA penutup emerald + footer gelap. */
export function V3FinalCta() {
  return (
    <>
      <section aria-labelledby="cta-title" className="px-4 pb-20 sm:px-6 sm:pb-24">
        <Reveal direction="scale" className="landing-container">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-emerald-brand px-6 py-16 text-center sm:px-12 lg:py-20">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 size-72 rounded-full border-[3rem] border-white/10"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-28 -left-20 size-64 rounded-full border-[2.5rem] border-forest-deep/20"
            />
            <div className="relative">
              <h2
                id="cta-title"
                className="mx-auto max-w-2xl text-3xl leading-tight text-white sm:text-4xl lg:text-5xl"
              >
                Mulai Perjalanan Menu Bergizi Bersama NutriVillage AI
              </h2>
              <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-white/85 sm:text-lg">
                Manfaatkan potensi pangan lokal dan temukan inspirasi menu yang lebih bergizi
                dan terjangkau.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link href="/login" className="landing-btn bg-white font-semibold text-forest hover:bg-cream">
                  Mulai Sekarang <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/katalog"
                  className="landing-btn border border-white/50 text-white hover:border-white hover:bg-white/10"
                >
                  Jelajahi Rekomendasi Menu
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer role="contentinfo" className="border-t border-white/10 py-14">
        <div className="landing-container">
          <div className="grid gap-10 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-brand text-sm font-bold text-white">
                  NV
                </span>
                <span className="font-body text-base font-bold text-cream">
                  NutriVillage <span className="text-gold">AI</span>
                </span>
              </div>
              <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-cream/60">
                Platform rekomendasi menu bergizi berbasis pangan lokal Kabupaten Madiun —
                membantu keluarga menemukan menu sehat yang terjangkau.
              </p>
              <address className="mt-4 font-body text-sm leading-relaxed text-cream/60 not-italic">
                Kabupaten Madiun, Jawa Timur
                <br />
                <a href="mailto:halo@nutrivillage.id" className="transition-colors hover:text-gold">
                  halo@nutrivillage.id
                </a>
              </address>
            </div>

            <nav aria-label="Tautan navigasi">
              <h3 className="font-body text-sm font-bold tracking-wide text-cream">Navigasi</h3>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="font-body text-sm text-cream/60 transition-colors hover:text-gold">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Tautan aplikasi">
              <h3 className="font-body text-sm font-bold tracking-wide text-cream">Aplikasi</h3>
              <ul className="mt-4 space-y-2.5">
                {APP_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="font-body text-sm text-cream/60 transition-colors hover:text-gold">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="landing-divider mt-12" />
          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="font-body text-xs text-cream/50">
              &copy; 2026 NutriVillage AI. Estimasi harga dapat berbeda dengan harga pasar aktual.
            </p>
            <p className="font-body text-xs text-cream/50">Dikembangkan untuk Kabupaten Madiun.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

const MENU_LINKS = [
  { label: "Explore Menu", href: "/explore" },
  { label: "Katalog Menu", href: "/katalog" },
  { label: "Meal Planner", href: "/meal-planner" },
  { label: "Artikel Gizi", href: "/artikel" },
] as const;

const HELP_LINKS = [
  { label: "FAQ", href: "/#faq" },
  { label: "Tentang Kami", href: "/#tentang" },
  { label: "Untuk Masyarakat", href: "/#masyarakat" },
  { label: "Untuk SPPG", href: "/#sppg" },
] as const;

/** CTA penutup emerald + footer navigasi & kontak. */
export function FinalCta() {
  return (
    <>
      {/* CTA penutup */}
      <section aria-labelledby="cta-title" className="px-4 pb-24 sm:px-6 sm:pb-32">
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
              <h2 id="cta-title" className="mx-auto max-w-2xl text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                Mulai Susun Menu Bergizi Hari Ini
              </h2>
              <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-white/85 sm:text-lg">
                Buat akun gratis, lengkapi data keluarga atau sekolah, dan terima rekomendasi
                menu yang sesuai anggaran bahan pangan Anda.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                <Link
                  href="/login"
                  className="landing-btn bg-white font-semibold text-forest hover:bg-cream"
                >
                  Mulai Sekarang <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/katalog"
                  className="landing-btn border border-white/50 text-white hover:border-white hover:bg-white/10"
                >
                  Jelajahi Katalog
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
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
                Aplikasi rekomendasi menu bergizi berbasis pangan lokal Kabupaten Madiun —
                membantu keluarga dan dapur SPPG menyusun menu sehat tanpa menguras anggaran.
              </p>
              <address className="mt-4 font-body text-sm leading-relaxed text-cream/60 not-italic">
                Kabupaten Madiun, Jawa Timur
                <br />
                <a
                  href="mailto:halo@nutrivillage.id"
                  className="transition-colors hover:text-gold"
                >
                  halo@nutrivillage.id
                </a>
              </address>
            </div>

            <nav aria-label="Tautan menu">
              <h3 className="font-body text-sm font-bold tracking-wide text-cream">Menu</h3>
              <ul className="mt-4 space-y-2.5">
                {MENU_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="font-body text-sm text-cream/60 transition-colors hover:text-gold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Tautan bantuan">
              <h3 className="font-body text-sm font-bold tracking-wide text-cream">Bantuan</h3>
              <ul className="mt-4 space-y-2.5">
                {HELP_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="font-body text-sm text-cream/60 transition-colors hover:text-gold"
                    >
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
              &copy; 2026 NutriVillage AI. Estimasi harga dapat berbeda dengan harga pasar
              aktual.
            </p>
            <p className="font-body text-xs text-cream/50">
              Dikembangkan untuk Kabupaten Madiun.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

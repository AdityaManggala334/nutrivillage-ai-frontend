import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui";

/** Header situs untuk halaman publik (landing, auth, onboarding) — FR-03. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
      <div className="app-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg"
          aria-label="NutriVillage AI, kembali ke beranda"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
            NV
          </span>
          <span className="text-base font-bold text-stone-900 dark:text-stone-50">
            NutriVillage <span className="text-brand-600 dark:text-brand-400">AI</span>
          </span>
        </Link>
        <nav aria-label="Navigasi utama" className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink intent="ghost" size="sm" href="/katalog" className="hidden sm:inline-flex">
            Katalog
          </ButtonLink>
          <ButtonLink intent="ghost" size="sm" href="/artikel" className="hidden sm:inline-flex">
            Artikel
          </ButtonLink>
          <ButtonLink size="sm" href="/login">
            Masuk / Daftar
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}

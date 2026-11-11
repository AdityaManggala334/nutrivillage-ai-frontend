"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Beranda", href: "/landing-v3/#beranda" },
  { label: "Tentang Kami", href: "/landing-v3/#tentang" },
  { label: "Rekomendasi Menu", href: "/landing-v3/#menu" },
  { label: "Untuk Masyarakat", href: "/landing-v3/#masyarakat" },
  { label: "Untuk SPPG", href: "/landing-v3/#sppg" },
  { label: "FAQ", href: "/landing-v3/#faq" },
] as const;

/** Navigasi gelap transparan, berubah solid saat scroll. */
export function V3Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-forest-deep/95 shadow-lg shadow-black/20 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="landing-container flex h-20 items-center justify-between">
        <Link href="/landing-v3" className="flex items-center gap-2.5" aria-label="NutriVillage AI, kembali ke beranda">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-brand text-sm font-bold text-white">NV</span>
          <span className="font-body text-base font-bold tracking-wide text-cream">
            NutriVillage <span className="text-gold">AI</span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-sm font-medium text-cream/80 transition-colors duration-200 hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link href="/login" className="landing-btn landing-btn-solid !min-h-0 px-5 py-2.5 text-sm">
            Masuk / Daftar
          </Link>
        </div>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full text-cream transition-colors hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-controls="v3-mobile-menu"
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <div id="v3-mobile-menu" className="border-t border-white/10 bg-forest-deep/95 backdrop-blur-md lg:hidden">
          <nav aria-label="Navigasi seluler" className="landing-container flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 font-body text-base text-cream/90 transition-colors hover:bg-white/10 hover:text-gold"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="landing-btn landing-btn-solid mt-3" onClick={() => setOpen(false)}>
              Masuk / Daftar
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

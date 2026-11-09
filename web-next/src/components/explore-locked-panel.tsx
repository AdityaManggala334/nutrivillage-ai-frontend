"use client";

import Link from "next/link";
import { Lock, Sparkles, UserPlus } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import { useSession } from "@/hooks/use-session";

/**
 * B7 (FR-01 revisi): panel terkunci di Explore untuk tamu.
 *
 * Explore tetap bisa dibuka agar tamu melihat apa yang akan didapat, tapi
 * form diganti panel ini — Recommendation Engine hanya untuk akun terdaftar.
 */
export function ExploreLockedPanel() {
  const { data: user, isPending } = useSession();

  // Tidak tahu perannya (masih memuat) atau bukan tamu -> form normal tampil.
  if (isPending || (user && user.role !== "guest")) return null;

  return (
    <section
      aria-labelledby="explore-locked-title"
      className="glass flex flex-col items-center justify-center rounded-2xl p-10 text-center"
    >
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
        <Lock className="size-7" aria-hidden="true" />
      </span>
      <h2 id="explore-locked-title" className="mt-5 text-xl font-bold text-stone-900 dark:text-stone-50">
        Rekomendasi menu untuk keluargamu
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-300">
        Sistem menyusun 1–5 waktu makan sesuai <b>anggaran keluarga</b>, jumlah
        anggota, umur, dan pantangan — dengan bahan pangan lokal Madiun yang
        harganya terverifikasi. Masuk atau daftar untuk mencobanya.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/register" intent="primary">
          <UserPlus className="size-4" aria-hidden="true" /> Daftar gratis
        </ButtonLink>
        <ButtonLink href="/login" intent="outline">
          Masuk
        </ButtonLink>
      </div>
      <p className="mt-5 flex items-center gap-1.5 text-xs text-stone-400">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Sudah punya resep favorit?{" "}
        <Link href="/katalog" className="underline hover:text-brand-700">
          Jelajahi katalog dulu tanpa daftar
        </Link>
      </p>
    </section>
  );
}

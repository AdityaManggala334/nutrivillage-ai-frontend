import type { Metadata } from "next";
import { CircleHelp } from "lucide-react";
import { GlassShell } from "@/components/glass-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Lupa Password",
  description:
    "Panduan bila Anda lupa password akun NutriVillage AI: langkah yang dapat dicoba dan cara meminta bantuan pengelola.",
  robots: { index: false, follow: false },
};

const STEPS: readonly string[] = [
  "Periksa kembali penulisan password. Huruf besar/kecil dan tanda baca berpengaruh, serta pastikan tidak ada spasi yang ikut tersalin.",
  "Pastikan Anda memakai email yang sama seperti saat mendaftar. Akun petugas SPPG juga memakai email yang didaftarkan.",
  "Bila masih belum bisa masuk, hubungi pengelola NutriVillage AI (admin sistem) dan sebutkan email akun Anda untuk dibantu pengaturan ulang password.",
];

/** FR-02 (tambahan): halaman bantuan lupa password. */
export default function LupaPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <GlassShell className="flex-1">
        <main id="konten-utama" className="app-container flex justify-center py-14">
          <div className="w-full max-w-xl">
            <div className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                <CircleHelp className="size-6" aria-hidden="true" />
              </span>
              <h1 className="mt-4 text-3xl">Lupa Password?</h1>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                Pengaturan ulang password mandiri lewat email belum tersedia pada versi ini. Ikuti
                langkah berikut agar akun Anda dapat dipakai kembali.
              </p>
            </div>

            <ol className="glass-strong mt-8 space-y-4 rounded-3xl p-6 sm:p-8">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xs font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                    {index + 1}
                  </span>
                  <p className="min-w-0 flex-1 text-sm text-stone-700 dark:text-stone-200">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/login">Kembali ke halaman masuk</ButtonLink>
              <ButtonLink href="/katalog" intent="outline">
                Lihat katalog resep
              </ButtonLink>
            </div>

            <p className="mt-6 text-center text-xs text-stone-400">
              Setelah password Anda diatur ulang, segera ganti ke password baru di halaman Profil →
              Ganti Password.
            </p>
          </div>
        </main>
      </GlassShell>
      <SiteFooter />
    </div>
  );
}

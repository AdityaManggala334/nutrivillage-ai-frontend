import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { GlassShell } from "@/components/glass-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Masuk / Daftar",
  description:
    "Masuk atau daftar akun NutriVillage AI untuk menyusun menu bergizi keluarga, atau lanjut sebagai tamu.",
};

/** FR-01, FR-02, FR-03: pintu autentikasi. */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <GlassShell className="flex-1">
        <main id="konten-utama">
          <AuthForm />
        </main>
      </GlassShell>
      <SiteFooter />
    </div>
  );
}

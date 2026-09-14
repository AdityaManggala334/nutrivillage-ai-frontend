import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
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
      <main id="konten-utama" className="flex-1">
        <AuthForm />
      </main>
      <SiteFooter />
    </div>
  );
}

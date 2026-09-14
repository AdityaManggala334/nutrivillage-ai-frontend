import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "NutriVillage AI — Menu Bergizi, Hemat, Pangan Lokal",
  description:
    "NutriVillage AI - rekomendasi menu bergizi, terjangkau, dan berbasis pangan lokal Kabupaten Madiun.",
  alternates: { canonical: "/" },
};

/** FR-03: Landing page sebagai pintu masuk aplikasi. */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="konten-utama">
        <LandingPage />
      </main>
    </>
  );
}

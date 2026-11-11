import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "NutriVillage AI — Gizi Lebih Baik, Pangan Lokal, Masa Depan Lebih Sehat",
  description:
    "NutriVillage AI - rekomendasi menu bergizi, terjangkau, dan berbasis pangan lokal Kabupaten Madiun.",
  alternates: { canonical: "/" },
};

/** FR-03: Landing page sebagai pintu masuk aplikasi (redesign editorial premium). */
export default function HomePage() {
  return <LandingPage />;
}

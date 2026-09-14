import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Onboarding & Data Keluarga",
  description:
    "Kenali NutriVillage AI dan isi data keluarga (anggota, usia, budget, alergi) sebagai dasar rekomendasi menu.",
  robots: { index: false, follow: false },
};

/** FR-04 & FR-05: onboarding dan input data keluarga. */
export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="konten-utama" className="flex-1">
        <OnboardingFlow />
      </main>
      <SiteFooter />
    </div>
  );
}

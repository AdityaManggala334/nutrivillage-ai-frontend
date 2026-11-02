import type { Metadata } from "next";
import { SppgOnboarding } from "@/components/sppg/sppg-onboarding";

export const metadata: Metadata = {
  title: "Onboarding Petugas SPPG",
  description:
    "Pengenalan NutriVillage AI untuk petugas SPPG dan pengisian data sekolah beserta jumlah siswa per jenjang.",
  robots: { index: false, follow: false },
};

/** Onboarding Petugas SPPG (pertama kali login). */
export default function SppgOnboardingPage() {
  return <SppgOnboarding />;
}

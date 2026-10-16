import type { Metadata } from "next";
import { GlassShell } from "@/components/glass-shell";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Onboarding & Data Keluarga",
  description:
    "Kenali NutriVillage AI dan isi data keluarga (anggota, usia, budget, alergi) sebagai dasar rekomendasi menu.",
  robots: { index: false, follow: false },
};

interface OnboardingPageProps {
  readonly searchParams: Promise<{ edit?: string | string[] }>;
}

/** FR-04 & FR-05: onboarding dan input data keluarga. */
export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const isEdit = params.edit === "1" || params.edit === "true";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <GlassShell className="flex-1">
        <main id="konten-utama">
          <OnboardingFlow mode={isEdit ? "edit" : "create"} />
        </main>
      </GlassShell>
      <SiteFooter />
    </div>
  );
}

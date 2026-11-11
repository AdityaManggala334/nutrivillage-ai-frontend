import type { Metadata } from "next";
import { V3About } from "@/components/landing-v3/about";
import { V3Audience } from "@/components/landing-v3/audience";
import { V3Faq } from "@/components/landing-v3/faq";
import { V3FeaturedMenu } from "@/components/landing-v3/featured-menu";
import { V3FinalCta } from "@/components/landing-v3/final-cta";
import { V3Hero } from "@/components/landing-v3/hero";
import { V3HowItWorks } from "@/components/landing-v3/how-it-works";
import { V3Nav } from "@/components/landing-v3/nav";

export const metadata: Metadata = {
  title: "NutriVillage AI (Draft Editorial V3) — Contoh Landing Page",
  robots: { index: false, follow: false },
};

/** DRAFT: contoh landing dark-green editorial (inspirasi layout travel). Tidak diindeks. */
export default function LandingV3Page() {
  return (
    <div className="landing-editorial -mt-20 flex min-h-screen flex-col overflow-x-clip">
      <V3Nav />
      <main id="konten-utama">
        <V3Hero />
        <V3FeaturedMenu />
        <V3About />
        <V3Audience />
        <V3HowItWorks />
        <V3Faq />
        <V3FinalCta />
      </main>
    </div>
  );
}

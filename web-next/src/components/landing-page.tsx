import { About } from "@/components/landing/about";
import { Audience } from "@/components/landing/audience";
import { Faq } from "@/components/landing/faq";
import { FeaturedMenu } from "@/components/landing/featured-menu";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNav } from "@/components/landing/nav";

/**
 * Landing page editorial premium (FR-03, redesign).
 * Tema gelap forest green di-scope via .landing-editorial agar halaman lain
 * (login, katalog, dashboard) tetap memakai tema aplikasi yang sudah ada.
 */
export function LandingPage() {
  return (
    <div className="landing-editorial -mt-20 flex min-h-screen flex-col">
      <LandingNav />
      <main>
        <Hero />
        <FeaturedMenu />
        <div className="landing-container">
          <div className="landing-divider" aria-hidden="true" />
        </div>
        <About />
        <Audience />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
    </div>
  );
}

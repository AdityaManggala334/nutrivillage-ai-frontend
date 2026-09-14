import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nutrivillage-ai.example.com"),
  title: {
    default: "NutriVillage AI — Menu Bergizi, Hemat, Pangan Lokal",
    template: "%s | NutriVillage AI",
  },
  description:
    "NutriVillage AI - rekomendasi menu bergizi, terjangkau, dan berbasis pangan lokal Kabupaten Madiun.",
  keywords: [
    "NutriVillage AI",
    "menu bergizi",
    "pangan lokal Madiun",
    "rekomendasi gizi keluarga",
    "meal planner",
    "Next.js App Router",
  ],
  authors: [{ name: "Aditya Manggala Putra, Chelsea Dealova Islamey" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "NutriVillage AI",
    title: "NutriVillage AI — Menu Bergizi, Hemat, Pangan Lokal",
    description:
      "Rekomendasi 3-5 menu bergizi sesuai anggaran keluarga, lengkap dengan informasi gizi, estimasi biaya, dan jadwal masak mingguan.",
    images: ["/og-cover.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriVillage AI",
    description: "Rekomendasi menu bergizi berbasis pangan lokal Kabupaten Madiun.",
    images: ["/og-cover.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${plusJakarta.variable} min-h-screen font-sans`}>
        <Providers>
          <a
            href="#konten-utama"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Lompat ke konten utama
          </a>
          {children}
          <div
            id="live-region"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />
        </Providers>
      </body>
    </html>
  );
}

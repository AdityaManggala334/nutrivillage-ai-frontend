import type { Metadata } from "next";
import { RecipeCard } from "@/components/recipe-card";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui";
import { listRecipes } from "@/server/data";

export const metadata: Metadata = {
  title: "Katalog Resep",
  description:
    "Katalog resep pangan lokal Kabupaten Madiun yang dapat dibaca tanpa mendaftar (guest mode).",
  alternates: { canonical: "/katalog" },
};

/** FR-03: katalog resep umum untuk pengunjung tanpa daftar (guest mode). */
export default async function KatalogPage() {
  const recipes = await listRecipes();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="konten-utama" className="app-container flex-1 py-10">
        <SectionHeading
          eyebrow="Katalog Publik"
          title="Katalog Resep Pangan Lokal"
          description="Pengunjung dapat membaca katalog resep tanpa mendaftar. Untuk menjalankan rekomendasi menu, silakan masuk atau daftar."
          action={<ButtonLink href="/login">Masuk / Daftar</ButtonLink>}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

import { Leaf } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassShell } from "@/components/glass-shell";
import { RecipeDetail } from "@/components/recipe-detail";
import { getRecipeForRequest } from "@/server/data";

export const dynamic = "force-dynamic";

interface RecipePageProps {
  readonly params: Promise<{ id: string }>;
}

/** Modul 6: Metadata API dinamis (SEO) per resep. */
export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeForRequest(id);

  if (!recipe) {
    return { title: "Resep tidak ditemukan", robots: { index: false, follow: false } };
  }

  return {
    title: recipe.name,
    description: recipe.description,
    alternates: { canonical: `/recipes/${recipe.id}` },
    openGraph: {
      type: "article",
      title: `${recipe.name} — NutriVillage AI`,
      description: recipe.description,
      images: [{ url: "/og-cover.svg", width: 1200, height: 630, alt: recipe.imageAlt }],
    },
  };
}

export default async function RecipeDetailPage({ params }: RecipePageProps) {
  const { id } = await params;

  const recipe = await getRecipeForRequest(id);
  if (!recipe) notFound();

  return (
    <GlassShell className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold text-stone-900 dark:text-stone-50">
            NutriVillage AI
          </span>
        </Link>
        <Link
          href="/explore"
          className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          Explore Menu
        </Link>
      </header>

      <main id="konten-utama" className="mx-auto max-w-6xl px-4 pb-16">
        <RecipeDetail recipe={recipe} />
      </main>
    </GlassShell>
  );
}

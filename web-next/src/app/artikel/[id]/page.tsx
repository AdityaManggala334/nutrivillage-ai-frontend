import type { Metadata } from "next";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui";
import { getArticleById } from "@/server/content-data";

interface ArticlePageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) return { title: "Artikel tidak ditemukan", robots: { index: false } };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/artikel/${article.id}` },
    openGraph: { type: "article", title: article.title, description: article.excerpt },
  };
}

/** FR-03: detail artikel gizi (publik). */
export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="konten-utama" className="app-container flex-1 py-10">
        <article className="mx-auto max-w-3xl">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke daftar artikel
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{article.category}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-stone-400">
              <Clock className="size-3.5" aria-hidden="true" /> {article.readMinutes} menit baca
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-stone-900 dark:text-stone-50">
            {article.title}
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-300">{article.excerpt}</p>
          <div className="mt-6 space-y-4">
            {article.body.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-stone-700 dark:text-stone-200">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

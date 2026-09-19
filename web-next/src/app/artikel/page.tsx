import type { Metadata } from "next";
import { Clock } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getArticles } from "@/server/content-data";

export const metadata: Metadata = {
  title: "Artikel Gizi",
  description:
    "Artikel ringkas seputar gizi seimbang, pangan lokal, dan tips hemat belanja keluarga.",
  alternates: { canonical: "/artikel" },
};

/** FR-03: artikel gizi untuk pengunjung tanpa daftar (guest mode). */
export default async function ArtikelPage() {
  const articles = await getArticles();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="konten-utama" className="app-container flex-1 py-10">
        <SectionHeading
          eyebrow="Edukasi"
          title="Artikel Gizi"
          description="Bacaan singkat seputar gizi keluarga, pangan lokal, dan tips belanja hemat."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {articles.map((article) => (
            <Card key={article.id} className="flex h-full flex-col">
              <CardHeader>
                <Badge tone="brand">{article.category}</Badge>
                <CardTitle>
                  <Link
                    href={`/artikel/${article.id}`}
                    className="hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    {article.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-sm text-stone-500 dark:text-stone-400">{article.excerpt}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-xs text-stone-400">
                  <Clock className="size-3.5" aria-hidden="true" /> {article.readMinutes} menit baca
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

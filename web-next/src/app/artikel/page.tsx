import type { Metadata } from "next";
import { Clock } from "lucide-react";
import Link from "next/link";
import { GlassShell } from "@/components/glass-shell";
import { EmptyState } from "@/components/empty-state";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getArticles } from "@/server/content-api";
import type { Article } from "@/schemas/content";

export const metadata: Metadata = {
  title: "Artikel Gizi",
  description:
    "Artikel ringkas seputar gizi seimbang, pangan lokal, dan tips hemat belanja keluarga.",
  alternates: { canonical: "/artikel" },
};

export const dynamic = "force-dynamic";

/** FR-03: artikel gizi untuk pengunjung tanpa daftar (guest mode). */
export default async function ArtikelPage() {
  let articles: Article[] = [];
  let loadError: string | null = null;
  try {
    articles = await getArticles();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Gagal memuat artikel.";
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <GlassShell className="flex-1">
        <main id="konten-utama" className="app-container py-10">
          <SectionHeading
            eyebrow="Edukasi"
            title="Artikel Gizi"
            description="Bacaan singkat seputar gizi keluarga, pangan lokal, dan tips belanja hemat."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {loadError ? (
              <div className="sm:col-span-2">
                <EmptyState title="Artikel belum dapat dimuat" description={loadError} />
              </div>
            ) : articles.length === 0 ? (
              <div className="sm:col-span-2">
                <EmptyState
                  title="Belum ada artikel"
                  description="Artikel gizi akan muncul di sini setelah ditambahkan melalui panel admin."
                />
              </div>
            ) : (
              articles.map((article) => (
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
                      <Clock className="size-3.5" aria-hidden="true" /> {article.readMinutes} menit
                      baca
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </GlassShell>
      <SiteFooter />
    </div>
  );
}

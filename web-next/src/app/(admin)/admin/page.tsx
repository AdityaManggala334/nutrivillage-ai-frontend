import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  ListTree,
  MapPin,
  Salad,
  ScrollText,
  Tags,
  TriangleAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { AdminLogChart } from "@/components/admin-log-chart";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminCell, AdminPageHeader, AdminStatusBadge, AdminTable } from "@/components/admin-table";
import { ButtonLink } from "@/components/ui";
import { formatDateId, formatRupiah } from "@/lib/utils";
import { getAdminPrices, getAdminStats, getScraperLogs } from "@/server/admin-data";
import { countUsers } from "@/server/auth";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

/** FR-22: dashboard admin (statistik, harga pending, status scraper). */
export default async function AdminDashboardPage() {
  const stats = await getAdminStats(countUsers());
  const pendingPrices = (await getAdminPrices()).filter((price) => price.status === "pending");
  const logs = (await getScraperLogs()).slice(0, 6);

  const cards = [
    { label: "Bahan Pangan", value: stats.ingredients, icon: <Salad className="size-4" aria-hidden="true" />, accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300" },
    { label: "Menu & Resep", value: stats.recipes, icon: <ScrollText className="size-4" aria-hidden="true" />, accent: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300" },
    { label: "Harga Pending", value: stats.pendingPrices, icon: <Clock className="size-4" aria-hidden="true" />, accent: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300" },
    { label: "Harga Disetujui", value: stats.approvedPrices, icon: <BadgeCheck className="size-4" aria-hidden="true" />, accent: "bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300" },
    { label: "Pengguna", value: stats.users, icon: <Users className="size-4" aria-hidden="true" />, accent: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300" },
    { label: "Scraper Gagal", value: stats.scraperFailures, icon: <TriangleAlert className="size-4" aria-hidden="true" />, accent: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300" },
  ];

  const quickLinks = [
    { href: "/admin/harga", label: "Verifikasi Harga", description: "Setujui data harga scraper", icon: Tags },
    { href: "/admin/bahan", label: "Bahan Pangan", description: "Kelola data master bahan", icon: Salad },
    { href: "/admin/nutrisi", label: "Nutrisi", description: "Data gizi acuan TKPI", icon: ListTree },
    { href: "/admin/lokal", label: "Komoditas Lokal", description: "Data pangan lokal Madiun", icon: MapPin },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Admin"
        description="Ringkasan data master, verifikasi harga, dan status scraper NutriVillage AI."
        action={
          <ButtonLink intent="primary" href="/admin/harga">
            Verifikasi Harga
          </ButtonLink>
        }
      />

      {/* Kartu statistik */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <AdminStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            accent={card.accent}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Harga pending */}
        <section className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">
                Harga Menunggu Verifikasi
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Data harga hasil scraper yang belum disetujui.
              </p>
            </div>
            <Link
              href="/admin/harga"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-300"
            >
              Lihat semua <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <AdminTable headers={["Bahan", "Harga", "Sumber", "Tanggal", "Status"]}>
            {pendingPrices.length === 0 ? (
              <tr>
                <AdminCell className="text-stone-400">
                  Tidak ada harga yang menunggu verifikasi.
                </AdminCell>
              </tr>
            ) : (
              pendingPrices.map((price) => (
                <tr key={price.id} className="transition hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <AdminCell className="font-medium">{price.ingredientName}</AdminCell>
                  <AdminCell>
                    {formatRupiah(price.price)} / {price.unit}
                  </AdminCell>
                  <AdminCell>{price.source}</AdminCell>
                  <AdminCell>{formatDateId(price.recordedAt)}</AdminCell>
                  <AdminCell>
                    <AdminStatusBadge status={price.status} />
                  </AdminCell>
                </tr>
              ))
            )}
          </AdminTable>
        </section>

        {/* Grafik scraper + aksi cepat */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
              Hasil Scraper Terakhir
            </h2>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              Jumlah item terambil per eksekusi.
            </p>
            <AdminLogChart logs={logs} />
            <div className="mt-3 flex items-center gap-4 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-brand-500" /> Berhasil
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-red-400" /> Gagal
              </span>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
              Aksi Cepat
            </h2>
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800/60"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-stone-800 dark:text-stone-100">
                      {link.label}
                    </span>
                    <span className="block text-[11px] text-stone-400">{link.description}</span>
                  </span>
                  <ArrowRight className="size-4 text-stone-300" aria-hidden="true" />
                </Link>
              );
            })}
          </section>
        </aside>
      </div>

      {/* Log scraper */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-stone-900 dark:text-stone-50">
          Log Scraper Terakhir
        </h2>
        <AdminTable headers={["Waktu", "Status", "Sumber", "Pesan", "Item"]}>
          {logs.map((log) => (
            <tr key={log.id} className="transition hover:bg-stone-50 dark:hover:bg-stone-800/40">
              <AdminCell>{formatDateId(log.runAt)}</AdminCell>
              <AdminCell>
                <AdminStatusBadge status={log.status} />
              </AdminCell>
              <AdminCell>{log.source}</AdminCell>
              <AdminCell>{log.message}</AdminCell>
              <AdminCell className="tabular-nums">{log.itemsScraped}</AdminCell>
            </tr>
          ))}
        </AdminTable>
      </section>
    </div>
  );
}

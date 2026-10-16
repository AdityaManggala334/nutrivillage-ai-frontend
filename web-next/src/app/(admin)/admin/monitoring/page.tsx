import type { Metadata } from "next";
import { AdminCell, AdminPageHeader, AdminStatusBadge, AdminTable } from "@/components/admin-table";
import { EmptyState } from "@/components/empty-state";
import { formatDateId } from "@/lib/utils";
import { listScraperLogsForSession } from "@/server/market-api";
import type { ScraperLog } from "@/schemas/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Monitoring Scraper",
  robots: { index: false, follow: false },
};

/** FR-31 & FR-34: monitoring status dan log kegagalan scraper (tabel `scraper_runs`). */
export default async function AdminMonitoringPage() {
  let logs: ScraperLog[] = [];
  let loadError: string | null = null;

  try {
    logs = await listScraperLogsForSession();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Gagal memuat log scraper.";
  }

  if (loadError) {
    return (
      <div>
        <AdminPageHeader
          title="Monitoring Scraper"
          description="Status dan log kegagalan scraper harga pangan."
        />
        <EmptyState
          title="Log tidak dapat dimuat"
          description={loadError}
        />
      </div>
    );
  }

  const failures = logs.filter((log) => log.status === "failed").length;

  return (
    <div>
      <AdminPageHeader
        title="Monitoring Scraper"
        description={
          logs.length === 0
            ? "Belum ada eksekusi scraper yang tercatat."
            : `Total ${logs.length} eksekusi terakhir, ${failures} di antaranya gagal.`
        }
      />
      {logs.length === 0 ? (
        <EmptyState
          title="Belum ada log scraper"
          description="Log akan tercatat otomatis setiap kali scraper harga pangan dijalankan."
        />
      ) : (
        <AdminTable headers={["Waktu", "Status", "Sumber", "Pesan", "Item Terambil"]}>
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
      )}
    </div>
  );
}

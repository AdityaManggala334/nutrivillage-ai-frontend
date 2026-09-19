import type { Metadata } from "next";
import { AdminCell, AdminPageHeader, AdminStatusBadge, AdminTable } from "@/components/admin-table";
import { formatDateId } from "@/lib/utils";
import { getScraperLogs } from "@/server/admin-data";

export const metadata: Metadata = {
  title: "Monitoring Scraper",
  robots: { index: false, follow: false },
};

/** FR-31 & FR-34: monitoring status dan log kegagalan scraper. */
export default async function AdminMonitoringPage() {
  const logs = await getScraperLogs();
  const failures = logs.filter((log) => log.status === "failed").length;

  return (
    <div>
      <AdminPageHeader
        title="Monitoring Scraper"
        description={`Total ${logs.length} eksekusi terakhir, ${failures} di antaranya gagal.`}
      />
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
    </div>
  );
}

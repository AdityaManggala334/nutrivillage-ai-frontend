import type { ScraperLog } from "@/schemas/admin";

export interface AdminLogChartProps {
  readonly logs: readonly ScraperLog[];
}

/** Grafik batang mini hasil scraper. React Server Component (tanpa JS klien). */
export function AdminLogChart({ logs }: AdminLogChartProps) {
  const maxItems = Math.max(1, ...logs.map((log) => log.itemsScraped));

  return (
    <div className="mt-4 flex h-28 items-end gap-2">
      {logs.map((log) => (
        <div key={log.id} className="flex h-full flex-1 items-end">
          <div
            className={
              log.status === "success"
                ? "w-full rounded-t-md bg-brand-500"
                : "w-full rounded-t-md bg-red-400"
            }
            style={{ height: `${Math.max(6, (log.itemsScraped / maxItems) * 100)}%` }}
            title={`${log.itemsScraped} item`}
          />
        </div>
      ))}
    </div>
  );
}

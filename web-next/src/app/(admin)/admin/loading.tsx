import { Skeleton } from "@/components/ui";

/**
 * Loading state untuk seluruh halaman panel admin.
 * Muncul saat berpindah menu (dashboard → bahan → musim, dst.) sehingga
 * navigasi terasa instan alih-alih menunggu render server.
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman admin…</span>

      {/* Header halaman */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Skeleton className="h-6 w-52" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Tabel */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="border-b border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-800/50">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="mx-auto h-3 w-16" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {Array.from({ length: 6 }).map((_, row) => (
            <div key={row} className="grid grid-cols-3 gap-4 px-4 py-4 sm:grid-cols-6">
              {Array.from({ length: 6 }).map((_, col) => (
                <Skeleton key={col} className="mx-auto h-4 w-20" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

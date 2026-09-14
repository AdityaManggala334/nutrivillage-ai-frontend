import { RecipeCardSkeleton, Skeleton } from "@/components/ui";

/** Streaming SSR fallback untuk halaman Riwayat. */
export default function HistoryLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

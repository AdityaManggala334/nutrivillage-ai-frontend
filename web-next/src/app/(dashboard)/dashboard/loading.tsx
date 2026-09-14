import { RecipeCardSkeleton, Skeleton } from "@/components/ui";

/** Streaming SSR fallback untuk halaman Dashboard. */
export default function DashboardLoading() {
  return (
    <div className="space-y-7" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-64" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

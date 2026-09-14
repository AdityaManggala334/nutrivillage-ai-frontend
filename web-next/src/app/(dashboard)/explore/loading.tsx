import { RecipeCardSkeleton, Skeleton } from "@/components/ui";

/** Streaming SSR fallback untuk halaman Explore. */
export default function ExploreLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <Skeleton className="h-[32rem] w-full" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui";

/** Streaming SSR fallback untuk halaman Meal Planner. */
export default function MealPlannerLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-11 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <Skeleton key={index} className="h-56 w-full" />
        ))}
      </div>
    </div>
  );
}

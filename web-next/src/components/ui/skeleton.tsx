import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Skeleton loading UI untuk Streaming SSR (Modul 6). */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-xl bg-stone-200/80 dark:bg-stone-800",
        className,
      )}
      {...props}
    />
  );
}

/** Skeleton kartu resep yang dipakai di loading.tsx & Suspense fallback. */
export function RecipeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <Skeleton className="mb-4 h-32 w-full" />
      <Skeleton className="mb-2 h-4 w-2/3" />
      <Skeleton className="mb-4 h-3 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

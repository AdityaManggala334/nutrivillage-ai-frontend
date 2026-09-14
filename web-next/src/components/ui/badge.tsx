import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        brand: "bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200",
        harvest: "bg-harvest-100 text-harvest-800 dark:bg-harvest-900/60 dark:text-harvest-200",
        neutral: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
        info: "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200",
        outline: "border border-stone-300 text-stone-600 dark:border-stone-700 dark:text-stone-300",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface BadgeProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

/** Badge/label reusable (Modul 5). */
export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

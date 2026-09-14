import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      intent: {
        primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
        secondary:
          "bg-white text-brand-700 ring-1 ring-brand-200 ring-inset hover:bg-brand-50 active:bg-brand-100 dark:bg-stone-900 dark:text-brand-300 dark:ring-brand-800",
        ghost:
          "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800",
        harvest: "bg-harvest-400 text-harvest-900 hover:bg-harvest-300 active:bg-harvest-500",
        danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
        outline:
          "border border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends ComponentProps<"button">,
    ButtonVariants {
  readonly loading?: boolean;
}

/** Komponen tombol reusable (Modul 5). RSC-safe: tidak memakai hook. */
export function Button({
  className,
  intent,
  size,
  fullWidth,
  loading = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ intent, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

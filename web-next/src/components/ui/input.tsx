import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm transition placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500";

export interface InputProps extends ComponentProps<"input"> {
  readonly invalid?: boolean;
}

/** Input reusable dengan state error (Modul 5). */
export function Input({ className, invalid = false, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        fieldBase,
        invalid
          ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
          : "border-stone-300 dark:border-stone-700",
        className,
      )}
      {...props}
    />
  );
}

export interface TextareaProps extends ComponentProps<"textarea"> {
  readonly invalid?: boolean;
}

export function Textarea({ className, invalid = false, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        fieldBase,
        "min-h-24 resize-y",
        invalid
          ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
          : "border-stone-300 dark:border-stone-700",
        className,
      )}
      {...props}
    />
  );
}

export interface SelectProps extends ComponentProps<"select"> {
  readonly invalid?: boolean;
}

export function Select({ className, invalid = false, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        fieldBase,
        "appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
        invalid
          ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
          : "border-stone-300 dark:border-stone-700",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-stone-700 dark:text-stone-200",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({ className, children, ...props }: ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn("text-xs font-medium text-red-600 dark:text-red-400", className)}
      {...props}
    >
      {children}
    </p>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export interface ThemeToggleProps {
  /** "icon" untuk header, "menu" untuk baris menu di sidebar. */
  readonly variant?: "icon" | "menu";
  readonly className?: string;
}

/** Tombol ganti tema terang/gelap (Client UI State via Zustand). */
export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const themeMode = useUIStore((state) => state.themeMode);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const isDark = themeMode === "dark";
  const label = isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap";

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-pressed={isDark}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
          className,
        )}
      >
        {isDark ? (
          <Sun className="size-4" aria-hidden="true" />
        ) : (
          <Moon className="size-4" aria-hidden="true" />
        )}
        {isDark ? "Mode terang" : "Mode gelap"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-xl text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}

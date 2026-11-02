"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Chip pilihan (preferensi, pantangan, alergi) untuk konsistensi UI. */

export const toggleListItem = (list: readonly string[], value: string): string[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

/**
 * Gabungkan opsi bawaan dengan nilai tersimpan — pilihan lama milik pengguna
 * tetap tampil (dan aktif) walau tidak ada di daftar opsi.
 */
export const optionsWith = (base: readonly string[], existing: readonly string[]): string[] => [
  ...base,
  ...existing.filter((value) => !base.includes(value)),
];

export function Chip({
  active,
  danger,
  onClick,
  children,
}: {
  readonly active: boolean;
  /** gaya peringatan (merah) untuk pantangan/alergi */
  readonly danger?: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? danger
            ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
            : "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
          : "border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800",
      )}
    >
      {children}
    </button>
  );
}

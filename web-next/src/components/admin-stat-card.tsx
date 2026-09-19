import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AdminStatCardProps {
  readonly label: string;
  readonly value: number;
  readonly icon: ReactNode;
  readonly accent: string;
}

/** Kartu statistik dashboard admin. React Server Component (tanpa JS klien). */
export function AdminStatCard({ label, value, icon, accent }: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
      <span className={cn("flex size-9 items-center justify-center rounded-xl", accent)}>
        {icon}
      </span>
      <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">{value}</p>
      <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
    </div>
  );
}

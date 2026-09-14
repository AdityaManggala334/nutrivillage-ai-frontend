import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}

/** Empty state reusable (Modul 7: penanganan status async kosong). */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center dark:border-stone-700 dark:bg-stone-900/60">
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
        <Inbox className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-stone-800 dark:text-stone-100">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-stone-500 dark:text-stone-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

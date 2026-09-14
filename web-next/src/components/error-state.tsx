import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

export interface ErrorStateProps {
  readonly title?: string;
  readonly message: string;
  readonly action?: ReactNode;
}

/** Error state reusable untuk status async gagal (Modul 5/7). */
export function ErrorState({
  title = "Terjadi kesalahan",
  message,
  action,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900 dark:bg-red-950/40"
    >
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-red-800 dark:text-red-200">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-red-600 dark:text-red-300">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

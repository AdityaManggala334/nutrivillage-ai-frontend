import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">{title}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminTable({
  headers,
  children,
}: {
  readonly headers: readonly string[];
  readonly children: ReactNode;
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50">
            <tr>
              {headers.map((head) => (
                <th
                  key={head}
                  scope="col"
                  className="border-r border-stone-200 px-4 py-3 text-center text-xs font-semibold tracking-wide text-stone-500 uppercase last:border-r-0 dark:border-stone-700 dark:text-stone-400"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

const ALIGN_CLASS: Record<"left" | "center" | "right", string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function AdminCell({
  children,
  className,
  align = "left",
}: {
  readonly children: ReactNode;
  readonly className?: string;
  /** Perataan isi kolom. Default: kiri (header tetap tengah). */
  readonly align?: "left" | "center" | "right";
}) {
  return (
    <td
      className={cn(
        "border-r border-stone-100 px-4 py-3 align-middle text-stone-700 last:border-r-0 dark:border-stone-800 dark:text-stone-200",
        ALIGN_CLASS[align],
        className,
      )}
    >
      {children}
    </td>
  );
}

export type AdminStatus = "pending" | "approved" | "rejected" | "success" | "failed";

const STATUS_MAP: Record<AdminStatus, { tone: "harvest" | "brand" | "danger"; label: string }> = {
  pending: { tone: "harvest", label: "Pending" },
  approved: { tone: "brand", label: "Disetujui" },
  rejected: { tone: "danger", label: "Ditolak" },
  success: { tone: "brand", label: "Berhasil" },
  failed: { tone: "danger", label: "Gagal" },
};

export function AdminStatusBadge({ status }: { readonly status: AdminStatus }) {
  const meta = STATUS_MAP[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

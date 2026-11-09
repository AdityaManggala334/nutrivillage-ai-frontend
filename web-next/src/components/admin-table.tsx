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

export type AdminAlign = "left" | "center" | "right";

const ALIGN_CLASS: Record<AdminAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function AdminTable({
  headers,
  aligns,
  minWidth = "720px",
  children,
}: {
  readonly headers: readonly string[];
  /** Perataan per kolom; dipakai header DAN sel agar tidak saling geser. */
  readonly aligns?: readonly AdminAlign[];
  /** Lebar minimum tabel sebelum digulir horizontal. */
  readonly minWidth?: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead className="border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/50">
            <tr>
              {headers.map((head, i) => (
                <th
                  key={head}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-xs font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400",
                    ALIGN_CLASS[aligns?.[i] ?? "left"],
                  )}
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

export function AdminCell({
  children,
  className,
  align = "left",
}: {
  readonly children: ReactNode;
  readonly className?: string;
  /** Samakan dengan `aligns` pada AdminTable. Default: kiri. */
  readonly align?: AdminAlign;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle text-stone-700 dark:text-stone-200",
        ALIGN_CLASS[align],
        className,
      )}
    >
      {children}
    </td>
  );
}

export type AdminStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "success"
  | "partial"
  | "failed"
  | "verified";

const STATUS_MAP: Record<AdminStatus, { tone: "harvest" | "brand" | "danger"; label: string }> = {
  pending: { tone: "harvest", label: "Pending" },
  approved: { tone: "brand", label: "Disetujui" },
  rejected: { tone: "danger", label: "Ditolak" },
  verified: { tone: "brand", label: "Terverifikasi" },
  success: { tone: "brand", label: "Berhasil" },
  partial: { tone: "harvest", label: "Sebagian" },
  failed: { tone: "danger", label: "Gagal" },
};

export function AdminStatusBadge({ status }: { readonly status: AdminStatus }) {
  const meta = STATUS_MAP[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

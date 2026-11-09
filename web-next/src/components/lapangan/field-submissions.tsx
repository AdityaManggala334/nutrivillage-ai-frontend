"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminStatusBadge, type AdminStatus } from "@/components/admin-table";
import { Button, Skeleton } from "@/components/ui";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useFieldPrices, useWithdrawPriceMutation } from "@/hooks/use-field-prices";
import { formatDateId, formatRupiah } from "@/lib/utils";

const TABS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
];

/** Daftar kiriman petugas; hanya baris `pending` yang bisa ditarik kembali. */
export function FieldSubmissions() {
  const [tab, setTab] = useState("all");
  const { data, isPending, isError, error, refetch } = useFieldPrices(
    tab === "all" ? undefined : tab,
  );
  const tarik = useWithdrawPriceMutation();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter kiriman">
        {TABS.map((t) => (
          <Button
            key={t.value}
            type="button"
            intent={tab === t.value ? "primary" : "outline"}
            size="sm"
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {isPending ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Kiriman tidak dapat dimuat"
          message={error instanceof Error ? error.message : "Coba lagi."}
          action={
            <Button intent="outline" size="sm" onClick={() => void refetch()}>
              Coba lagi
            </Button>
          }
        />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Belum ada kiriman"
          description="Harga yang Anda catat dari pasar akan muncul di sini."
        />
      ) : (
        <ul className="space-y-2">
          {(data ?? []).map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {row.ingredient_name || `Bahan #${row.ingredient_id}`}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {formatRupiah(row.price)} / {row.unit} · {row.source} ·{" "}
                  {formatDateId(row.recorded_date)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <AdminStatusBadge status={row.status as AdminStatus} />
                {row.status === "pending" ? (
                  <Button
                    intent="ghost"
                    size="icon"
                    className="size-8 text-red-600"
                    aria-label={`Tarik kiriman ${row.ingredient_name}`}
                    disabled={tarik.isPending}
                    onClick={() => tarik.mutate(row.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {tarik.isError ? (
        <p className="text-sm text-red-600">
          {tarik.error instanceof Error ? tarik.error.message : "Gagal menarik kiriman."}
        </p>
      ) : null}
    </div>
  );
}

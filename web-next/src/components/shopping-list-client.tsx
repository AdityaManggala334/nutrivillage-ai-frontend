"use client";

import { Check, ListChecks, RefreshCw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Button, Skeleton, Textarea } from "@/components/ui";
import {
  useDeleteShoppingItemMutation,
  useRegenerateShoppingListMutation,
  useShoppingList,
  useToggleShoppingItemMutation,
  useUpdateShoppingNoteMutation,
} from "@/hooks/use-shopping-list";
import { DEFAULT_WEEK_ID } from "@/lib/constants";
import { cn, formatRupiah } from "@/lib/utils";

/** FR-16 & FR-17: checklist belanja, hapus bahan, dan catatan. */
export function ShoppingListClient() {
  const listQuery = useShoppingList();
  const toggleMutation = useToggleShoppingItemMutation();
  const deleteMutation = useDeleteShoppingItemMutation();
  const noteMutation = useUpdateShoppingNoteMutation();
  const regenerateMutation = useRegenerateShoppingListMutation(DEFAULT_WEEK_ID);

  const [note, setNote] = useState("");
  useEffect(() => {
    if (listQuery.data) setNote(listQuery.data.note);
  }, [listQuery.data]);

  if (listQuery.isPending) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        title="Gagal memuat daftar belanja"
        message={listQuery.error instanceof Error ? listQuery.error.message : "Terjadi kesalahan."}
        action={
          <Button intent="danger" onClick={() => void listQuery.refetch()}>
            Coba lagi
          </Button>
        }
      />
    );
  }

  const list = listQuery.data;
  const checkedCount = list.items.filter((item) => item.checked).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {list.items.length} bahan • {checkedCount} sudah dibeli
        </p>
        <Button
          intent="harvest"
          onClick={() => regenerateMutation.mutate()}
          loading={regenerateMutation.isPending}
        >
          <RefreshCw className="size-4" aria-hidden="true" /> Generate dari Jadwal
        </Button>
      </div>

      {list.items.length === 0 ? (
        <EmptyState
          title="Daftar belanja masih kosong"
          description="Jadwalkan menu di Meal Planner, lalu tekan Generate dari Jadwal untuk mengisi daftar belanja."
        />
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {list.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.checked}
                  aria-label={`Tandai ${item.name}`}
                  onClick={() => toggleMutation.mutate({ itemId: item.id, checked: !item.checked })}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md border transition",
                    item.checked
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-800",
                  )}
                >
                  {item.checked ? <Check className="size-4" aria-hidden="true" /> : null}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      item.checked
                        ? "text-stone-400 line-through"
                        : "text-stone-800 dark:text-stone-100",
                    )}
                  >
                    {item.name}{" "}
                    <span className="font-normal text-stone-400">
                      {item.quantity} {item.unit}
                    </span>
                  </p>
                </div>
                <span className="text-sm text-stone-600 dark:text-stone-300">
                  {formatRupiah(item.estimatedPrice)}
                </span>
                <Button
                  intent="ghost"
                  size="icon"
                  className="size-8 text-red-500"
                  aria-label={`Hapus ${item.name}`}
                  loading={deleteMutation.isPending && deleteMutation.variables === item.id}
                  onClick={() => deleteMutation.mutate(item.id)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          <p className="flex items-center justify-between border-t border-stone-200 px-4 py-3 text-sm font-semibold text-stone-900 dark:border-stone-800 dark:text-stone-50">
            <span>Total estimasi</span>
            <span>{formatRupiah(list.totalEstimatedCost)}</span>
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <label
          htmlFor="catatan-belanja"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200"
        >
          <ListChecks className="size-4 text-brand-600" aria-hidden="true" /> Catatan Belanja
        </label>
        <Textarea
          id="catatan-belanja"
          value={note}
          placeholder="Contoh: beli di Pasar Sleko, tawar dulu harganya."
          onChange={(event) => setNote(event.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <Button
            intent="secondary"
            size="sm"
            loading={noteMutation.isPending}
            onClick={() => noteMutation.mutate(note)}
          >
            <Save className="size-4" aria-hidden="true" /> Simpan Catatan
          </Button>
        </div>
      </div>
    </div>
  );
}

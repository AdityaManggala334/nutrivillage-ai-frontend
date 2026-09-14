"use client";

import { Search, Star, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { RecipeCard } from "@/components/recipe-card";
import { Button, ButtonLink, Input, RecipeCardSkeleton } from "@/components/ui";
import {
  useDeleteHistoryMutation,
  useHistory,
  useToggleFavoriteMutation,
} from "@/hooks/use-history";
import { formatDateId } from "@/lib/utils";
import type { HistoryFilter } from "@/schemas/domain";
import { useUIStore } from "@/stores/ui-store";

const FILTER_TABS: ReadonlyArray<{ value: HistoryFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "favorite", label: "Favorit" },
  { value: "month", label: "Bulan ini" },
];

/**
 * FR-13 / FR-14: daftar riwayat. Filter & pencarian adalah Client UI State
 * (Zustand), sedangkan data riwayat adalah Server State (TanStack Query).
 */
export interface HistoryListProps {
  /** Bila diisi, filter dikunci (dipakai halaman Favorit) dan tab disembunyikan. */
  readonly lockedFilter?: HistoryFilter;
}

export function HistoryList({ lockedFilter }: HistoryListProps) {
  const storeFilter = useUIStore((state) => state.activeHistoryFilter);
  const setActiveFilter = useUIStore((state) => state.setHistoryFilter);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);

  const activeFilter = lockedFilter ?? storeFilter;

  const { data, isPending, isError, error, refetch, isFetching } = useHistory(activeFilter);
  const deleteMutation = useDeleteHistoryMutation(activeFilter);
  const favoriteMutation = useToggleFavoriteMutation(activeFilter);

  const query = searchQuery.trim().toLowerCase();
  const visibleEntries = (data ?? []).filter((entry) =>
    query.length === 0 ? true : entry.recipe.name.toLowerCase().includes(query),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {lockedFilter ? (
          <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
            Menampilkan menu favorit
          </p>
        ) : (
          <div role="tablist" aria-label="Filter riwayat" className="flex gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(tab.value)}
                  className={
                    isActive
                      ? "rounded-lg bg-white px-3.5 py-1.5 text-sm font-semibold text-brand-700 shadow-sm dark:bg-stone-900 dark:text-brand-300"
                      : "rounded-lg px-3.5 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300"
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Cari menu di riwayat..."
            aria-label="Cari menu di riwayat"
            className="pl-9"
          />
        </div>
      </div>

      {isPending ? (
        <div aria-busy="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {isError ? (
        <ErrorState
          title="Gagal memuat riwayat"
          message={error instanceof Error ? error.message : "Terjadi kesalahan."}
          action={
            <Button intent="danger" onClick={() => void refetch()} loading={isFetching}>
              Coba lagi
            </Button>
          }
        />
      ) : null}

      {!isPending && !isError && visibleEntries.length === 0 ? (
        <EmptyState
          title={
            query
              ? "Menu tidak ditemukan"
              : lockedFilter === "favorite"
                ? "Belum ada menu favorit"
                : "Riwayat masih kosong"
          }
          description={
            query
              ? `Tidak ada riwayat yang cocok dengan "${searchQuery}".`
              : lockedFilter === "favorite"
                ? "Tandai menu sebagai favorit dari halaman Riwayat agar muncul di sini."
                : "Simpan rekomendasi dari halaman Explore atau jadwalkan menu di Meal Planner agar muncul di sini."
          }
          action={<ButtonLink href="/explore">Jelajahi menu</ButtonLink>}
        />
      ) : null}

      {visibleEntries.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleEntries.map((entry) => (
            <RecipeCard key={entry.id} recipe={entry.recipe}>
              <Button
                intent={entry.favorite ? "harvest" : "outline"}
                size="sm"
                aria-pressed={entry.favorite}
                loading={
                  favoriteMutation.isPending && favoriteMutation.variables === entry.id
                }
                onClick={() => favoriteMutation.mutate(entry.id)}
              >
                <Star
                  className="size-4"
                  aria-hidden="true"
                  fill={entry.favorite ? "currentColor" : "none"}
                />
                {entry.favorite ? "Favorit" : "Favoritkan"}
              </Button>
              <Button
                intent="danger"
                size="sm"
                aria-label={`Hapus ${entry.recipe.name} dari riwayat`}
                loading={deleteMutation.isPending && deleteMutation.variables === entry.id}
                onClick={() => deleteMutation.mutate(entry.id)}
              >
                <Trash2 className="size-4" aria-hidden="true" /> Hapus
              </Button>
              <span className="ml-auto self-center text-xs text-stone-400">
                {formatDateId(entry.savedAt)}
              </span>
            </RecipeCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}

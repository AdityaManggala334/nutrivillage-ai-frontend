"use client";

import { CalendarCheck, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "@/components/error-state";
import { ShoppingListPanel } from "@/components/shopping-list-panel";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from "@/components/ui";
import {
  useAssignMealMutation,
  useGenerateShoppingListMutation,
  useMealPlan,
  useRemoveMealMutation,
} from "@/hooks/use-meal-planner";
import { useRecipes } from "@/hooks/use-recipes";
import {
  DAYS,
  DAY_LABELS,
  DEFAULT_WEEK_ID,
  MEAL_SLOTS,
  MEAL_SLOT_ICONS,
  MEAL_SLOT_LABELS,
} from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import type { DayOfWeek, MealPlanEntry, MealSlot, ShoppingList } from "@/schemas/domain";
import { useMealPlannerStore, type SlotTarget } from "@/stores/meal-planner-store";

/**
 * FR-26 / FR-27 / FR-28: kalender jadwal masak mingguan.
 * - Server State: jadwal & resep via TanStack Query.
 * - Client UI State: target picker & drag via Zustand.
 */
export function MealPlannerBoard() {
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);

  const mealPlan = useMealPlan(DEFAULT_WEEK_ID);
  const recipesQuery = useRecipes();
  const assignMutation = useAssignMealMutation(DEFAULT_WEEK_ID);
  const removeMutation = useRemoveMealMutation(DEFAULT_WEEK_ID);
  const shoppingMutation = useGenerateShoppingListMutation(DEFAULT_WEEK_ID);

  const pickerTarget = useMealPlannerStore((state) => state.pickerTarget);
  const openPicker = useMealPlannerStore((state) => state.openPicker);
  const closePicker = useMealPlannerStore((state) => state.closePicker);

  const entries = mealPlan.data?.entries ?? [];

  const findEntry = (day: DayOfWeek, slot: MealSlot): MealPlanEntry | undefined =>
    entries.find((entry) => entry.day === day && entry.slot === slot);

  const assign = (recipeId: string, target: SlotTarget) => {
    assignMutation.mutate(
      { weekId: DEFAULT_WEEK_ID, day: target.day, slot: target.slot, recipeId, note: "" },
      { onSuccess: () => closePicker() },
    );
  };

  const handleGenerate = () => {
    shoppingMutation.mutate(undefined, {
      onSuccess: (data) => setShoppingList(data),
    });
  };

  const weeklyTotal = entries.reduce((total, entry) => total + entry.recipe.estimatedCost, 0);

  if (mealPlan.isPending) {
    return (
      <div aria-busy="true" className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <Skeleton key={index} className="h-56 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (mealPlan.isError) {
    return (
      <ErrorState
        title="Gagal memuat jadwal"
        message={
          mealPlan.error instanceof Error ? mealPlan.error.message : "Terjadi kesalahan."
        }
        action={
          <Button intent="danger" onClick={() => void mealPlan.refetch()} loading={mealPlan.isFetching}>
            Coba lagi
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {mealPlan.data.weekLabel} • {entries.length} menu terjadwal
          </p>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            Estimasi total: {formatRupiah(weeklyTotal)}
          </p>
        </div>
        <Button intent="harvest" onClick={handleGenerate} loading={shoppingMutation.isPending}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Generate Shopping List dari Jadwal
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAYS.map((day) => (
          <div
            key={day}
            className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-stone-100">
              <CalendarCheck className="size-4 text-brand-600" aria-hidden="true" />
              {DAY_LABELS[day]}
            </h3>
            <div className="space-y-2">
              {MEAL_SLOTS.map((slot) => {
                const entry = findEntry(day, slot);
                return (
                  <div
                    key={slot}
                    className="rounded-xl border border-stone-200 p-2.5 transition dark:border-stone-800"
                  >
                    <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-stone-500 dark:text-stone-400">
                      <span aria-hidden="true">{MEAL_SLOT_ICONS[slot]}</span>
                      {MEAL_SLOT_LABELS[slot]}
                    </p>

                    {entry ? (
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                          {entry.recipe.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge tone="neutral">{formatRupiah(entry.recipe.estimatedCost)}</Badge>
                          <Button
                            intent="ghost"
                            size="icon"
                            className="size-7 text-red-500"
                            aria-label={`Hapus ${entry.recipe.name} dari jadwal`}
                            loading={
                              removeMutation.isPending && removeMutation.variables === entry.id
                            }
                            onClick={() => removeMutation.mutate(entry.id)}
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        intent="outline"
                        size="sm"
                        fullWidth
                        className="h-8 text-xs"
                        onClick={() => openPicker({ day, slot })}
                      >
                        <Plus className="size-3.5" aria-hidden="true" /> Tambah menu
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ShoppingListPanel shoppingList={shoppingList} />

      {pickerTarget ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) closePicker();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pilih Menu</DialogTitle>
              <DialogDescription>
                {DAY_LABELS[pickerTarget.day]} • {MEAL_SLOT_LABELS[pickerTarget.slot]} — pilih menu
                untuk dijadwalkan pada slot ini.
              </DialogDescription>
            </DialogHeader>

            {recipesQuery.isPending ? (
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : null}

            {recipesQuery.isError ? (
              <ErrorState
                title="Gagal memuat katalog resep"
                message={
                  recipesQuery.error instanceof Error
                    ? recipesQuery.error.message
                    : "Terjadi kesalahan."
                }
                action={
                  <Button intent="danger" onClick={() => void recipesQuery.refetch()}>
                    Coba lagi
                  </Button>
                }
              />
            ) : null}

            <ul className="space-y-2">
              {(recipesQuery.data ?? []).map((recipe) => (
                <li key={recipe.id}>
                  <button
                    type="button"
                    onClick={() => assign(recipe.id, pickerTarget)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-stone-200 px-3 py-2.5 text-left transition hover:border-brand-400 hover:bg-brand-50/60 dark:border-stone-800 dark:hover:bg-brand-950/30"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {recipe.name}
                      </span>
                      <span className="block text-xs text-stone-500 dark:text-stone-400">
                        {recipe.category} • {recipe.nutrition.protein} g protein
                      </span>
                    </span>
                    <Badge tone="brand">{formatRupiah(recipe.estimatedCost)}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

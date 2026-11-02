"use client";

import { CalendarCheck, Info, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { SppgContextSelector } from "@/components/sppg/sppg-context-selector";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  GlassCard,
  Skeleton,
} from "@/components/ui";
import { useRecipes } from "@/hooks/use-recipes";
import { DAYS, DAY_LABELS, MEAL_SLOTS, MEAL_SLOT_ICONS, MEAL_SLOT_LABELS } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import type { DayOfWeek, MealSlot } from "@/schemas/domain";
import { planKeyOf, scheduleKey, totalPorsi, useSppgStore } from "@/stores/sppg-store";

interface SlotTarget {
  readonly day: DayOfWeek;
  readonly slot: MealSlot;
}

/** Meal Planner Petugas SPPG — rencana per konteks (sekolah/kelompok atau manual). */
export function SppgMealPlanner() {
  const recipesQuery = useRecipes();
  const rows = useSppgStore((state) => state.rows);
  const label = useSppgStore((state) => state.label);
  const plans = useSppgStore((state) => state.plans);
  const assignMeal = useSppgStore((state) => state.assignMeal);
  const removeMeal = useSppgStore((state) => state.removeMeal);
  const clearPlan = useSppgStore((state) => state.clearPlan);

  const [target, setTarget] = useState<SlotTarget | null>(null);

  const studentCount = totalPorsi(rows);
  const planKey = planKeyOf(rows, label);
  const schedule = useMemo(() => plans[planKey] ?? {}, [plans, planKey]);
  const recipeById = useMemo(
    () => new Map((recipesQuery.data ?? []).map((recipe) => [recipe.id, recipe])),
    [recipesQuery.data],
  );

  const perPortion = (recipeId: string): number => {
    const recipe = recipeById.get(recipeId);
    return recipe ? recipe.estimatedCost / recipe.servings : 0;
  };
  const plannedCount = Object.keys(schedule).length;
  const totalBatch = Object.values(schedule).reduce(
    (acc, recipeId) => acc + perPortion(recipeId) * studentCount,
    0,
  );

  return (
    <div className="space-y-6">
      <GlassCard className="p-5">
        <h2 className="mb-4 text-sm font-bold text-stone-800">Konteks Rencana</h2>
        <SppgContextSelector />
        {rows.length > 0 ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
            <Info className="size-3.5" aria-hidden="true" />
            {label} • {studentCount} siswa ({rows.length} jenjang)
          </p>
        ) : null}
      </GlassCard>

      {rows.length === 0 ? (
        <EmptyState
          title="Belum ada konteks rencana"
          description="Pilih sekolah & kelompok di atas, atau susun porsi manual lewat halaman Explore SPPG."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-stone-500">
                {studentCount} siswa • {plannedCount} menu terjadwal
              </p>
              <p className="text-sm font-semibold text-stone-800">
                Estimasi total: {formatRupiah(Math.round(totalBatch))}
              </p>
            </div>
            <div className="flex gap-2">
              {plannedCount > 0 ? (
                <Button
                  intent="outline"
                  onClick={() => {
                    if (window.confirm("Kosongkan seluruh rencana pada konteks ini?")) clearPlan();
                  }}
                >
                  Kosongkan
                </Button>
              ) : null}
              <Link href="/sppg/shopping-list">
                <Button intent="harvest">
                  <ShoppingCart className="size-4" aria-hidden="true" /> Daftar Belanja
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DAYS.map((day) => (
              <GlassCard key={day} radius="2xl" className="p-3">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-800">
                  <CalendarCheck className="size-4 text-brand-600" aria-hidden="true" />
                  {DAY_LABELS[day]}
                </h3>
                <div className="space-y-2">
                  {MEAL_SLOTS.map((slot) => {
                    const recipeId = schedule[scheduleKey(day, slot)];
                    const recipe = recipeId ? recipeById.get(recipeId) : undefined;
                    return (
                      <div
                        key={slot}
                        className="rounded-xl border border-white/50 bg-white/40 p-2.5 dark:border-white/10 dark:bg-stone-900/30"
                      >
                        <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-stone-500">
                          <span aria-hidden="true">{MEAL_SLOT_ICONS[slot]}</span>
                          {MEAL_SLOT_LABELS[slot]}
                        </p>
                        {recipe ? (
                          <div className="space-y-1.5">
                            <p className="text-sm font-semibold text-stone-800">{recipe.name}</p>
                            <div className="flex items-center justify-between">
                              <Badge tone="neutral">
                                {formatRupiah(Math.round(perPortion(recipe.id) * studentCount))}
                              </Badge>
                              <Button
                                intent="ghost"
                                size="icon"
                                className="size-7 text-red-500"
                                aria-label={`Hapus ${recipe.name}`}
                                onClick={() => removeMeal(day, slot)}
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
                            onClick={() => setTarget({ day, slot })}
                          >
                            <Plus className="size-3.5" aria-hidden="true" /> Tambah menu
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {target ? (
        <Dialog open onOpenChange={(open) => (open ? undefined : setTarget(null))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pilih Menu</DialogTitle>
              <DialogDescription>
                {DAY_LABELS[target.day]} • {MEAL_SLOT_LABELS[target.slot]}
              </DialogDescription>
            </DialogHeader>

            {recipesQuery.isPending ? (
              <div className="space-y-2">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : recipesQuery.isError ? (
              <ErrorState
                title="Gagal memuat katalog resep"
                message={
                  recipesQuery.error instanceof Error ? recipesQuery.error.message : "Terjadi kesalahan."
                }
                action={
                  <Button intent="danger" onClick={() => void recipesQuery.refetch()}>
                    Coba Lagi
                  </Button>
                }
              />
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {(recipesQuery.data ?? []).map((recipe) => {
                  const pp = recipe.estimatedCost / recipe.servings;
                  return (
                    <li key={recipe.id}>
                      <button
                        type="button"
                        onClick={() => {
                          assignMeal(target.day, target.slot, recipe.id);
                          setTarget(null);
                        }}
                        className="lift flex w-full items-center justify-between gap-3 rounded-xl border border-white/50 bg-white/40 px-3 py-2.5 text-left hover:border-brand-400 dark:border-white/10 dark:bg-stone-900/30"
                      >
                        <span>
                          <span className="block text-sm font-semibold text-stone-800">
                            {recipe.name}
                          </span>
                          <span className="block text-xs text-stone-500">
                            {formatRupiah(Math.round(pp))}/porsi • {recipe.nutrition.protein} g protein
                          </span>
                        </span>
                        <Badge tone="brand">
                          {formatRupiah(Math.round(pp * studentCount))} /{studentCount}
                        </Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

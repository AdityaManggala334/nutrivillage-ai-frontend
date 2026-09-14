"use client";

import { CalendarPlus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { SaveRecipeButton } from "@/components/save-recipe-button";
import { Button, Label, Select } from "@/components/ui";
import {
  useAddRecipeToShoppingListMutation,
  useAssignMealMutation,
} from "@/hooks/use-meal-planner";
import { DAYS, DAY_LABELS, DEFAULT_WEEK_ID, MEAL_SLOTS, MEAL_SLOT_LABELS } from "@/lib/constants";
import type { DayOfWeek, MealSlot } from "@/schemas/domain";

export interface RecipeActionsProps {
  readonly recipeId: string;
  readonly recipeName: string;
}

/**
 * FR-12 / FR-26 / FR-15: aksi pada halaman detail resep.
 * Semua aksi adalah mutasi TanStack Query (Server State).
 */
export function RecipeActions({ recipeId, recipeName }: RecipeActionsProps) {
  const [day, setDay] = useState<DayOfWeek>("senin");
  const [slot, setSlot] = useState<MealSlot>("makan-siang");
  const [feedback, setFeedback] = useState<string>("");

  const assignMutation = useAssignMealMutation(DEFAULT_WEEK_ID);
  const shoppingMutation = useAddRecipeToShoppingListMutation();

  const handleAssign = () => {
    assignMutation.mutate(
      { weekId: DEFAULT_WEEK_ID, day, slot, recipeId, note: "" },
      {
        onSuccess: () =>
          setFeedback(
            `${recipeName} dijadwalkan pada ${DAY_LABELS[day]} - ${MEAL_SLOT_LABELS[slot]}.`,
          ),
      },
    );
  };

  const handleShopping = () => {
    shoppingMutation.mutate(recipeId, {
      onSuccess: (list) =>
        setFeedback(
          `${list.items.length} bahan ditambahkan ke daftar belanja (estimasi ${list.totalEstimatedCost.toLocaleString("id-ID")}).`,
        ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SaveRecipeButton recipeId={recipeId} />
        <Button
          intent="harvest"
          size="sm"
          loading={shoppingMutation.isPending}
          onClick={handleShopping}
        >
          <ShoppingCart className="size-4" aria-hidden="true" /> Tambah ke Shopping List
        </Button>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900/60">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
          <CalendarPlus className="size-4 text-brand-600" aria-hidden="true" />
          Tambahkan ke Meal Planner
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="assign-day">Hari</Label>
            <Select
              id="assign-day"
              value={day}
              onChange={(event) => setDay(event.target.value as DayOfWeek)}
              className="w-36"
            >
              {DAYS.map((option) => (
                <option key={option} value={option}>
                  {DAY_LABELS[option]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="assign-slot">Waktu makan</Label>
            <Select
              id="assign-slot"
              value={slot}
              onChange={(event) => setSlot(event.target.value as MealSlot)}
              className="w-40"
            >
              {MEAL_SLOTS.map((option) => (
                <option key={option} value={option}>
                  {MEAL_SLOT_LABELS[option]}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={handleAssign} loading={assignMutation.isPending}>
            Jadwalkan
          </Button>
        </div>
      </div>

      <p aria-live="polite" className="min-h-5 text-sm text-brand-700 dark:text-brand-300">
        {feedback}
      </p>
    </div>
  );
}

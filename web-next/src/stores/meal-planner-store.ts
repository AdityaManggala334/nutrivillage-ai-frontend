"use client";

import { create } from "zustand";
import type { DayOfWeek, MealSlot } from "@/schemas/domain";

export interface SlotTarget {
  readonly day: DayOfWeek;
  readonly slot: MealSlot;
}

/**
 * Modul 7: Client UI State khusus interaksi Meal Planner (FR-26/FR-28).
 * Menyimpan target slot yang sedang diisi dan resep yang dipilih untuk
 * di-drag/click-assign. Data jadwal tetap berasal dari TanStack Query.
 */
export interface MealPlannerState {
  pickerTarget: SlotTarget | null;
  selectedRecipeId: string | null;
  draggingRecipeId: string | null;

  openPicker: (target: SlotTarget) => void;
  closePicker: () => void;
  selectRecipe: (recipeId: string | null) => void;
  startDrag: (recipeId: string) => void;
  endDrag: () => void;
}

export const useMealPlannerStore = create<MealPlannerState>()((set) => ({
  pickerTarget: null,
  selectedRecipeId: null,
  draggingRecipeId: null,

  openPicker: (target) => set({ pickerTarget: target, selectedRecipeId: null }),
  closePicker: () => set({ pickerTarget: null }),
  selectRecipe: (recipeId) => set({ selectedRecipeId: recipeId }),
  startDrag: (recipeId) => set({ draggingRecipeId: recipeId }),
  endDrag: () => set({ draggingRecipeId: null }),
}));

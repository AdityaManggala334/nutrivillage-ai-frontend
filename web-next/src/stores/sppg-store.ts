"use client";

import { create } from "zustand";
import type { DayOfWeek, MealSlot } from "@/schemas/domain";
import type { BeneficiaryLevel } from "@/schemas/school";

/**
 * Client UI State untuk alur Petugas SPPG.
 *
 * Konteks perhitungan disimpan sebagai daftar baris porsi (jenjang + jumlah
 * siswa) sehingga mendukung:
 * - template dari Data Sekolah (satu kelompok),
 * - input manual (SD/SMP/SMA sekaligus),
 * - dan dipakai bersama oleh Explore, Meal Planner, serta Shopping List.
 */

export interface PorsiRow {
  readonly level: BeneficiaryLevel;
  readonly studentCount: number;
}

export type ScheduleKey = `${DayOfWeek}|${MealSlot}`;

export interface SppgState {
  rows: PorsiRow[];
  label: string;
  budgetPerPortion: number | null;
  /** planKey → jadwal (kunci hari|slot → id resep). */
  plans: Record<string, Record<string, string>>;

  setContext: (input: {
    rows: PorsiRow[];
    label: string;
    budgetPerPortion?: number | null;
  }) => void;
  assignMeal: (day: DayOfWeek, slot: MealSlot, recipeId: string) => void;
  removeMeal: (day: DayOfWeek, slot: MealSlot) => void;
  clearPlan: () => void;
}

export const scheduleKey = (day: DayOfWeek, slot: MealSlot): ScheduleKey =>
  `${day}|${slot}` as ScheduleKey;

export const totalPorsi = (rows: readonly PorsiRow[]): number =>
  rows.reduce((total, row) => total + row.studentCount, 0);

export const planKeyOf = (rows: readonly PorsiRow[], label: string): string =>
  `${label}::${rows.map((row) => `${row.level}:${row.studentCount}`).join(",")}`;

export const useSppgStore = create<SppgState>()((set, get) => ({
  rows: [],
  label: "Input manual",
  budgetPerPortion: null,
  plans: {},

  setContext: ({ rows, label, budgetPerPortion }) =>
    set({ rows, label, budgetPerPortion: budgetPerPortion ?? null }),

  assignMeal: (day, slot, recipeId) => {
    const { rows, label, plans } = get();
    const key = planKeyOf(rows, label);
    const current = plans[key] ?? {};
    set({ plans: { ...plans, [key]: { ...current, [scheduleKey(day, slot)]: recipeId } } });
  },

  removeMeal: (day, slot) => {
    const { rows, label, plans } = get();
    const key = planKeyOf(rows, label);
    const current = { ...(plans[key] ?? {}) };
    delete current[scheduleKey(day, slot)];
    set({ plans: { ...plans, [key]: current } });
  },

  clearPlan: () => {
    const { rows, label, plans } = get();
    const key = planKeyOf(rows, label);
    set({ plans: { ...plans, [key]: {} } });
  },
}));

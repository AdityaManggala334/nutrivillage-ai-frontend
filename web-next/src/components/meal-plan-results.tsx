"use client";

import { AlertTriangle, CheckCircle2, Leaf, Plus } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { formatRupiah } from "@/lib/utils";
import type { MealItem, MealPlan } from "@/schemas/meal-plan";

const SLOT_LABELS: Readonly<Record<string, string>> = {
  pokok: "Pokok",
  hewani: "Hewani",
  nabati: "Nabati",
  sayur: "Sayur",
  buah: "Buah",
  susu: "Susu",
  hidangan: "Hidangan",
};

const pct = (value: number): string => `${Math.round(value)}%`;

function TargetBadge({ label, value }: { readonly label: string; readonly value: number }) {
  const tone = value < 80 ? "danger" : value > 160 ? "harvest" : "brand";
  return (
    <Badge tone={tone}>
      {label} {pct(value)}
    </Badge>
  );
}

export interface MealPlanResultsProps {
  readonly plan: MealPlan;
  /** Tampilan ringkas untuk dashboard (tanpa daftar belanja & target anggota). */
  readonly compact?: boolean;
  /** Bila diisi, tiap komponen punya tombol "Rencanakan". */
  readonly onPlanItem?: (item: MealItem) => void;
}

/** FR-10: hasil berupa PAKET makan per waktu, lengkap dengan biaya & peringatan. */
export function MealPlanResults({ plan, compact = false, onPlanItem }: MealPlanResultsProps) {
  if (plan.status === "infeasible") {
    return (
      <div className="glass-subtle rounded-2xl p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
          <AlertTriangle className="size-4" aria-hidden="true" />
          Paket belum bisa disusun
        </p>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          {plan.reason ?? "Data menu belum mencukupi."}
        </p>
        {plan.suggestion ? (
          <p className="mt-2 text-sm font-medium text-stone-800 dark:text-stone-100">
            Saran: {plan.suggestion}
          </p>
        ) : null}
      </div>
    );
  }

  const meals = compact ? plan.meals.slice(0, 2) : plan.meals;
  const warningList = plan.warnings.slice(0, compact ? 2 : plan.warnings.length);

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
              Paket makan {plan.meals.length} waktu
            </p>
            <p className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-50">
              {formatRupiah(plan.totalDailyCost)}{" "}
              <span className="text-sm font-medium text-stone-500">
                / hari dari {formatRupiah(plan.dailyBudget)}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={plan.withinBudget ? "brand" : "danger"}>
              {plan.withinBudget ? "Dalam anggaran" : "Melebihi anggaran"}
            </Badge>
            <Badge tone="neutral">
              {plan.requiredSlots.length} slot wajib
            </Badge>
          </div>
        </div>

        {plan.target.members.length ? (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-xs font-semibold text-stone-500">
              Target gizi per anggota ({plan.target.members.length} orang)
            </summary>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {plan.target.members.map((member) => (
                <li key={member.name} className="text-xs text-stone-600 dark:text-stone-300">
                  <span className="font-semibold text-stone-800 dark:text-stone-100">
                    {member.name}
                  </span>{" "}
                  · {member.age} th · {member.bmi} BMI · {member.nutritionStatus} ·{" "}
                  {Math.round(member.energy)} kkal ({member.basis})
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>

      {warningList.length || plan.adjustments.length ? (
        <ul className="space-y-1.5 rounded-xl bg-harvest-50 p-4 text-xs leading-relaxed text-harvest-900 dark:bg-harvest-950/30 dark:text-harvest-100">
          {[...plan.adjustments, ...warningList].map((message) => (
            <li key={message} className="flex gap-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{message}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {meals.map((meal) => (
          <article key={meal.label} className="glass flex h-full flex-col rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">{meal.label}</h3>
              <Badge tone="brand">{formatRupiah(meal.summary.cost)}</Badge>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <TargetBadge label="Energi" value={meal.summary.energyPct} />
              <TargetBadge label="Protein" value={meal.summary.proteinPct} />
              {meal.summary.compliant ? (
                <Badge tone="neutral">
                  <CheckCircle2 className="size-3" aria-hidden="true" /> GGL aman
                </Badge>
              ) : (
                <Badge tone="danger">GGL tinggi</Badge>
              )}
            </div>

            <ul className="mt-3 flex-1 space-y-2">
              {meal.items.map((item) => (
                <li key={`${meal.label}-${item.recipeId}`} className="flex items-start gap-2">
                  <span className="mt-0.5 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                    {SLOT_LABELS[item.slot] ?? item.slot}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-stone-800 dark:text-stone-100">
                      {item.name}
                    </span>
                    <span className="block text-[11px] text-stone-400 tabular-nums">
                      {Math.round(item.calories)} kkal · {item.protein.toFixed(1)} g protein ·{" "}
                      {formatRupiah(item.cost)}
                    </span>
                  </span>
                  {onPlanItem ? (
                    <Button
                      size="sm"
                      intent="ghost"
                      aria-label={`Rencanakan ${item.name}`}
                      onClick={() => onPlanItem(item)}
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>

            <p className="mt-3 flex items-center gap-1 text-[11px] text-stone-400">
              <Leaf className="size-3" aria-hidden="true" />
              {meal.summary.components} komponen · sisa{" "}
              {formatRupiah(Math.max(0, meal.budgetPerPortion - meal.summary.cost))}
            </p>
          </article>
        ))}
      </div>

      {plan.snacks.length ? (
        <div className="glass-subtle rounded-2xl p-4">
          <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">Selingan</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {plan.snacks.map((snack) => (
              <li key={`${snack.label}-${snack.recipeId}`}>
                <Badge tone="neutral">
                  {snack.name} · {formatRupiah(snack.cost)}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!compact && plan.shopping.length ? (
        <details className="glass rounded-2xl p-4">
          <summary className="cursor-pointer text-sm font-semibold text-stone-800 dark:text-stone-100">
            Daftar belanja ({plan.shopping.length} bahan ·{" "}
            {formatRupiah(plan.shopping.reduce((sum, row) => sum + row.cost, 0))})
          </summary>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {plan.shopping.map((row) => (
              <li
                key={row.name}
                className="flex justify-between gap-3 border-b border-stone-100 py-1 text-xs dark:border-stone-800"
              >
                <span className="text-stone-700 dark:text-stone-200">{row.name}</span>
                <span className="text-stone-500 tabular-nums">
                  {Math.round(row.grams)} g · {formatRupiah(row.cost)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

"use client";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { MealPlan } from "@/schemas/meal-plan";

import { z as zod } from "zod";

const ResponseSchema = zod.object({
  explanation: zod.string().min(1),
  model: zod.string(),
  source: zod.enum(["llm", "fallback", "cache"]),
});

type Sumber = "llm" | "fallback" | "cache";
const LABEL_SUMBER: Record<Sumber, string> = {
  llm: "Disusun AI",
  cache: "Penjelasan tersimpan",
  fallback: "Ringkasan otomatis",
};

function Bar({ label, pct }: { readonly label: string; readonly pct: number }) {
  const clamp = Math.max(0, Math.min(pct, 200));
  const warna =
    pct < 80
      ? "bg-red-500"
      : pct > 160
        ? "bg-amber-500"
        : "bg-brand-600";
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-stone-700 dark:text-stone-200">{label}</span>
        <span className="tabular-nums text-stone-500">{Math.round(pct)}%</span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div className={`h-full rounded-full ${warna}`} style={{ width: `${(clamp / 200) * 100}%` }} />
      </div>
    </div>
  );
}

/** FR-03: narasi AI + diagram pemenuhan nutrisi di bawah hasil generate. */
export function PlanExplanation({ plan }: { readonly plan: MealPlan }) {
  const [teks, setTeks] = useState<string | null>(null);
  const [sumber, setSumber] = useState<Sumber | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const mutasi = useMutation({
    mutationFn: async () => {
      const body = {
        n_waktu_makan: plan.meals.length,
        energi_pct: rataEnergi(plan),
        protein_pct: rataProtein(plan),
        total_biaya: plan.totalDailyCost,
        anggaran: plan.dailyBudget,
        daftar_menu: plan.meals.map(
          (meal) => `${meal.label}: ${meal.items.map((item) => item.name).join(", ")}`,
        ),
      };
      const response = await fetch("/api/ai/explain-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const pesan =
          typeof data === "object" && data !== null && "message" in data
            ? String((data as { message: unknown }).message)
            : "Narasi gagal dimuat.";
        throw new Error(pesan);
      }
      return ResponseSchema.parse(data);
    },
    onSuccess: (data) => {
      setTeks(data.explanation);
      setSumber(data.source);
      setModel(data.model);
    },
  });

  // Narasi otomatis dipanggil sekali setiap paket baru muncul.
  useEffect(() => {
    if (plan.status === "ok") mutasi.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.totalDailyCost, plan.meals.length]);

  const energiRata = rataEnergi(plan);
  const proteinRata = rataProtein(plan);

  return (
    <div className="glass rounded-2xl p-5">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-stone-800 dark:text-stone-100">
        <Sparkles className="size-4 text-brand-600" aria-hidden="true" /> Penjelasan Paket Makan
      </p>
      {mutasi.isPending ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Menyusun penjelasan&hellip;
        </p>
      ) : mutasi.isError ? (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">
          {mutasi.error instanceof Error ? mutasi.error.message : "Narasi gagal dimuat."}
        </p>
      ) : teks ? (
        <div>
          <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-200">{teks}</p>
          {sumber ? (
            <p className="mt-2 text-[11px] text-stone-400">
              {LABEL_SUMBER[sumber]}
              {model && model !== "cache" && model !== "fallback" ? ` · ${model}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 border-t border-stone-200 pt-4 dark:border-stone-800">
        <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
          Pemenuhan nutrisi harian
        </p>
        <div className="mt-3 space-y-3">
          <Bar label="Energi (rata per waktu makan)" pct={energiRata} />
          <Bar label="Protein (rata per waktu makan)" pct={proteinRata} />
          {plan.meals.map((meal) => (
            <div key={meal.label} className="rounded-lg bg-stone-50 p-3 dark:bg-stone-900/50">
              <p className="mb-2 text-xs font-semibold text-stone-700 dark:text-stone-200">
                {meal.label}
              </p>
              <div className="space-y-2">
                <Bar label="Energi" pct={meal.summary.energyPct} />
                <Bar label="Protein" pct={meal.summary.proteinPct} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-stone-400">
          Hijau = 80&ndash;160% target (ideal), kuning/merah = di luar rentang.
        </p>
      </div>
    </div>
  );
}

function rataEnergi(plan: MealPlan): number {
  const meals = plan.meals;
  if (!meals.length) return 0;
  return meals.reduce((acc, m) => acc + m.summary.energyPct, 0) / meals.length;
}
function rataProtein(plan: MealPlan): number {
  const meals = plan.meals;
  if (!meals.length) return 0;
  return meals.reduce((acc, m) => acc + m.summary.proteinPct, 0) / meals.length;
}

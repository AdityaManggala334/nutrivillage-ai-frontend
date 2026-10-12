"use client";

import { AlertTriangle, Info, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/empty-state";
import { SppgContextSelector } from "@/components/sppg/sppg-context-selector";
import { Badge, ButtonLink, GlassCard } from "@/components/ui";
import { useRecipes } from "@/hooks/use-recipes";
import { useBudgetPolicies } from "@/hooks/use-schools";
import { formatRupiah } from "@/lib/utils";
import { planKeyOf, totalPorsi, useSppgStore } from "@/stores/sppg-store";

interface MergedItem {
  readonly name: string;
  readonly unit: string;
  quantity: number;
  price: number;
}

/** Shopping List Petugas SPPG — dihitung dari Meal Planner (yield-aware). */
export function SppgShoppingList() {
  const recipesQuery = useRecipes();
  const budgetQuery = useBudgetPolicies();
  const rows = useSppgStore((state) => state.rows);
  const label = useSppgStore((state) => state.label);
  const contextBudget = useSppgStore((state) => state.budgetPerPortion);
  const plans = useSppgStore((state) => state.plans);

  const studentCount = totalPorsi(rows);
  const planKey = planKeyOf(rows, label);
  const schedule = useMemo(() => plans[planKey] ?? {}, [plans, planKey]);
  const mealCount = Object.keys(schedule).length;

  const recipeById = useMemo(
    () => new Map((recipesQuery.data ?? []).map((recipe) => [recipe.id, recipe])),
    [recipesQuery.data],
  );

  const { items, total } = useMemo(() => {
    const map = new Map<string, MergedItem>();
    if (studentCount <= 0) return { items: [], total: 0 };
    for (const recipeId of Object.values(schedule)) {
      const recipe = recipeById.get(recipeId);
      if (!recipe) continue;
      const factor = studentCount / recipe.servings;
      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient.name.toLowerCase()}::${ingredient.unit}`;
        const current = map.get(key) ?? {
          name: ingredient.name,
          unit: ingredient.unit,
          quantity: 0,
          price: 0,
        };
        current.quantity += ingredient.quantity * factor;
        current.price += ingredient.estimatedPrice * factor;
        map.set(key, current);
      }
    }
    const list = [...map.values()].sort((a, b) => b.price - a.price);
    return { items: list, total: list.reduce((acc, item) => acc + item.price, 0) };
  }, [schedule, recipeById, studentCount]);

  const perPortionAvg = mealCount > 0 ? total / (studentCount * mealCount) : 0;
  const globalPolicy = (budgetQuery.data ?? []).find((policy) => policy.scope === "global");
  const limit =
    contextBudget ?? (globalPolicy?.verified ? globalPolicy.amountPerPortion : null);
  const exceeds = limit !== null && limit !== undefined && perPortionAvg > limit;

  return (
    <div className="space-y-6">
      <GlassCard className="p-5">
        <h2 className="mb-4 text-sm font-bold text-stone-800">Konteks Belanja</h2>
        <SppgContextSelector />
      </GlassCard>

      {rows.length === 0 ? (
        <EmptyState
          title="Belum ada konteks rencana"
          description="Pilih sekolah & kelompok di atas atau susun porsi lewat Explore SPPG, lalu tambahkan menu di Meal Planner."
        />
      ) : mealCount === 0 ? (
        <EmptyState
          title="Belum ada rencana menu"
          description="Susun menu terlebih dahulu di Meal Planner. Daftar belanja dihitung dari rencana yang Anda buat."
          action={<ButtonLink href="/sppg/meal-planner">Buka Meal Planner</ButtonLink>}
        />
      ) : (
        <>
          <GlassCard className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs text-stone-400">Konteks</p>
                <p className="mt-0.5 font-semibold text-stone-900">{label}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {studentCount} siswa ({rows.length} jenjang) • {mealCount} menu terjadwal
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-400">Total estimasi bahan pangan</p>
                <p className="text-2xl font-black text-stone-900 tabular-nums">
                  {formatRupiah(Math.round(total))}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  ≈ {formatRupiah(Math.round(perPortionAvg))} /porsi
                </p>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-xl bg-white/50 px-3 py-2.5 text-xs text-stone-600 dark:bg-stone-900/40">
              <Info className="mt-0.5 size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
              Perhitungan memperhitungkan yield resep (kebutuhan per porsi × jumlah porsi penerima)
              dan hanya mencakup biaya bahan pangan — bukan biaya operasional SPPG.
            </p>
          </GlassCard>

          {exceeds ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
              <p className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-200">
                <AlertTriangle className="size-4" aria-hidden="true" />
                Estimasi biaya per porsi melebihi batas
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                Rata-rata {formatRupiah(Math.round(perPortionAvg))}/porsi &gt; batas{" "}
                {formatRupiah(limit ?? 0)}/porsi. Tinjau kembali menu atau jumlah porsi. Sistem tidak
                mengubah harga, bahan, atau menu secara otomatis.
              </p>
              <div className="mt-3">
                <ButtonLink intent="danger" size="sm" href="/sppg/meal-planner">
                  Tinjau Menu
                </ButtonLink>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <Badge tone={limit ? "brand" : "neutral"}>
                {limit ? `Batas ${formatRupiah(limit)}/porsi` : "Batas anggaran belum dikonfigurasi"}
              </Badge>
              {!limit ? (
                <span>Peringatan anggaran aktif setelah batas per porsi diisi.</span>
              ) : null}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl glass">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Kebutuhan bahan pangan</caption>
              <thead className="bg-white/50 text-[11px] tracking-wider text-stone-500 uppercase dark:bg-stone-900/40">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Bahan</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Kebutuhan</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">
                    Harga satuan (±)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Estimasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 dark:divide-white/10">
                {items.map((item) => (
                  <tr key={`${item.name}-${item.unit}`}>
                    <td className="px-4 py-3 font-medium text-stone-800">{item.name}</td>
                    <td className="px-4 py-3 tabular-nums text-stone-700">
                      {item.quantity.toLocaleString("id-ID", { maximumFractionDigits: 1 })}{" "}
                      {item.unit}
                    </td>
                    <td className="hidden px-4 py-3 tabular-nums text-stone-500 sm:table-cell">
                      {item.quantity > 0
                        ? formatRupiah(Math.round(item.price / item.quantity))
                        : "—"}
                      /{item.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-stone-800">
                      {formatRupiah(Math.round(item.price))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/50 dark:border-white/10">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-stone-700">
                    Total estimasi bahan pangan
                  </td>
                  <td className="px-4 py-3 text-right text-base font-black text-stone-900 tabular-nums">
                    {formatRupiah(Math.round(total))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="flex items-center gap-2 text-xs text-stone-400">
            <ShoppingCart className="size-3.5" aria-hidden="true" />
            Harga mengacu pada data yang sumbernya tercatat; nilai di sini adalah estimasi.{" "}
            <Link href="/sppg/explore" className="font-semibold text-brand-700">
              Cari menu lain
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { NutritionInfo } from "@/schemas/domain";

interface Macro {
  readonly key: keyof NutritionInfo;
  readonly label: string;
  readonly unit: string;
  readonly max: number;
  readonly color: string;
}

const MACROS: readonly Macro[] = [
  { key: "calories", label: "Kalori", unit: "kkal", max: 700, color: "bg-harvest-400" },
  { key: "protein", label: "Protein", unit: "g", max: 40, color: "bg-brand-500" },
  { key: "carbohydrates", label: "Karbohidrat", unit: "g", max: 80, color: "bg-sky-500" },
  { key: "fat", label: "Lemak", unit: "g", max: 40, color: "bg-rose-400" },
  { key: "fiber", label: "Serat", unit: "g", max: 12, color: "bg-lime-500" },
];

export interface NutritionFactsProps {
  readonly nutrition: NutritionInfo;
  readonly servings: number;
}

/** FR-11: informasi gizi detail. RSC presentational. */
export function NutritionFacts({ nutrition, servings }: NutritionFactsProps) {
  return (
    <section aria-labelledby="gizi-heading" className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 id="gizi-heading" className="text-lg font-semibold text-stone-900 dark:text-stone-50">
          Informasi Gizi
        </h2>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          per {servings} porsi keluarga
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {MACROS.map((macro, index) => {
          const value = nutrition[macro.key];
          const percent = Math.min(100, Math.round((value / macro.max) * 100));
          const isLast = index === MACROS.length - 1;
          return (
            <div
              key={macro.key}
              className={cn(
                "rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900",
                isLast && "col-span-2 sm:col-span-1",
              )}
            >
              <p className="text-xs text-stone-500 dark:text-stone-400">{macro.label}</p>
              <p className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {value}
                <span className="ml-1 text-xs font-medium text-stone-400">{macro.unit}</span>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div
                  className={cn("h-full rounded-full", macro.color)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

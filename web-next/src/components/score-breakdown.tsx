import type { RecommendationScores } from "@/schemas/domain";

const DIMENSIONS: ReadonlyArray<{ key: keyof RecommendationScores; label: string; weight: string }> = [
  { key: "nutrition", label: "Nutrisi", weight: "40%" },
  { key: "budget", label: "Anggaran", weight: "30%" },
  { key: "local", label: "Pangan lokal", weight: "15%" },
  { key: "season", label: "Musim", weight: "15%" },
];

export interface ScoreBreakdownProps {
  readonly scores: RecommendationScores;
}

/** FR-09/FR-10: transparansi skor rekomendasi sesuai bobot SKPL. */
export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  return (
    <section aria-labelledby="skor-heading" className="space-y-3">
      <h2 id="skor-heading" className="text-lg font-semibold text-stone-900 dark:text-stone-50">
        Skor Rekomendasi
      </h2>
      <ul className="space-y-2">
        {DIMENSIONS.map((dimension) => {
          const value = scores[dimension.key];
          return (
            <li key={dimension.key} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-stone-600 dark:text-stone-300">
                {dimension.label}
                <span className="ml-1 text-xs text-stone-400">({dimension.weight})</span>
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <span
                  className="block h-full rounded-full bg-brand-500"
                  style={{ width: `${value}%` }}
                />
              </span>
              <span className="w-8 text-right font-semibold text-stone-800 dark:text-stone-100">
                {value}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

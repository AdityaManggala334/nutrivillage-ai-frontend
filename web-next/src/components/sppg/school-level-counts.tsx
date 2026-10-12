"use client";

import { Input, Label } from "@/components/ui";
import {
  BENEFICIARY_LEVEL_LABELS,
  CANONICAL_LEVELS,
  totalFromCounts,
  type LevelCounts,
} from "@/schemas/school";

export interface SchoolLevelCountsProps {
  readonly counts: LevelCounts;
  readonly onChange: (next: LevelCounts) => void;
}

/**
 * Input jumlah siswa per jenjang (SD 1–3, SD 4–6, SMP, SMA). Dipakai pada
 * form sekolah (FR-11) dan onboarding petugas SPPG.
 */
export function SchoolLevelCounts({ counts, onChange }: SchoolLevelCountsProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-stone-700 dark:text-stone-200">
        Jumlah siswa per jenjang
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {CANONICAL_LEVELS.map((level) => (
          <div key={level} className="space-y-1.5">
            <Label htmlFor={`count-${level}`}>{BENEFICIARY_LEVEL_LABELS[level]}</Label>
            <Input
              id={`count-${level}`}
              type="number"
              min={0}
              max={100000}
              inputMode="numeric"
              value={counts[level]}
              placeholder="0"
              onChange={(event) => onChange({ ...counts, [level]: event.target.value })}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400">
        Kosongkan (atau isi 0) bila jenjang tidak ada. Total tersimpan:{" "}
        <strong className="text-stone-700 dark:text-stone-200">
          {totalFromCounts(counts)} siswa
        </strong>
        .
      </p>
    </fieldset>
  );
}

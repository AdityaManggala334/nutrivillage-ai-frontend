"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button, FieldError, Input, Label, Select } from "@/components/ui";
import { AGE_GROUP_LABELS, AGE_GROUP_ORDER, GOAL_DESCRIPTIONS, GOAL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ALLERGY_OPTIONS,
  ExploreFormSchema,
  PREFERENCE_OPTIONS,
  totalMembers,
  type AgeCounts,
  type ExploreFormData,
} from "@/schemas/explore";
import type { AgeGroup, RecommendationGoal } from "@/schemas/domain";

export interface ExploreFormProps {
  readonly onGenerate: (data: ExploreFormData) => void;
  readonly isLoading: boolean;
}

type FormErrors = Record<string, string>;

const mapIssues = (issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>): FormErrors => {
  const errors: FormErrors = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
};

const toggleItem = (list: readonly string[], value: string): string[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

/** FR-08: form input kebutuhan rekomendasi dengan validasi Zod sisi klien. */
export function ExploreForm({ onGenerate, isLoading }: ExploreFormProps) {
  const [budgetInput, setBudgetInput] = useState("50000");
  const [days, setDays] = useState(3);
  const [goal, setGoal] = useState<RecommendationGoal>("seimbang");
  const [members, setMembers] = useState<AgeCounts>({
    balita: 0,
    anak: 1,
    dewasa: 2,
    lansia: 0,
  });
  const [preferences, setPreferences] = useState<string[]>(["Sayur"]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [location, setLocation] = useState("Kabupaten Madiun");
  const [errors, setErrors] = useState<FormErrors>({});

  const memberTotal = totalMembers(members);

  const updateMember = (group: AgeGroup, delta: number) => {
    setMembers((current) => {
      const next = Math.max(0, Math.min(20, current[group] + delta));
      return { ...current, [group]: next };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const candidate = {
      dailyBudget: budgetInput,
      days,
      goal,
      members,
      preferences,
      allergies,
      location,
    };

    const result = ExploreFormSchema.safeParse(candidate);
    if (!result.success) {
      setErrors(mapIssues(result.error.issues));
      return;
    }

    setErrors({});
    onGenerate(result.data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Form parameter rekomendasi menu"
      className="space-y-6"
      noValidate
    >
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budget" className="block min-h-10">
            Anggaran harian keluarga (Rp)
          </Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            inputMode="numeric"
            min={1000}
            step={1000}
            value={budgetInput}
            invalid={Boolean(errors.dailyBudget)}
            aria-describedby={errors.dailyBudget ? "budget-error" : "budget-hint"}
            onChange={(event) => setBudgetInput(event.target.value)}
          />
          <p id="budget-hint" className="text-xs text-stone-500 dark:text-stone-400">
            Anggaran untuk seluruh anggota keluarga dalam sehari.
          </p>
          <FieldError id="budget-error">{errors.dailyBudget}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="days" className="block min-h-10">
            Jumlah hari rencana
          </Label>
          <Select
            id="days"
            name="days"
            value={days}
            invalid={Boolean(errors.days)}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((option) => (
              <option key={option} value={option}>
                {option} hari
              </option>
            ))}
          </Select>
          <FieldError>{errors.days}</FieldError>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goal" className="block min-h-10">
            Tujuan / kebutuhan gizi
          </Label>
          <Select
            id="goal"
            name="goal"
            value={goal}
            onChange={(event) => setGoal(event.target.value as RecommendationGoal)}
          >
            {Object.entries(GOAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-stone-500 dark:text-stone-400">{GOAL_DESCRIPTIONS[goal]}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location" className="block min-h-10">
            Lokasi / wilayah
          </Label>
          <Input
            id="location"
            name="location"
            value={location}
            invalid={Boolean(errors.location)}
            onChange={(event) => setLocation(event.target.value)}
          />
          <FieldError>{errors.location}</FieldError>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-stone-700 dark:text-stone-200">
          Jumlah anggota keluarga ({memberTotal} orang)
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {AGE_GROUP_ORDER.map((group) => (
            <div
              key={group}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-3 py-2 dark:border-stone-800 dark:bg-stone-900"
            >
              <span className="text-sm text-stone-700 dark:text-stone-200">
                {AGE_GROUP_LABELS[group]}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  intent="outline"
                  size="icon"
                  className="size-8"
                  aria-label={`Kurangi anggota ${AGE_GROUP_LABELS[group]}`}
                  onClick={() => updateMember(group, -1)}
                >
                  −
                </Button>
                <span
                  aria-live="polite"
                  className="w-6 text-center text-sm font-semibold text-stone-900 dark:text-stone-50"
                >
                  {members[group]}
                </span>
                <Button
                  type="button"
                  intent="outline"
                  size="icon"
                  className="size-8"
                  aria-label={`Tambah anggota ${AGE_GROUP_LABELS[group]}`}
                  onClick={() => updateMember(group, 1)}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
        <FieldError>{errors.members}</FieldError>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Preferensi makanan
          </legend>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_OPTIONS.map((option) => {
              const active = preferences.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPreferences((current) => toggleItem(current, option))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Alergi / pantangan
          </legend>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map((option) => {
              const active = allergies.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setAllergies((current) => toggleItem(current, option))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                      : "border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <Button type="submit" size="lg" loading={isLoading} fullWidth>
        <Sparkles className="size-4" aria-hidden="true" />
        Generate Rekomendasi
      </Button>
      <p className="text-center text-xs text-stone-500 dark:text-stone-400">
        Maksimal 5 kali generate per jam per akun.
      </p>
    </form>
  );
}

"use client";

import { Calculator, Leaf, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/error-state";
import { Reveal } from "@/components/motion/reveal";
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FieldError,
  GlassCard,
  Input,
  Label,
  Select,
  Skeleton,
} from "@/components/ui";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useSchools } from "@/hooks/use-schools";
import {
  DAYS,
  DAY_LABELS,
  GOAL_DESCRIPTIONS,
  GOAL_LABELS,
  MEAL_SLOTS,
  MEAL_SLOT_ICONS,
  MEAL_SLOT_LABELS,
} from "@/lib/constants";
import { cn, formatRupiah } from "@/lib/utils";
import type { DayOfWeek, MealSlot } from "@/schemas/domain";
import { ALLERGY_OPTIONS, type ExploreFormData } from "@/schemas/explore";
import {
  BENEFICIARY_LEVEL_LABELS,
  BENEFICIARY_LEVEL_ORDER,
  type BeneficiaryLevel,
} from "@/schemas/school";
import { useSppgStore, type PorsiRow } from "@/stores/sppg-store";

interface RowInput {
  readonly id: number;
  level: BeneficiaryLevel;
  count: string;
}

interface AddTarget {
  readonly recipeId: string;
  readonly recipeName: string;
}

let rowSeq = 0;
const newRow = (level: BeneficiaryLevel = "sd_1_3"): RowInput => ({
  id: (rowSeq += 1),
  level,
  count: "",
});

/** Explore Menu SPPG — input manual atau template dari Data Sekolah. */
export function SppgExplore() {
  const schoolsQuery = useSchools();
  const setContext = useSppgStore((state) => state.setContext);
  const assignMeal = useSppgStore((state) => state.assignMeal);

  const [rows, setRows] = useState<RowInput[]>([]);
  const [templateSchoolId, setTemplateSchoolId] = useState("");
  const [label, setLabel] = useState("Input manual");
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState<keyof typeof GOAL_LABELS>("seimbang");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [location, setLocation] = useState("Kabupaten Madiun");
  const [payload, setPayload] = useState<ExploreFormData | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [addTarget, setAddTarget] = useState<AddTarget | null>(null);
  const [addDay, setAddDay] = useState<DayOfWeek>("senin");
  const [addSlot, setAddSlot] = useState<MealSlot>("makan-siang");
  const [assignedMsg, setAssignedMsg] = useState<string | null>(null);

  const recommendations = useRecommendations(payload);

  const numericRows: PorsiRow[] = useMemo(
    () =>
      rows
        .map((row) => ({ level: row.level, studentCount: Math.floor(Number(row.count) || 0) }))
        .filter((row) => row.studentCount > 0),
    [rows],
  );
  const total = numericRows.reduce((acc, row) => acc + row.studentCount, 0);
  const budgetPerPortion = budget.trim() === "" ? null : Number(budget);

  const addRow = () => setRows((current) => [...current, newRow()]);
  const removeRow = (id: number) => setRows((current) => current.filter((row) => row.id !== id));
  const updateRow = (id: number, patch: Partial<RowInput>) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const toggleAllergy = (value: string) =>
    setAllergies((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );

  const loadTemplate = () => {
    const school = (schoolsQuery.data ?? []).find((item) => String(item.id) === templateSchoolId);
    if (!school) {
      setFormError("Pilih sekolah terlebih dahulu untuk memuat template.");
      return;
    }
    setRows(
      school.groups.map((group) => ({
        id: (rowSeq += 1),
        level: group.level,
        count: String(group.studentCount),
      })),
    );
    setLabel(school.name);
    setLocation(school.region);
    setFormError(null);
  };

  const handleGenerate = () => {
    if (numericRows.length === 0) {
      setFormError("Isi minimal satu jenjang dengan jumlah siswa, atau muat template dari Data Sekolah.");
      return;
    }
    if (!budgetPerPortion || Number.isNaN(budgetPerPortion) || budgetPerPortion <= 0) {
      setFormError("Masukkan anggaran bahan pangan per porsi. Gunakan batas yang telah diverifikasi.");
      return;
    }
    setFormError(null);
    setContext({ rows: numericRows, label, budgetPerPortion });
    setPayload({
      dailyBudget: budgetPerPortion * total,
      days: 7,
      goal,
      members: { balita: 0, anak: 1, dewasa: 0, lansia: 0 },
      preferences: [],
      allergies,
      location,
    });
  };

  const confirmAdd = () => {
    if (!addTarget) return;
    setContext({ rows: numericRows, label, budgetPerPortion });
    assignMeal(addDay, addSlot, addTarget.recipeId);
    setAssignedMsg(
      `${addTarget.recipeName} ditambahkan ke ${DAY_LABELS[addDay]} · ${MEAL_SLOT_LABELS[addSlot]}.`,
    );
    setAddTarget(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <GlassCard className="h-fit p-5">
        <div className="space-y-5">
          {/* Template dari Data Sekolah */}
          <div className="space-y-2">
            <Label htmlFor="template-school">Template dari Data Sekolah</Label>
            <div className="flex gap-2">
              <Select
                id="template-school"
                value={templateSchoolId}
                onChange={(event) => setTemplateSchoolId(event.target.value)}
              >
                <option value="">— Pilih sekolah —</option>
                {(schoolsQuery.data ?? []).map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </Select>
              <Button type="button" intent="secondary" onClick={loadTemplate}>
                <Wand2 className="size-4" aria-hidden="true" /> Muat
              </Button>
            </div>
            <p className="text-xs text-stone-500">
              Atau isi manual di bawah. Template mengisi jumlah siswa per jenjang dari sekolah
              tersimpan.
            </p>
          </div>

          {/* Baris jenjang */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                Jenjang & jumlah siswa
              </span>
              <span className="text-xs text-stone-400">{total} siswa</span>
            </div>

            {rows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-stone-300 px-3 py-4 text-center text-xs text-stone-400 dark:border-stone-700">
                Belum ada jenjang. Tambah baris atau muat template.
              </p>
            ) : (
              <ul className="space-y-2">
                {rows.map((row) => (
                  <li key={row.id} className="flex items-center gap-2">
                    <Select
                      aria-label="Jenjang"
                      value={row.level}
                      className="flex-1"
                      onChange={(event) =>
                        updateRow(row.id, { level: event.target.value as BeneficiaryLevel })
                      }
                    >
                      {BENEFICIARY_LEVEL_ORDER.map((level) => (
                        <option key={level} value={level}>
                          {BENEFICIARY_LEVEL_LABELS[level]}
                        </option>
                      ))}
                    </Select>
                    <Input
                      aria-label="Jumlah siswa"
                      type="number"
                      min={0}
                      className="w-24"
                      placeholder="0"
                      value={row.count}
                      onChange={(event) => updateRow(row.id, { count: event.target.value })}
                    />
                    <Button
                      type="button"
                      intent="ghost"
                      size="icon"
                      className="size-9 text-red-500"
                      aria-label="Hapus baris"
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <Button type="button" intent="outline" size="sm" onClick={addRow}>
              <Plus className="size-4" aria-hidden="true" /> Tambah jenjang
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sppg-budget">Anggaran bahan pangan per porsi (Rp)</Label>
            <Input
              id="sppg-budget"
              type="number"
              min={0}
              step={500}
              value={budget}
              placeholder="Belum dikonfigurasi — isi manual"
              onChange={(event) => setBudget(event.target.value)}
            />
            <p className="text-xs text-stone-500">
              Bila batas resmi belum diverifikasi, isi manual untuk menghitung. Sistem tidak
              mengarang angka.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sppg-goal">Tujuan / kebutuhan gizi</Label>
            <Select id="sppg-goal" value={goal} onChange={(event) => setGoal(event.target.value as keyof typeof GOAL_LABELS)}>
              {Object.entries(GOAL_LABELS).map(([value, optionLabel]) => (
                <option key={value} value={value}>
                  {optionLabel}
                </option>
              ))}
            </Select>
            <p className="text-xs text-stone-500">{GOAL_DESCRIPTIONS[goal]}</p>
          </div>

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
                    onClick={() => toggleAllergy(option)}
                    className={cn(
                      "press rounded-full border px-3 py-1.5 text-xs font-medium transition",
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

          <div className="space-y-1.5">
            <Label htmlFor="sppg-location">Wilayah</Label>
            <Input
              id="sppg-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <div className="rounded-xl bg-brand-50/70 p-3 text-xs text-brand-900 dark:bg-brand-950/40 dark:text-brand-100">
            <p className="flex items-center gap-1.5 font-semibold">
              <Calculator className="size-3.5" aria-hidden="true" /> Ringkasan porsi
            </p>
            <p className="mt-1">
              {total} siswa × {formatRupiah(budgetPerPortion ?? 0)} ={" "}
              <strong>{formatRupiah((budgetPerPortion ?? 0) * total)}</strong> anggaran total per hari.
            </p>
          </div>

          {formError ? <FieldError>{formError}</FieldError> : null}

          <Button fullWidth size="lg" loading={recommendations.isFetching} onClick={handleGenerate}>
            <Sparkles className="size-4" aria-hidden="true" /> Hitung Rekomendasi
          </Button>
        </div>
      </GlassCard>

      <div className="min-w-0">
        {assignedMsg ? (
          <p className="mb-3 rounded-xl bg-brand-50 px-4 py-2.5 text-sm text-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
            {assignedMsg}
          </p>
        ) : null}

        {!payload ? (
          <GlassCard tone="subtle" className="p-8 text-center">
            <p className="text-sm font-semibold text-stone-800">Belum ada rekomendasi</p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-stone-500">
              Tambahkan jenjang & jumlah siswa (atau muat template dari Data Sekolah), tetapkan
              anggaran per porsi, lalu tekan Hitung Rekomendasi.
            </p>
          </GlassCard>
        ) : recommendations.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-52 w-full" />
            ))}
          </div>
        ) : recommendations.isError ? (
          <ErrorState
            title="Rekomendasi belum dapat dimuat"
            message={
              recommendations.error instanceof Error
                ? recommendations.error.message
                : "Terjadi kesalahan."
            }
            action={
              <Button intent="danger" onClick={() => void recommendations.refetch()}>
                Coba Lagi
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(recommendations.data ?? []).map((recommendation, index) => {
              const perPortion = recommendation.recipe.estimatedCost / recommendation.recipe.servings;
              const totalBatch = perPortion * total;
              const exceeds =
                budgetPerPortion !== null && perPortion > budgetPerPortion;
              return (
                <Reveal key={recommendation.id} delay={index * 70} className="h-full">
                  <GlassCard className="lift flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-stone-400">Peringkat #{recommendation.rank}</p>
                        <h3 className="mt-0.5 truncate text-base font-bold text-stone-900">
                          {recommendation.recipe.name}
                        </h3>
                      </div>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white tabular-nums">
                        {recommendation.scores.total}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="brand">{formatRupiah(Math.round(perPortion))}/porsi</Badge>
                      <Badge tone={exceeds ? "danger" : "neutral"}>
                        {formatRupiah(Math.round(totalBatch))} / {total} porsi
                      </Badge>
                      {recommendation.recipe.isLocal ? (
                        <Badge tone="harvest">
                          <Leaf className="size-3" aria-hidden="true" /> Lokal
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-stone-500">
                      {recommendation.explanation}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                      <Link
                        href={`/recipes/${recommendation.recipe.id}`}
                        className="text-xs font-semibold text-stone-600 hover:text-brand-700"
                      >
                        Detail resep
                      </Link>
                      <Button
                        size="sm"
                        intent="secondary"
                        onClick={() =>
                          setAddTarget({
                            recipeId: recommendation.recipe.id,
                            recipeName: recommendation.recipe.name,
                          })
                        }
                      >
                        <Plus className="size-3.5" aria-hidden="true" /> Rencanakan
                      </Button>
                    </div>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {addTarget ? (
        <Dialog open onOpenChange={(open) => (open ? undefined : setAddTarget(null))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambahkan ke Rencana</DialogTitle>
              <DialogDescription>{addTarget.recipeName}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-day">Hari</Label>
                <Select id="add-day" value={addDay} onChange={(event) => setAddDay(event.target.value as DayOfWeek)}>
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {DAY_LABELS[day]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-slot">Waktu makan</Label>
                <Select id="add-slot" value={addSlot} onChange={(event) => setAddSlot(event.target.value as MealSlot)}>
                  {MEAL_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {MEAL_SLOT_ICONS[slot]} {MEAL_SLOT_LABELS[slot]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button type="button" intent="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button onClick={confirmAdd}>Tambahkan</Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

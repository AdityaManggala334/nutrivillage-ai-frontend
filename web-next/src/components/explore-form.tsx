"use client";

import { Pencil, Sparkles, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button, Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, FieldError, Input, Label, Select } from "@/components/ui";
import { useProfile } from "@/hooks/use-profile";
import { AGE_GROUP_LABELS, GOAL_DESCRIPTIONS, GOAL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ALLERGY_OPTIONS,
  ExploreFormSchema,
  ExploreMemberSchema,
  PREFERENCE_OPTIONS,
  totalMembers,
  type ExploreFormData,
  type ExploreMember,
} from "@/schemas/explore";
import type { ActivityLevel, Gender } from "@/schemas/profile";

export interface ExploreFormProps {
  readonly onGenerate: (data: ExploreFormData) => void;
  readonly isLoading: boolean;
}

type FormErrors = Record<string, string>;

interface MemberDraft {
  name: string;
  age: string;
  gender: Gender;
  weightKg: string;
  heightCm: string;
  activityLevel: ActivityLevel;
  allergies: string[];
}

const emptyMember = (): MemberDraft => ({
  name: "",
  age: "",
  gender: "laki-laki",
  weightKg: "",
  heightCm: "",
  activityLevel: "sedang",
  allergies: [],
});

const toDraft = (member: ExploreMember): MemberDraft => ({
  name: member.name,
  age: String(member.age),
  gender: member.gender,
  weightKg: String(member.weightKg),
  heightCm: String(member.heightCm),
  activityLevel: member.activityLevel,
  allergies: member.allergies,
});

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

function MemberDialog({
  draft,
  onSave,
  onClose,
}: {
  readonly draft: MemberDraft;
  readonly onSave: (member: ExploreMember) => void;
  readonly onClose: () => void;
}) {
  const [form, setForm] = useState<MemberDraft>(draft);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const parsed = ExploreMemberSchema.safeParse({
      name: form.name,
      age: form.age,
      gender: form.gender,
      weightKg: form.weightKg,
      heightCm: form.heightCm,
      activityLevel: form.activityLevel,
      allergies: form.allergies,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data anggota belum valid.");
      return;
    }
    onSave(parsed.data);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Data Anggota</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Nama</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Umur (tahun)</Label>
            <Input type="number" min={1} max={120} value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Jenis kelamin</Label>
            <Select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}>
              <option value="laki-laki">Laki-laki</option>
              <option value="perempuan">Perempuan</option>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Berat badan (kg)</Label>
            <Input type="number" min={1} max={250} step={0.5} value={form.weightKg} onChange={(event) => setForm({ ...form, weightKg: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Tinggi badan (cm)</Label>
            <Input type="number" min={50} max={250} step={0.5} value={form.heightCm} onChange={(event) => setForm({ ...form, heightCm: event.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Aktivitas</Label>
            <Select value={form.activityLevel} onChange={(event) => setForm({ ...form, activityLevel: event.target.value as ActivityLevel })}>
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="tinggi">Tinggi</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs font-medium">Alergi / pantangan</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {ALLERGY_OPTIONS.map((option) => {
                const active = form.allergies.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setForm({ ...form, allergies: toggleItem(form.allergies, option) })}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs",
                      active
                        ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40"
                        : "border-stone-300 text-stone-600 dark:border-stone-700",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild><Button type="button" intent="ghost">Batal</Button></DialogClose>
          <Button type="button" onClick={submit}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** FR-08: parameter rekomendasi dengan data per anggota keluarga. */
export function ExploreForm({ onGenerate, isLoading }: ExploreFormProps) {
  const profileQuery = useProfile();
  const [budgetInput, setBudgetInput] = useState("50000");
  const [goal, setGoal] = useState<ExploreFormData["goal"]>("seimbang");
  const [members, setMembers] = useState<ExploreMember[]>([]);
  const [preferences, setPreferences] = useState<string[]>(["Sayur"]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [location, setLocation] = useState("Kabupaten Madiun");
  const [mealsPerDay, setMealsPerDay] = useState("3");
  const [includeSusu, setIncludeSusu] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [dialog, setDialog] = useState<{ index: number | null; draft: MemberDraft } | null>(null);

  const profile = profileQuery.data;
  const groups = members.reduce<Record<string, number>>((acc, member) => {
    const group =
      member.age <= 3 ? "balita" : member.age <= 12 ? "anak" : member.age <= 59 ? "dewasa" : "lansia";
    acc[group] = (acc[group] ?? 0) + 1;
    return acc;
  }, {});

  const pakaiKeluarga = () => {
    if (!profile) return;
    setMembers(
      profile.members.map((member) => ({
        name: member.name,
        age: member.age,
        gender: member.gender,
        weightKg: member.weightKg,
        heightCm: member.heightCm ?? 160,
        activityLevel: member.activityLevel,
        allergies: member.allergies,
      })),
    );
    setBudgetInput(String(profile.dailyBudget));
    setPreferences(profile.preferences);
    setAllergies(profile.avoidedIngredients);
    setLocation(profile.region);
    setMealsPerDay(String(profile.mealsPerDay));
    setIncludeSusu(profile.includeSusu);
    setErrors({});
  };

  const simpanAnggota = (member: ExploreMember) => {
    setMembers((current) => {
      if (dialog?.index === null || dialog?.index === undefined) return [...current, member];
      return current.map((row, index) => (index === dialog.index ? member : row));
    });
    setDialog(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const candidate = {
      dailyBudget: budgetInput,
      goal,
      members,
      preferences,
      allergies,
      location,
      mealsPerDay,
      includeSusu,
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
    <form onSubmit={handleSubmit} aria-label="Form parameter rekomendasi menu" className="space-y-6" noValidate>
      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-900 dark:bg-brand-950/30">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">Data anggota keluarga</p>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
              {members.length > 0
                ? `${members.length} orang · ${Object.entries(groups).map(([key, value]) => `${AGE_GROUP_LABELS[key as keyof typeof AGE_GROUP_LABELS]} ${value}`).join(" · ")}`
                : "Pilih template data keluarga dari onboarding atau isi manual."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={pakaiKeluarga} disabled={!profile || profileQuery.isPending}>
              <Sparkles className="size-4" /> Gunakan Data Keluarga
            </Button>
            <Button
              type="button"
              size="sm"
              intent="secondary"
              onClick={() => setDialog({ index: null, draft: emptyMember() })}
            >
              <UserPlus className="size-4" /> Atur Manual
            </Button>
          </div>
        </div>
        {!profile && !profileQuery.isPending ? (
          <p className="mt-2 text-xs text-stone-500">Belum ada profil keluarga. Isi onboarding atau atur manual.</p>
        ) : null}
        {members.length > 0 ? (
          <div className="mt-3 space-y-2">
            {members.map((member, index) => (
              <div key={`${member.name}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-stone-900/40">
                <div className="min-w-0">
                  <p className="font-medium text-stone-800 dark:text-stone-100">
                    {member.name} · {member.age} th · {member.gender === "laki-laki" ? "L" : "P"}
                  </p>
                  <p className="text-xs text-stone-500">
                    {member.weightKg} kg / {member.heightCm} cm · aktivitas {member.activityLevel}
                    {member.allergies.length > 0 ? ` · alergi: ${member.allergies.join(", ")}` : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button type="button" intent="ghost" size="sm" aria-label={`Ubah ${member.name}`} onClick={() => setDialog({ index, draft: toDraft(member) })}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    intent="ghost"
                    size="sm"
                    aria-label={`Hapus ${member.name}`}
                    onClick={() => setMembers((current) => current.filter((_, pos) => pos !== index))}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <FieldError>{errors.members}</FieldError>
      </div>

      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budget">Anggaran harian keluarga (Rp)</Label>
          <Input id="budget" type="number" min={1000} step={1000} value={budgetInput} invalid={Boolean(errors.dailyBudget)} onChange={(event) => setBudgetInput(event.target.value)} />
          <FieldError>{errors.dailyBudget}</FieldError>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goal">Tujuan / kebutuhan gizi</Label>
          <Select id="goal" value={goal} onChange={(event) => setGoal(event.target.value as ExploreFormData["goal"])}>
            {Object.entries(GOAL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <p className="text-xs text-stone-500">{GOAL_DESCRIPTIONS[goal]}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meals">Makan per hari</Label>
          <Input id="meals" type="number" min={1} max={5} value={mealsPerDay} onChange={(event) => setMealsPerDay(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Wilayah</Label>
          <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" className="size-4 accent-brand-600" checked={includeSusu} onChange={(event) => setIncludeSusu(event.target.checked)} />
          Sertakan susu
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Preferensi makanan</span>
        <div className="flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((option) => {
            const active = preferences.includes(option);
            return (
              <button key={option} type="button" aria-pressed={active} onClick={() => setPreferences(toggleItem(preferences, option))} className={cn("rounded-full border px-3 py-1.5 text-xs", active ? "border-brand-400 bg-brand-50 text-brand-800 dark:bg-brand-950/40" : "border-stone-300 text-stone-600 dark:border-stone-700")}>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">Alergi / pantangan keluarga</span>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((option) => {
            const active = allergies.includes(option);
            return (
              <button key={option} type="button" aria-pressed={active} onClick={() => setAllergies(toggleItem(allergies, option))} className={cn("rounded-full border px-3 py-1.5 text-xs", active ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40" : "border-stone-300 text-stone-600 dark:border-stone-700")}>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" size="lg" fullWidth loading={isLoading} disabled={members.length === 0}>
        <Sparkles className="size-4" /> Generate Rekomendasi
      </Button>
      <p className="text-center text-xs text-stone-500">{totalMembers(members)} anggota · {mealsPerDay} kali makan/hari</p>

      {dialog ? <MemberDialog draft={dialog.draft} onSave={simpanAnggota} onClose={() => setDialog(null)} /> : null}
    </form>
  );
}

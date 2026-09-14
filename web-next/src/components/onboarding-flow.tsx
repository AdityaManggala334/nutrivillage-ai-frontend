"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, FieldError, Input, Label, Select } from "@/components/ui";
import { useProfile, useSaveProfileMutation } from "@/hooks/use-profile";
import {
  familyProfileFormSchema,
  type ActivityLevel,
  type Gender,
} from "@/schemas/profile";

interface MemberInput {
  name: string;
  age: string;
  gender: Gender;
  weightKg: string;
  activityLevel: ActivityLevel;
  allergies: string;
}

const emptyMember = (): MemberInput => ({
  name: "",
  age: "",
  gender: "laki-laki",
  weightKg: "",
  activityLevel: "sedang",
  allergies: "",
});

const SLIDES = [
  {
    title: "Selamat datang di NutriVillage AI",
    description:
      "Aplikasi ini membantu keluarga menyusun menu harian bergizi dengan mempertimbangkan anggaran dan pangan lokal Madiun.",
  },
  {
    title: "Sesuaikan dengan budget keluarga",
    description:
      "Tentukan anggaran harian Anda. Menu yang melebihi budget otomatis tidak akan direkomendasikan.",
  },
  {
    title: "Manfaatkan pangan lokal & musiman",
    description:
      "Rekomendasi mengutamakan komoditas lokal yang sedang musim agar lebih hemat dan segar.",
  },
] as const;

const MAX_STEP = SLIDES.length;

type FormErrors = Record<string, string>;

const mapIssues = (issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>): FormErrors => {
  const errors: FormErrors = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
};

/** FR-04 (onboarding) & FR-05 (input data keluarga). */
export function OnboardingFlow() {
  const router = useRouter();
  const profileQuery = useProfile();
  const saveMutation = useSaveProfileMutation();

  const [step, setStep] = useState(0);
  const [dailyBudget, setDailyBudget] = useState("75000");
  const [region, setRegion] = useState("Kabupaten Madiun");
  const [preferences, setPreferences] = useState("sayur, ikan");
  const [avoidedIngredients, setAvoidedIngredients] = useState("");
  const [members, setMembers] = useState<MemberInput[]>([emptyMember()]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const isOnboarded = profileQuery.data?.onboarded === true;
  useEffect(() => {
    if (isOnboarded) {
      router.replace("/dashboard");
    }
  }, [isOnboarded, router]);

  const updateMember = (index: number, patch: Partial<MemberInput>) => {
    setMembers((current) =>
      current.map((member, position) => (position === index ? { ...member, ...patch } : member)),
    );
  };

  const addMember = () => setMembers((current) => [...current, emptyMember()]);

  const removeMember = (index: number) => {
    setMembers((current) =>
      current.length > 1 ? current.filter((_, position) => position !== index) : current,
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      dailyBudget,
      region,
      preferences,
      avoidedIngredients,
      members,
    };

    const parsed = familyProfileFormSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error.issues));
      setServerError("Periksa kembali isian yang ditandai merah.");
      return;
    }

    setErrors({});
    setServerError(null);
    saveMutation.mutate(payload, {
      onSuccess: () => {
        router.replace("/dashboard");
        router.refresh();
      },
      onError: (error) => setServerError(error.message),
    });
  };

  const isForm = step >= MAX_STEP;
  const slide = SLIDES[Math.min(step, SLIDES.length - 1)] ?? SLIDES[0];

  return (
    <section aria-labelledby="onboarding-title" className="app-container flex justify-center py-14">
      <div className="w-full max-w-2xl">
        <h1 id="onboarding-title" className="sr-only">
          Onboarding NutriVillage AI
        </h1>

        <ol className="flex items-center justify-center gap-2" aria-label="Progres onboarding">
          {[0, 1, 2, 3].map((index) => (
            <li
              key={index}
              className={`h-2 w-10 rounded-full ${index <= step ? "bg-brand-600" : "bg-stone-200"}`}
            />
          ))}
        </ol>

        <div className="rounded-card mt-6 bg-white p-6 shadow-card sm:p-8">
          {isForm ? (
            <form onSubmit={handleSubmit} noValidate>
              {serverError ? (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
                >
                  {serverError}
                </div>
              ) : null}

              <h2 className="text-xl">Ringkasan Keluarga</h2>
              <p className="mt-1 text-sm text-stone-600">
                Isi anggaran, wilayah, dan anggota keluarga agar rekomendasi lebih tepat.
              </p>

              <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
                <div className="mb-3 space-y-1.5">
                  <Label htmlFor="family-budget">Budget Harian (Rp)</Label>
                  <Input
                    id="family-budget"
                    type="number"
                    min={10000}
                    max={5000000}
                    step={5000}
                    placeholder="Contoh: 75000"
                    value={dailyBudget}
                    invalid={Boolean(errors.dailyBudget)}
                    onChange={(event) => setDailyBudget(event.target.value)}
                  />
                  <FieldError>{errors.dailyBudget}</FieldError>
                </div>
                <div className="mb-3 space-y-1.5">
                  <Label htmlFor="family-region">Wilayah</Label>
                  <Input
                    id="family-region"
                    value={region}
                    invalid={Boolean(errors.region)}
                    onChange={(event) => setRegion(event.target.value)}
                  />
                  <FieldError>{errors.region}</FieldError>
                </div>
                <div className="mb-3 space-y-1.5">
                  <Label htmlFor="family-preferences">Preferensi Makanan</Label>
                  <Input
                    id="family-preferences"
                    placeholder="Contoh: sayur, ikan"
                    value={preferences}
                    onChange={(event) => setPreferences(event.target.value)}
                  />
                  <p className="text-xs text-stone-500">Pisahkan dengan koma.</p>
                </div>
                <div className="mb-3 space-y-1.5">
                  <Label htmlFor="family-avoided">Bahan yang Dihindari</Label>
                  <Input
                    id="family-avoided"
                    placeholder="Contoh: kacang, seafood"
                    value={avoidedIngredients}
                    onChange={(event) => setAvoidedIngredients(event.target.value)}
                  />
                  <p className="text-xs text-stone-500">Pisahkan dengan koma.</p>
                </div>
              </div>

              <h3 className="mt-8 text-lg">Anggota Keluarga</h3>
              <p className="mt-1 text-sm text-stone-600">Tambahkan seluruh anggota keluarga.</p>

              <div className="mt-4 space-y-4">
                {members.map((member, index) => (
                  <fieldset
                    key={index}
                    className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/60"
                  >
                    <legend className="px-1 text-sm font-semibold text-stone-700">
                      Anggota Keluarga {index + 1}
                    </legend>
                    <div className="mt-2 grid gap-x-4 sm:grid-cols-2">
                      <div className="mb-3 space-y-1.5">
                        <Label htmlFor={`member-${index}-name`}>Nama</Label>
                        <Input
                          id={`member-${index}-name`}
                          placeholder="Nama anggota"
                          value={member.name}
                          invalid={Boolean(errors[`members.${index}.name`])}
                          onChange={(event) => updateMember(index, { name: event.target.value })}
                        />
                        <FieldError>{errors[`members.${index}.name`]}</FieldError>
                      </div>
                      <div className="mb-3 space-y-1.5">
                        <Label htmlFor={`member-${index}-age`}>Usia (tahun)</Label>
                        <Input
                          id={`member-${index}-age`}
                          type="number"
                          min={1}
                          max={120}
                          placeholder="Contoh: 30"
                          value={member.age}
                          invalid={Boolean(errors[`members.${index}.age`])}
                          onChange={(event) => updateMember(index, { age: event.target.value })}
                        />
                        <FieldError>{errors[`members.${index}.age`]}</FieldError>
                      </div>
                      <div className="mb-3 space-y-1.5">
                        <Label htmlFor={`member-${index}-gender`}>Jenis Kelamin</Label>
                        <Select
                          id={`member-${index}-gender`}
                          value={member.gender}
                          onChange={(event) =>
                            updateMember(index, { gender: event.target.value as Gender })
                          }
                        >
                          <option value="laki-laki">Laki-laki</option>
                          <option value="perempuan">Perempuan</option>
                        </Select>
                      </div>
                      <div className="mb-3 space-y-1.5">
                        <Label htmlFor={`member-${index}-weight`}>Berat Badan (kg)</Label>
                        <Input
                          id={`member-${index}-weight`}
                          type="number"
                          min={5}
                          max={250}
                          step={0.5}
                          placeholder="Contoh: 60"
                          value={member.weightKg}
                          invalid={Boolean(errors[`members.${index}.weightKg`])}
                          onChange={(event) => updateMember(index, { weightKg: event.target.value })}
                        />
                        <FieldError>{errors[`members.${index}.weightKg`]}</FieldError>
                      </div>
                      <div className="mb-3 space-y-1.5">
                        <Label htmlFor={`member-${index}-activity`}>Tingkat Aktivitas</Label>
                        <Select
                          id={`member-${index}-activity`}
                          value={member.activityLevel}
                          onChange={(event) =>
                            updateMember(index, {
                              activityLevel: event.target.value as ActivityLevel,
                            })
                          }
                        >
                          <option value="rendah">Rendah (jarang olahraga)</option>
                          <option value="sedang">Sedang (olahraga ringan)</option>
                          <option value="tinggi">Tinggi (aktif berolahraga)</option>
                        </Select>
                      </div>
                      <div className="mb-3 space-y-1.5">
                        <Label htmlFor={`member-${index}-allergies`}>Alergi / Pantangan</Label>
                        <Input
                          id={`member-${index}-allergies`}
                          placeholder="Contoh: kacang, seafood"
                          value={member.allergies}
                          onChange={(event) => updateMember(index, { allergies: event.target.value })}
                        />
                        <p className="text-xs text-stone-500">
                          Pisahkan dengan koma. Kosongkan bila tidak ada.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-right">
                      <Button
                        type="button"
                        intent="ghost"
                        size="sm"
                        onClick={() => removeMember(index)}
                        disabled={members.length === 1}
                      >
                        <Trash2 className="size-4" aria-hidden="true" /> Hapus Anggota
                      </Button>
                    </div>
                  </fieldset>
                ))}
              </div>

              <FieldError>{errors.members}</FieldError>

              <div className="mt-4">
                <Button type="button" intent="secondary" size="sm" onClick={addMember}>
                  <Plus className="size-4" aria-hidden="true" /> Tambah Anggota
                </Button>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
                <Button type="submit" size="lg" fullWidth loading={saveMutation.isPending}>
                  Simpan &amp; Lanjut
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="text-center">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700"
                  aria-hidden="true"
                >
                  {step + 1}
                </div>
                <h2 className="mt-6 text-2xl">{slide.title}</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">
                  {slide.description}
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between gap-3">
                <Button
                  intent="ghost"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  disabled={step === 0}
                >
                  Kembali
                </Button>
                <Button onClick={() => setStep((current) => current + 1)}>
                  {step >= SLIDES.length - 1 ? "Isi Data Keluarga" : "Lanjut"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

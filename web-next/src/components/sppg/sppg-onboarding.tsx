"use client";

import { Building2, CalendarCheck, Loader2, School, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SchoolLevelCounts } from "@/components/sppg/school-level-counts";
import { Button, FieldError, GlassCard, Input, Label } from "@/components/ui";
import { useCreateSchoolMutation, useSchools } from "@/hooks/use-schools";
import {
  SchoolFormSchema,
  emptyLevelCounts,
  groupsFromCounts,
  totalFromCounts,
  type LevelCounts,
} from "@/schemas/school";

const ONBOARDED_COOKIE = "nv_sppg_onboarded";

const SLIDES = [
  {
    icon: School,
    title: "Selamat datang, Petugas SPPG",
    description:
      "NutriVillage AI membantu Anda menyusun menu massal yang bergizi dan sesuai anggaran bahan pangan untuk sekolah binaan.",
  },
  {
    icon: Users,
    title: "Kelola sekolah & jumlah siswa",
    description:
      "Daftarkan sekolah yang Anda dampingi, lalu isi jumlah siswa per jenjang (SD 1–3, SD 4–6, SMP, SMA). Satu petugas boleh menangani beberapa sekolah.",
  },
  {
    icon: CalendarCheck,
    title: "Rencanakan menu & belanja",
    description:
      "Susun menu beberapa hari, lalu kebutuhan bahan pangan dan estimasi biaya dihitung otomatis dari menu dan jumlah porsi. Data sekolah juga bisa diubah nanti di Pengaturan.",
  },
] as const;

const setOnboardedCookie = () => {
  document.cookie = `${ONBOARDED_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
};

const hasOnboardedCookie = () =>
  typeof document !== "undefined" &&
  document.cookie.split(";").some((part) => part.trim().startsWith(`${ONBOARDED_COOKIE}=`));

interface FormErrors {
  [field: string]: string;
}

const mapIssues = (issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>): FormErrors => {
  const errors: FormErrors = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
};

/** Onboarding Petugas SPPG: pengenalan + input data sekolah & jumlah siswa. */
export function SppgOnboarding() {
  const router = useRouter();
  const schoolsQuery = useSchools();
  const createMutation = useCreateSchoolMutation();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [npsn, setNpsn] = useState("");
  const [region, setRegion] = useState("Kec. Madiun, Kab. Madiun");
  const [counts, setCounts] = useState<LevelCounts>(emptyLevelCounts);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Sudah onboarding / sudah punya sekolah → langsung ke dashboard SPPG.
  useEffect(() => {
    if (hasOnboardedCookie()) {
      router.replace("/sppg");
      return;
    }
    if (schoolsQuery.data && schoolsQuery.data.length > 0) {
      setOnboardedCookie();
      router.replace("/sppg");
    }
  }, [schoolsQuery.data, router]);

  const MAX_STEP = SLIDES.length;
  const isForm = step >= MAX_STEP;
  const slide = SLIDES[Math.min(step, SLIDES.length - 1)] ?? SLIDES[0];

  const skip = () => {
    setOnboardedCookie();
    router.replace("/sppg");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = SchoolFormSchema.safeParse({ name, npsn, region, isActive: true });
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error.issues));
      return;
    }
    setErrors({});
    setServerError(null);
    createMutation.mutate(
      {
        name: parsed.data.name,
        npsn: parsed.data.npsn || undefined,
        region: parsed.data.region,
        isActive: true,
        groups: groupsFromCounts(counts),
      },
      {
        onSuccess: () => {
          setOnboardedCookie();
          router.replace("/sppg");
          router.refresh();
        },
        onError: (error) =>
          setServerError(error instanceof Error ? error.message : "Gagal menyimpan."),
      },
    );
  };

  const Icon = slide.icon;

  return (
    <section aria-labelledby="sppg-onboarding-title" className="mx-auto w-full max-w-2xl py-10">
      <h1 id="sppg-onboarding-title" className="sr-only">
        Onboarding Petugas SPPG
      </h1>

      <ol className="flex items-center justify-center gap-2" aria-label="Progres onboarding">
        {[0, 1, 2, 3].map((index) => (
          <li
            key={index}
            className={`h-2 w-10 rounded-full transition-colors duration-500 ${
              index <= step ? "bg-brand-600" : "bg-stone-200 dark:bg-stone-700"
            }`}
          />
        ))}
      </ol>

      <GlassCard tone="strong" className="animate-scale-in mt-6 p-6 sm:p-8">
        {isForm ? (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {serverError ? (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
              >
                {serverError}
              </p>
            ) : null}

            <div>
              <h2 className="text-xl font-bold text-stone-900">Data Sekolah Pertama</h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                Daftarkan minimal satu sekolah binaan beserta jumlah siswa per jenjang. Anda dapat
                menambah sekolah lain kapan saja di halaman Data Sekolah.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="onb-school-name">Nama sekolah</Label>
              <Input
                id="onb-school-name"
                value={name}
                invalid={Boolean(errors.name)}
                placeholder="Contoh: SD Negeri 1 Madiun"
                onChange={(event) => setName(event.target.value)}
              />
              <FieldError>{errors.name}</FieldError>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="onb-npsn">NPSN (opsional)</Label>
                <Input
                  id="onb-npsn"
                  value={npsn}
                  invalid={Boolean(errors.npsn)}
                  placeholder="Contoh: 20512345"
                  onChange={(event) => setNpsn(event.target.value)}
                />
                <FieldError>{errors.npsn}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="onb-region">Wilayah</Label>
                <Input
                  id="onb-region"
                  value={region}
                  invalid={Boolean(errors.region)}
                  onChange={(event) => setRegion(event.target.value)}
                />
                <FieldError>{errors.region}</FieldError>
              </div>
            </div>

            <SchoolLevelCounts counts={counts} onChange={setCounts} />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" intent="ghost" onClick={skip} disabled={createMutation.isPending}>
                Lewati untuk sekarang
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Menyimpan…
                  </>
                ) : (
                  `Simpan & Mulai (${totalFromCounts(counts)} siswa)`
                )}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                aria-hidden="true"
              >
                <Icon className="size-8" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-stone-900">{slide.title}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-300">
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
                {step >= SLIDES.length - 1 ? "Isi Data Sekolah" : "Lanjut"}
              </Button>
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={skip}
                className="text-xs font-medium text-stone-400 hover:text-brand-700"
              >
                Lewati pengenalan
              </button>
            </div>
          </>
        )}
      </GlassCard>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
        <Building2 className="size-3.5" aria-hidden="true" />
        Data sekolah dapat diubah kapan saja di Pengaturan SPPG.
      </p>
    </section>
  );
}

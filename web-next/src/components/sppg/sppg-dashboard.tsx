"use client";

import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Compass,
  School as SchoolIcon,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Reveal } from "@/components/motion/reveal";
import { Badge, ButtonLink, GlassCard, Skeleton } from "@/components/ui";
import { useBudgetPolicies, useSchools } from "@/hooks/use-schools";
import { useSession } from "@/hooks/use-session";
import { BENEFICIARY_LEVEL_LABELS, totalStudents } from "@/schemas/school";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof SchoolIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <GlassCard className="lift p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-stone-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-stone-900 tabular-nums">{value}</p>
          {hint ? <p className="mt-1 text-[11px] text-stone-400">{hint}</p> : null}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </GlassCard>
  );
}

const QUICK_ACTIONS = [
  {
    title: "Kelola Data Sekolah",
    description: "Tambah sekolah & jumlah siswa per kelompok",
    href: "/sppg/schools",
    icon: SchoolIcon,
  },
  {
    title: "Explore Menu Massal",
    description: "Rekomendasi menu sesuai porsi & anggaran",
    href: "/sppg/explore",
    icon: Compass,
  },
  {
    title: "Meal Planner",
    description: "Susun rencana menu beberapa hari",
    href: "/sppg/meal-planner",
    icon: Calendar,
  },
  {
    title: "Daftar Belanja",
    description: "Kebutuhan bahan pangan dari rencana menu",
    href: "/sppg/shopping-list",
    icon: ShoppingCart,
  },
] as const;

/** Dashboard khusus Petugas SPPG (bukan dashboard masyarakat umum). */
export function SppgDashboard() {
  const { data: user } = useSession();
  const schoolsQuery = useSchools();
  const budgetQuery = useBudgetPolicies();

  const schools = schoolsQuery.data ?? [];
  const schoolCount = schools.length;
  const studentCount = schools.reduce((total, school) => total + totalStudents(school), 0);
  const groupCount = schools.reduce((total, school) => total + school.groups.length, 0);

  const policies = budgetQuery.data ?? [];
  const configured = policies.filter(
    (policy) => policy.verified && policy.amountPerPortion !== null,
  );

  const officer = user?.sppgOfficer ?? null;

  return (
    <div className="space-y-7">
      <Reveal className="animate-fade-up">
        <p className="text-xs font-medium text-brand-700">Dashboard Petugas SPPG</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
              Halo, {user?.name ?? "Petugas"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-500">
              {officer
                ? `${officer.sppgUnit} • ${officer.region}`
                : "Kelola sekolah, kelompok penerima, dan rencana menu massal."}
            </p>
          </div>
          <Badge tone="brand" className="px-2.5 py-1 text-xs">
            SPPG MBG
          </Badge>
        </div>
      </Reveal>

      {schoolsQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : schoolsQuery.isError ? (
        <ErrorState
          title="Gagal memuat data sekolah"
          message={
            schoolsQuery.error instanceof Error
              ? schoolsQuery.error.message
              : "Terjadi kesalahan."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={SchoolIcon} label="Sekolah dikelola" value={String(schoolCount)} />
          <StatCard
            icon={Users}
            label="Total siswa"
            value={studentCount.toLocaleString("id-ID")}
            hint={`${groupCount} kelompok penerima`}
          />
          <StatCard
            icon={AlertTriangle}
            label="Status anggaran"
            value={configured.length > 0 ? `${configured.length} terverifikasi` : "Belum diatur"}
            hint="Batas anggaran bahan pangan per porsi"
          />
        </div>
      )}

      {/* Budget policy notice */}
      {!budgetQuery.isPending && !budgetQuery.isError && configured.length === 0 ? (
        <GlassCard tone="subtle" className="border-harvest-300/60 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-harvest-600"
              aria-hidden="true"
            />
            <p className="text-sm text-harvest-900 dark:text-harvest-100">
              Batas anggaran bahan pangan per porsi <strong>belum dikonfigurasi</strong>. Sistem
              tidak menetapkan angka default. Perencanaan tetap bisa dibuat, dan peringatan
              anggaran akan muncul setelah admin memverifikasi kebijakan resmi.
            </p>
          </div>
        </GlassCard>
      ) : null}

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-stone-900">Akses Cepat</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map(({ title, description, href, icon: Icon }, index) => (
            <Reveal key={href} delay={index * 70} className="h-full">
              <Link
                href={href}
                className="glass-subtle lift flex h-full flex-col gap-3 rounded-2xl p-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="size-[19px]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-stone-800">{title}</span>
                  <span className="mt-0.5 block text-[11px] text-stone-400">{description}</span>
                </span>
                <ArrowRight className="mt-auto size-4 text-stone-300" aria-hidden="true" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* School list */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold text-stone-900">Sekolah yang Dikelola</h2>
          <Link href="/sppg/schools" className="text-xs font-semibold text-brand-700">
            Kelola
          </Link>
        </div>

        {schoolsQuery.isSuccess && schools.length === 0 ? (
          <EmptyState
            title="Belum ada sekolah"
            description="Tambahkan sekolah dan jumlah siswa per kelompok penerima manfaat untuk mulai menyusun rencana menu."
            action={<ButtonLink href="/sppg/schools">Tambah Sekolah</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {schools.map((school) => (
              <GlassCard key={school.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-900">{school.name}</p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {school.region}
                      {school.npsn ? ` • NPSN ${school.npsn}` : ""}
                    </p>
                  </div>
                  <Badge tone={school.isActive ? "brand" : "neutral"}>
                    {school.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {school.groups.length === 0 ? (
                    <span className="text-xs text-stone-400">Belum ada kelompok penerima.</span>
                  ) : (
                    school.groups.map((group) => (
                      <Badge key={group.id} tone="neutral">
                        {group.level === "lainnya" && group.label
                          ? group.label
                          : BENEFICIARY_LEVEL_LABELS[group.level]}
                        : {group.studentCount}
                      </Badge>
                    ))
                  )}
                </div>

                <p className="mt-3 text-xs text-stone-500">
                  Total <strong className="text-stone-700">{totalStudents(school)}</strong> siswa
                </p>
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

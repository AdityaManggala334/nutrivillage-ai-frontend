"use client";

import { AlertTriangle, ArrowRight, BadgeCheck, Building2, IdCard, MapPin } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Badge, ButtonLink, GlassCard } from "@/components/ui";
import { useSchools } from "@/hooks/use-schools";
import { useSession } from "@/hooks/use-session";
import { totalStudents } from "@/schemas/school";

/** Pengaturan Petugas SPPG — identitas unit & tautan pengelolaan sekolah. */
export function SppgSettings() {
  const { data: user } = useSession();
  const schoolsQuery = useSchools();
  const officer = user?.sppgOfficer ?? null;
  const schools = schoolsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h1 className="text-lg font-bold text-stone-900">Identitas Petugas SPPG</h1>
        <p className="mt-1 text-sm text-stone-500">
          Data ini berasal dari akun yang terverifikasi backend. Hubungi admin untuk mengubah data
          akun.
        </p>

        {officer ? (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white/50 p-4 dark:bg-stone-900/40">
              <dt className="flex items-center gap-1.5 text-xs text-stone-500">
                <Building2 className="size-3.5" aria-hidden="true" /> Unit SPPG
              </dt>
              <dd className="mt-1 font-semibold text-stone-800">{officer.sppgUnit}</dd>
            </div>
            <div className="rounded-xl bg-white/50 p-4 dark:bg-stone-900/40">
              <dt className="flex items-center gap-1.5 text-xs text-stone-500">
                <IdCard className="size-3.5" aria-hidden="true" /> NIP
              </dt>
              <dd className="mt-1 font-semibold text-stone-800">{officer.nip}</dd>
            </div>
            <div className="rounded-xl bg-white/50 p-4 dark:bg-stone-900/40">
              <dt className="flex items-center gap-1.5 text-xs text-stone-500">
                <MapPin className="size-3.5" aria-hidden="true" /> Wilayah
              </dt>
              <dd className="mt-1 font-semibold text-stone-800">{officer.region}</dd>
            </div>
            <div className="rounded-xl bg-white/50 p-4 dark:bg-stone-900/40">
              <dt className="flex items-center gap-1.5 text-xs text-stone-500">
                <BadgeCheck className="size-3.5" aria-hidden="true" /> Jabatan
              </dt>
              <dd className="mt-1 font-semibold text-stone-800">{officer.position ?? "—"}</dd>
            </div>
          </dl>
        ) : (
          <EmptyState
            title="Data petugas tidak tersedia"
            description="Sesi ini tidak memiliki profil petugas SPPG. Silakan masuk kembali dengan akun petugas."
          />
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">Sekolah yang Dikelola</h2>
            <p className="mt-1 text-sm text-stone-500">
              {schools.length} sekolah • {schools.reduce((t, s) => t + totalStudents(s), 0)} siswa.
              Perubahan jumlah siswa memengaruhi perhitungan rencana dan daftar belanja yang dibuat
              setelahnya.
            </p>
          </div>
          <ButtonLink href="/sppg/schools">
            Kelola Sekolah <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>

        {schools.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {schools.map((school) => (
              <li
                key={school.id}
                className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 dark:bg-stone-900/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-800">{school.name}</p>
                  <p className="truncate text-xs text-stone-400">{school.region}</p>
                </div>
                <Badge tone={school.isActive ? "brand" : "neutral"}>
                  {totalStudents(school)} siswa
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-stone-400">Belum ada sekolah terdaftar.</p>
        )}

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-harvest-50 px-3 py-2.5 text-xs text-harvest-900 dark:bg-harvest-900/30 dark:text-harvest-100">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Batas anggaran bahan pangan per kelompok belum tentu terverifikasi. Ubah hanya setelah
          ada ketentuan resmi. Riwayat rencana yang sudah selesai tidak diubah otomatis.
        </div>

        <p className="mt-4 text-xs text-stone-400">
          Ingin melihat katalog?{" "}
          <Link href="/katalog" className="font-semibold text-brand-700">
            Buka katalog resep
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}

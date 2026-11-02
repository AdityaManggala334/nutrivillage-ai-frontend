"use client";

import { School as SchoolIcon, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, GlassCard, Input } from "@/components/ui";
import { useSchools } from "@/hooks/use-schools";
import { BENEFICIARY_LEVEL_LABELS, totalStudents } from "@/schemas/school";

/** Referensi/verifikasi admin: daftar semua sekolah & petugas pengelolanya. */
export function AdminSchools() {
  const schoolsQuery = useSchools();
  const [query, setQuery] = useState("");

  const schools = useMemo(() => schoolsQuery.data ?? [], [schoolsQuery.data]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return schools;
    return schools.filter(
      (school) =>
        school.name.toLowerCase().includes(q) ||
        school.region.toLowerCase().includes(q) ||
        (school.officerName ?? "").toLowerCase().includes(q),
    );
  }, [schools, query]);

  const totalSiswa = schools.reduce((acc, school) => acc + totalStudents(school), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {schools.length} sekolah • {totalSiswa.toLocaleString("id-ID")} siswa total
        </p>
        <Input
          type="search"
          className="w-full sm:w-64"
          value={query}
          placeholder="Cari sekolah / petugas / wilayah…"
          aria-label="Cari sekolah"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {schoolsQuery.isPending ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((index) => (
            <div key={index} className="glass-subtle h-20 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : schoolsQuery.isError ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-red-600">
          {schoolsQuery.error instanceof Error
            ? schoolsQuery.error.message
            : "Gagal memuat data sekolah."}
        </p>
      ) : visible.length === 0 ? (
        <GlassCard tone="subtle" className="p-8 text-center text-sm text-stone-500">
          Tidak ada sekolah yang cocok.
        </GlassCard>
      ) : (
        <div className="overflow-x-auto rounded-2xl glass">
          <table className="w-full text-sm">
            <caption className="sr-only">Daftar sekolah & petugas</caption>
            <thead className="bg-white/50 text-[11px] tracking-wider text-stone-500 uppercase dark:bg-stone-900/40">
              <tr>
                <th scope="col" className="border-r border-white/40 px-4 py-3 text-center font-semibold last:border-r-0 dark:border-white/10">Sekolah</th>
                <th scope="col" className="border-r border-white/40 px-4 py-3 text-center font-semibold last:border-r-0 dark:border-white/10">Petugas</th>
                <th scope="col" className="border-r border-white/40 px-4 py-3 text-center font-semibold last:border-r-0 dark:border-white/10">Jumlah siswa / jenjang</th>
                <th scope="col" className="border-r border-white/40 px-4 py-3 text-center font-semibold last:border-r-0 dark:border-white/10">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-white/10">
              {visible.map((school) => (
                <tr key={school.id} className="align-top transition hover:bg-white/40 dark:hover:bg-stone-800/40">
                  <td className="border-r border-white/30 px-4 py-3 last:border-r-0 dark:border-white/10">
                    <div className="flex items-start gap-2">
                      <SchoolIcon className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-800 dark:text-stone-100">{school.name}</p>
                        <p className="text-xs text-stone-400">
                          {school.region}
                          {school.npsn ? ` • NPSN ${school.npsn}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="border-r border-white/30 px-4 py-3 text-xs text-stone-600 last:border-r-0 dark:border-white/10 dark:text-stone-300">
                    {school.officerName ?? <span className="text-stone-400">—</span>}
                  </td>
                  <td className="border-r border-white/30 px-4 py-3 last:border-r-0 dark:border-white/10">
                    {school.groups.length === 0 ? (
                      <span className="text-xs text-stone-400">Belum ada kelompok</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {school.groups.map((group) => (
                          <Badge key={group.id} tone="neutral">
                            {group.level === "lainnya" && group.label
                              ? group.label
                              : BENEFICIARY_LEVEL_LABELS[group.level]}
                            : {group.studentCount}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-stone-500">
                      <Users className="size-3.5" aria-hidden="true" /> Total {totalStudents(school)} siswa
                    </p>
                  </td>
                  <td className="border-r border-white/30 px-4 py-3 last:border-r-0 dark:border-white/10">
                    <Badge tone={school.isActive ? "brand" : "neutral"}>
                      {school.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

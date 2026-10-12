"use client";

import { School } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ButtonLink, Label, Select, Skeleton } from "@/components/ui";
import { useSchools } from "@/hooks/use-schools";
import { BENEFICIARY_LEVEL_LABELS, totalStudents } from "@/schemas/school";
import { useSppgStore } from "@/stores/sppg-store";

/**
 * Pemilih konteks (sekolah + kelompok penerima) untuk alur SPPG. Hasil pilihan
 * dikirim ke store sebagai baris porsi sehingga Meal Planner & Shopping List
 * memakai data yang sama tanpa input ulang.
 */
export function SppgContextSelector() {
  const { data: schools, isPending, isError, error } = useSchools();
  const setContext = useSppgStore((state) => state.setContext);

  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);

  const selectedSchool = useMemo(
    () => schools?.find((school) => school.id === schoolId) ?? null,
    [schools, schoolId],
  );

  useEffect(() => {
    if (!schools || schools.length === 0) return;
    if (schoolId === null || !schools.some((school) => school.id === schoolId)) {
      setSchoolId(schools[0]?.id ?? null);
    }
  }, [schools, schoolId]);

  useEffect(() => {
    if (!selectedSchool) return;
    const groups = selectedSchool.groups;
    if (groups.length === 0) {
      if (groupId !== null) setGroupId(null);
      return;
    }
    if (groupId === null || !groups.some((group) => group.id === groupId)) {
      setGroupId(groups[0]?.id ?? null);
    }
  }, [selectedSchool, groupId]);

  // Sinkronkan pilihan ke store sebagai baris porsi.
  useEffect(() => {
    if (!selectedSchool) return;
    const group = selectedSchool.groups.find((item) => item.id === groupId);
    if (!group) {
      setContext({ rows: [], label: selectedSchool.name, budgetPerPortion: null });
      return;
    }
    const groupLabel =
      group.level === "lainnya" && group.label
        ? group.label
        : BENEFICIARY_LEVEL_LABELS[group.level];
    setContext({
      rows: [{ level: group.level, studentCount: group.studentCount }],
      label: `${selectedSchool.name} • ${groupLabel}`,
      budgetPerPortion: group.budgetPerPortion,
    });
  }, [selectedSchool, groupId, setContext]);

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
        {error instanceof Error ? error.message : "Gagal memuat data sekolah."}
      </p>
    );
  }

  if (!schools || schools.length === 0) {
    return (
      <EmptyState
        title="Belum ada data sekolah"
        description="Tambahkan sekolah yang Anda kelola beserta jumlah siswa per jenjang sebelum menyusun menu, atau gunakan input manual di Explore."
        action={<ButtonLink href="/sppg/schools">Kelola Data Sekolah</ButtonLink>}
      />
    );
  }

  const selectedGroup = selectedSchool?.groups.find((group) => group.id === groupId) ?? null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="sppg-school">Sekolah</Label>
        <Select
          id="sppg-school"
          value={schoolId ?? ""}
          onChange={(event) => {
            setSchoolId(Number(event.target.value));
            setGroupId(null);
          }}
        >
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name} — {totalStudents(school)} siswa
            </option>
          ))}
        </Select>
        {selectedSchool ? (
          <p className="flex items-center gap-1.5 text-xs text-stone-500">
            <School className="size-3.5" aria-hidden="true" />
            {selectedSchool.region}
            {selectedSchool.npsn ? ` • NPSN ${selectedSchool.npsn}` : ""}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sppg-group">Kelompok penerima</Label>
        {selectedSchool && selectedSchool.groups.length > 0 ? (
          <Select
            id="sppg-group"
            value={groupId ?? ""}
            onChange={(event) => setGroupId(Number(event.target.value))}
          >
            {selectedSchool.groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.level === "lainnya" && group.label
                  ? group.label
                  : BENEFICIARY_LEVEL_LABELS[group.level]}{" "}
                — {group.studentCount} siswa
              </option>
            ))}
          </Select>
        ) : (
          <p className="rounded-xl bg-harvest-50 px-3 py-2.5 text-xs text-harvest-800 dark:bg-harvest-900/40 dark:text-harvest-200">
            Sekolah ini belum memiliki kelompok penerima. Tambahkan di halaman Data Sekolah.
          </p>
        )}
        {selectedGroup ? (
          <p className="text-xs text-stone-500">
            {selectedGroup.studentCount} siswa
            {selectedGroup.budgetPerPortion
              ? ` • batas ${selectedGroup.budgetPerPortion.toLocaleString("id-ID")} /porsi`
              : " • batas anggaran per kelompok belum diatur"}
          </p>
        ) : null}
      </div>
    </div>
  );
}

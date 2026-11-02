"use client";

import { ArrowLeft, Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
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
  Input,
  Label,
  Select,
  Skeleton,
} from "@/components/ui";
import {
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useSchools,
  useUpdateGroupMutation,
} from "@/hooks/use-schools";
import {
  BENEFICIARY_LEVEL_LABELS,
  BENEFICIARY_LEVEL_ORDER,
  BeneficiaryGroupFormSchema,
  totalStudents,
  type BeneficiaryGroup,
  type BeneficiaryLevel,
} from "@/schemas/school";

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

const groupName = (group: BeneficiaryGroup): string =>
  group.level === "lainnya" && group.label
    ? group.label
    : BENEFICIARY_LEVEL_LABELS[group.level];

interface GroupDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly schoolId: number;
  readonly group?: BeneficiaryGroup | null;
}

function GroupDialog({ open, onOpenChange, schoolId, group }: GroupDialogProps) {
  const isEdit = Boolean(group);
  const createMutation = useCreateGroupMutation(schoolId);
  const updateMutation = useUpdateGroupMutation(schoolId);

  const [level, setLevel] = useState<BeneficiaryLevel>(group?.level ?? "sd_1_3");
  const [label, setLabel] = useState(group?.label ?? "");
  const [studentCount, setStudentCount] = useState(
    group ? String(group.studentCount) : "0",
  );
  const [budget, setBudget] = useState(
    group?.budgetPerPortion !== null && group?.budgetPerPortion !== undefined
      ? String(group.budgetPerPortion)
      : "",
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = BeneficiaryGroupFormSchema.safeParse({
      level,
      label,
      studentCount,
      budgetPerPortion: budget,
    });
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error.issues));
      return;
    }
    setErrors({});
    setServerError(null);

    const input = {
      level: parsed.data.level,
      label: parsed.data.label || null,
      studentCount: parsed.data.studentCount,
      budgetPerPortion: parsed.data.budgetPerPortion,
    };

    const options = {
      onSuccess: () => onOpenChange(false),
      onError: (error: unknown) =>
        setServerError(error instanceof Error ? error.message : "Gagal menyimpan."),
    };

    if (group) {
      updateMutation.mutate({ groupId: group.id, input }, options);
    } else {
      createMutation.mutate(input, options);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Kelompok" : "Tambah Kelompok Penerima"}</DialogTitle>
          <DialogDescription>
            Tambahkan hanya kelompok yang relevan untuk sekolah ini (mis. SD kelas 1–3 dan 4–6).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4" noValidate>
          {serverError ? (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
            >
              {serverError}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="group-level">Kategori kelompok</Label>
            <Select
              id="group-level"
              value={level}
              onChange={(event) => setLevel(event.target.value as BeneficiaryLevel)}
            >
              {BENEFICIARY_LEVEL_ORDER.map((option) => (
                <option key={option} value={option}>
                  {BENEFICIARY_LEVEL_LABELS[option]}
                </option>
              ))}
            </Select>
          </div>

          {level === "lainnya" ? (
            <div className="space-y-1.5">
              <Label htmlFor="group-label">Nama kelompok</Label>
              <Input
                id="group-label"
                value={label}
                invalid={Boolean(errors.label)}
                placeholder="Contoh: Kelas Khusus / Guru"
                onChange={(event) => setLabel(event.target.value)}
              />
              <FieldError>{errors.label}</FieldError>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="group-count">Jumlah siswa</Label>
              <Input
                id="group-count"
                type="number"
                min={0}
                max={100000}
                value={studentCount}
                invalid={Boolean(errors.studentCount)}
                onChange={(event) => setStudentCount(event.target.value)}
              />
              <FieldError>{errors.studentCount}</FieldError>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-budget">Batas anggaran /porsi (opsional)</Label>
              <Input
                id="group-budget"
                type="number"
                min={0}
                step={500}
                value={budget}
                invalid={Boolean(errors.budgetPerPortion)}
                placeholder="Kosongkan bila belum diatur"
                onChange={(event) => setBudget(event.target.value)}
              />
              <FieldError>{errors.budgetPerPortion}</FieldError>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" intent="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              {isEdit ? "Simpan Perubahan" : "Tambah Kelompok"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** FR-11: detail sekolah + pengelolaan kelompok penerima manfaat. */
export function SchoolDetail({ schoolId }: { schoolId: number }) {
  const schoolsQuery = useSchools();
  const deleteMutation = useDeleteGroupMutation(schoolId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BeneficiaryGroup | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BeneficiaryGroup | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (schoolsQuery.isPending) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (schoolsQuery.isError) {
    return (
      <ErrorState
        title="Gagal memuat data sekolah"
        message={
          schoolsQuery.error instanceof Error ? schoolsQuery.error.message : "Terjadi kesalahan."
        }
        action={
          <Button intent="danger" onClick={() => void schoolsQuery.refetch()}>
            Coba Lagi
          </Button>
        }
      />
    );
  }

  const school = (schoolsQuery.data ?? []).find((item) => item.id === schoolId);
  if (!school) {
    return (
      <ErrorState
        title="Sekolah tidak ditemukan"
        message="Sekolah ini tidak ada atau bukan menjadi tanggung jawab Anda."
        action={
          <Link href="/sppg/schools" className="text-sm font-semibold text-brand-700">
            Kembali ke Data Sekolah
          </Link>
        }
      />
    );
  }

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (group: BeneficiaryGroup) => {
    setEditing(group);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setDeleteError(null);
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
      onError: (error) =>
        setDeleteError(error instanceof Error ? error.message : "Gagal menghapus."),
    });
  };

  return (
    <div className="space-y-5">
      <Link
        href="/sppg/schools"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-brand-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Data Sekolah
      </Link>

      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-stone-900">{school.name}</h1>
            <p className="mt-1 text-sm text-stone-500">
              {school.region}
              {school.npsn ? ` • NPSN ${school.npsn}` : ""}
              {school.address ? ` • ${school.address}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={school.isActive ? "brand" : "neutral"}>
              {school.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
            <Badge tone="harvest">
              <Users className="size-3.5" aria-hidden="true" /> {totalStudents(school)} siswa
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-stone-900">Kelompok Penerima Manfaat</h2>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" /> Tambah Kelompok
        </Button>
      </div>

      {school.groups.length === 0 ? (
        <EmptyState
          title="Belum ada kelompok penerima"
          description="Tambahkan kelompok siswa yang relevan (mis. SD kelas 1–3 dan 4–6) beserta jumlah siswanya."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" /> Tambah Kelompok
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Kelompok penerima manfaat</caption>
            <thead className="bg-white/50 text-[11px] tracking-wider text-stone-500 uppercase dark:bg-stone-900/40">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Kelompok</th>
                <th scope="col" className="px-4 py-3 font-semibold">Siswa</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Batas anggaran/porsi
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-white/10">
              {school.groups.map((group) => (
                <tr key={group.id}>
                  <td className="px-4 py-3 font-medium text-stone-800">{groupName(group)}</td>
                  <td className="px-4 py-3 tabular-nums text-stone-700">{group.studentCount}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {group.budgetPerPortion !== null ? (
                      <span className="tabular-nums text-stone-700">
                        Rp {group.budgetPerPortion.toLocaleString("id-ID")}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400">Belum diatur</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        intent="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Ubah ${groupName(group)}`}
                        onClick={() => openEdit(group)}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        intent="ghost"
                        size="icon"
                        className="size-8 text-red-500"
                        aria-label={`Hapus ${groupName(group)}`}
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(group);
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen ? (
        <GroupDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          schoolId={schoolId}
          group={editing}
        />
      ) : null}

      {pendingDelete ? (
        <Dialog open onOpenChange={(open) => (open ? undefined : setPendingDelete(null))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus kelompok?</DialogTitle>
              <DialogDescription>
                Kelompok {groupName(pendingDelete)} akan dihapus dari sekolah ini.
              </DialogDescription>
            </DialogHeader>
            {deleteError ? (
              <p role="alert" className="text-sm text-red-600">
                {deleteError}
              </p>
            ) : null}
            <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button intent="outline" onClick={() => setPendingDelete(null)}>
                Batal
              </Button>
              <Button intent="danger" loading={deleteMutation.isPending} onClick={confirmDelete}>
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Menghapus…
                  </>
                ) : (
                  "Hapus"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

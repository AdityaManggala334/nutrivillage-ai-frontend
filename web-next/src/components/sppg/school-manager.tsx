"use client";

import { ArrowRight, Loader2, Pencil, Plus, School as SchoolIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { SchoolLevelCounts } from "@/components/sppg/school-level-counts";
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
  Skeleton,
} from "@/components/ui";
import {
  useCreateSchoolMutation,
  useDeleteSchoolMutation,
  useSchools,
  useUpdateSchoolMutation,
} from "@/hooks/use-schools";
import {
  SchoolFormSchema,
  countsFromGroups,
  emptyLevelCounts,
  groupsFromCounts,
  totalStudents,
  type LevelCounts,
  type School,
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

interface SchoolDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly school?: School | null;
}

function SchoolDialog({ open, onOpenChange, school }: SchoolDialogProps) {
  const isEdit = Boolean(school);
  const createMutation = useCreateSchoolMutation();
  const updateMutation = useUpdateSchoolMutation();

  const [name, setName] = useState(school?.name ?? "");
  const [npsn, setNpsn] = useState(school?.npsn ?? "");
  const [address, setAddress] = useState(school?.address ?? "");
  const [region, setRegion] = useState(school?.region ?? "Kec. Madiun, Kab. Madiun");
  const [counts, setCounts] = useState<LevelCounts>(() =>
    school ? countsFromGroups(school.groups) : emptyLevelCounts(),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const candidate = { name, npsn, address, region, isActive: school?.isActive ?? true };
    const parsed = SchoolFormSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error.issues));
      return;
    }
    setErrors({});
    setServerError(null);

    const input = {
      name: parsed.data.name,
      npsn: parsed.data.npsn || undefined,
      address: parsed.data.address || undefined,
      region: parsed.data.region,
      isActive: parsed.data.isActive,
      groups: groupsFromCounts(counts),
    };

    const options = {
      onSuccess: () => onOpenChange(false),
      onError: (error: unknown) =>
        setServerError(error instanceof Error ? error.message : "Gagal menyimpan."),
    };

    if (school) {
      updateMutation.mutate({ id: school.id, input }, options);
    } else {
      createMutation.mutate(input, options);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Data Sekolah" : "Tambah Sekolah"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui identitas sekolah yang Anda kelola."
              : "Masukkan identitas sekolah. Jumlah siswa per kelompok ditambahkan pada halaman detail sekolah."}
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
            <Label htmlFor="school-name">Nama sekolah</Label>
            <Input
              id="school-name"
              value={name}
              invalid={Boolean(errors.name)}
              placeholder="Contoh: SD Negeri 1 Madiun"
              onChange={(event) => setName(event.target.value)}
            />
            <FieldError>{errors.name}</FieldError>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="school-npsn">NPSN (opsional)</Label>
              <Input
                id="school-npsn"
                value={npsn}
                invalid={Boolean(errors.npsn)}
                placeholder="Contoh: 20512345"
                onChange={(event) => setNpsn(event.target.value)}
              />
              <FieldError>{errors.npsn}</FieldError>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="school-region">Wilayah</Label>
              <Input
                id="school-region"
                value={region}
                invalid={Boolean(errors.region)}
                onChange={(event) => setRegion(event.target.value)}
              />
              <FieldError>{errors.region}</FieldError>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="school-address">Alamat (opsional)</Label>
            <Input
              id="school-address"
              value={address}
              invalid={Boolean(errors.address)}
              placeholder="Jl. Contoh No. 1"
              onChange={(event) => setAddress(event.target.value)}
            />
            <FieldError>{errors.address}</FieldError>
          </div>

          <SchoolLevelCounts counts={counts} onChange={setCounts} />

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" intent="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              {pending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Sekolah"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** FR-11: pengelolaan data sekolah (daftar, tambah, ubah, hapus). */
export function SchoolManager() {
  const schoolsQuery = useSchools();
  const deleteMutation = useDeleteSchoolMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [pendingDelete, setPendingDelete] = useState<School | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (school: School) => {
    setEditing(school);
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

  if (schoolsQuery.isPending) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
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

  const schools = schoolsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          {schools.length} sekolah • {schools.reduce((t, s) => t + totalStudents(s), 0)} siswa
        </p>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" /> Tambah Sekolah
        </Button>
      </div>

      {schools.length === 0 ? (
        <EmptyState
          title="Belum ada sekolah"
          description="Tambahkan sekolah yang Anda kelola. Satu petugas dapat mengelola beberapa sekolah."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" /> Tambah Sekolah
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Daftar sekolah yang dikelola</caption>
            <thead className="bg-white/50 text-[11px] tracking-wider text-stone-500 uppercase dark:bg-stone-900/40">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Sekolah</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Kelompok</th>
                <th scope="col" className="px-4 py-3 font-semibold">Total siswa</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-white/10">
              {schools.map((school) => (
                <tr key={school.id} className="transition hover:bg-white/40 dark:hover:bg-stone-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <SchoolIcon className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-800">{school.name}</p>
                        <p className="truncate text-xs text-stone-400">
                          {school.region}
                          {school.npsn ? ` • NPSN ${school.npsn}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {school.groups.length === 0 ? (
                      <span className="text-xs text-stone-400">—</span>
                    ) : (
                      <span className="text-xs text-stone-600">{school.groups.length} kelompok</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="brand">{totalStudents(school)} siswa</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/sppg/schools/${school.id}`}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        Kelola kelompok
                        <ArrowRight className="ml-1 inline size-3.5" aria-hidden="true" />
                      </Link>
                      <Button
                        intent="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Ubah ${school.name}`}
                        onClick={() => openEdit(school)}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        intent="ghost"
                        size="icon"
                        className="size-8 text-red-500"
                        aria-label={`Hapus ${school.name}`}
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(school);
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
        <SchoolDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          school={editing}
        />
      ) : null}

      {pendingDelete ? (
        <Dialog open onOpenChange={(open) => (open ? undefined : setPendingDelete(null))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus sekolah?</DialogTitle>
              <DialogDescription>
                {pendingDelete.name} beserta seluruh kelompok penerima di dalamnya akan dihapus.
                Tindakan ini tidak dapat dibatalkan.
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

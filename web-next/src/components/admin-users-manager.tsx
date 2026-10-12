"use client";

import { Loader2, Pencil, Plus, Search, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
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
} from "@/components/ui";
import {
  useAdminUsers,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
} from "@/hooks/use-admin-users";
import { cn, formatDateId } from "@/lib/utils";
import {
  AdminUserCreateBodySchema,
  type AdminUser,
  type AdminUserCreateBody,
} from "@/schemas/admin";

const ROLE_LABELS: Readonly<Record<string, string>> = {
  user: "Masyarakat",
  petugas_sppg: "Petugas SPPG",
  admin: "Admin",
  guest: "Tamu",
};

const ROLE_TONE: Readonly<Record<string, "brand" | "harvest" | "info" | "neutral">> = {
  user: "brand",
  petugas_sppg: "harvest",
  admin: "info",
  guest: "neutral",
};

type Filter = "all" | "user" | "petugas_sppg" | "admin";

const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "user", label: "Masyarakat" },
  { value: "petugas_sppg", label: "Petugas SPPG" },
  { value: "admin", label: "Admin" },
];

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

interface UserDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly user?: AdminUser | null;
}

function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const isEdit = Boolean(user);
  const createMutation = useCreateAdminUserMutation();
  const updateMutation = useUpdateAdminUserMutation();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "petugas_sppg" | "admin">(
    (user?.role === "guest" ? "user" : user?.role) ?? "user",
  );
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [nip, setNip] = useState(user?.sppgOfficer?.nip ?? "");
  const [unit, setUnit] = useState(user?.sppgOfficer?.sppgUnit ?? "");
  const [region, setRegion] = useState(user?.sppgOfficer?.region ?? "");
  const [position, setPosition] = useState(user?.sppgOfficer?.position ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const options = {
      onSuccess: () => onOpenChange(false),
      onError: (error: unknown) =>
        setServerError(error instanceof Error ? error.message : "Gagal menyimpan."),
    };

    if (user) {
      updateMutation.mutate(
        {
          id: user.id,
          input: {
            name,
            role,
            isActive,
            nip: role === "petugas_sppg" ? nip : undefined,
            sppgUnit: role === "petugas_sppg" ? unit : undefined,
            region: role === "petugas_sppg" ? region : undefined,
            position: role === "petugas_sppg" ? position : undefined,
          },
        },
        options,
      );
      return;
    }

    const candidate: AdminUserCreateBody = {
      name,
      email,
      password,
      role,
      isActive,
      nip,
      sppgUnit: unit,
      region,
      position,
    };
    const parsed = AdminUserCreateBodySchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error.issues));
      return;
    }
    setErrors({});
    createMutation.mutate(parsed.data, options);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Pengguna" : "Tambah Akun"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui nama, peran, status, atau data petugas SPPG."
              : "Buat akun baru. Pengguna akan masuk sendiri lewat halaman login."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4" noValidate>
          {serverError ? (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {serverError}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="au-name">Nama lengkap</Label>
            <Input id="au-name" value={name} invalid={Boolean(errors.name)} onChange={(event) => setName(event.target.value)} />
            <FieldError>{errors.name}</FieldError>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="au-email">Email</Label>
            <Input
              id="au-email"
              type="email"
              value={email}
              disabled={isEdit}
              invalid={Boolean(errors.email)}
              onChange={(event) => setEmail(event.target.value)}
            />
            <FieldError>{errors.email}</FieldError>
          </div>

          {!isEdit ? (
            <div className="space-y-1.5">
              <Label htmlFor="au-password">Password</Label>
              <Input
                id="au-password"
                type="password"
                value={password}
                invalid={Boolean(errors.password)}
                placeholder="Minimal 8 karakter, huruf & angka"
                onChange={(event) => setPassword(event.target.value)}
              />
              <FieldError>{errors.password}</FieldError>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="au-role">Peran</Label>
              <Select
                id="au-role"
                value={role}
                onChange={(event) => setRole(event.target.value as "user" | "petugas_sppg" | "admin")}
              >
                <option value="user">Masyarakat</option>
                <option value="petugas_sppg">Petugas SPPG</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="au-status">Status akun</Label>
              <Select
                id="au-status"
                value={isActive ? "active" : "inactive"}
                onChange={(event) => setIsActive(event.target.value === "active")}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </Select>
            </div>
          </div>

          {role === "petugas_sppg" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="au-nip">NIP</Label>
                <Input id="au-nip" value={nip} invalid={Boolean(errors.nip)} onChange={(event) => setNip(event.target.value)} />
                <FieldError>{errors.nip}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="au-unit">Unit SPPG</Label>
                <Input id="au-unit" value={unit} invalid={Boolean(errors.sppgUnit)} onChange={(event) => setUnit(event.target.value)} />
                <FieldError>{errors.sppgUnit}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="au-region">Wilayah</Label>
                <Input id="au-region" value={region} invalid={Boolean(errors.region)} onChange={(event) => setRegion(event.target.value)} />
                <FieldError>{errors.region}</FieldError>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="au-position">Jabatan (opsional)</Label>
                <Input id="au-position" value={position} onChange={(event) => setPosition(event.target.value)} />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" intent="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Menyimpan…
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Buat Akun"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Panel admin: kelola pengguna (masyarakat, petugas SPPG, admin). */
export function AdminUsersManager() {
  const usersQuery = useAdminUsers();
  const updateMutation = useUpdateAdminUserMutation();

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesFilter = filter === "all" || user.role === filter;
      const matchesQuery =
        q.length === 0 ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [users, filter, query]);

  const counts = useMemo(() => {
    return {
      all: users.length,
      user: users.filter((u) => u.role === "user").length,
      petugas_sppg: users.filter((u) => u.role === "petugas_sppg").length,
      admin: users.filter((u) => u.role === "admin").length,
    } as Record<Filter, number>;
  }, [users]);

  const toggleActive = (user: AdminUser) => {
    setActionError(null);
    updateMutation.mutate(
      { id: user.id, input: { isActive: !user.isActive } },
      {
        onError: (error) =>
          setActionError(error instanceof Error ? error.message : "Gagal memperbarui status."),
      },
    );
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "press rounded-full px-3 py-1.5 text-xs font-semibold transition",
                filter === item.value
                  ? "bg-brand-600 text-white"
                  : "glass-subtle text-stone-600 dark:text-stone-300",
              )}
            >
              {item.label} ({counts[item.value]})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <Input
              type="search"
              className="pl-9"
              value={query}
              placeholder="Cari nama / email…"
              aria-label="Cari pengguna"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" /> Tambah
          </Button>
        </div>
      </div>

      {actionError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {actionError}
        </p>
      ) : null}

      {usersQuery.isPending ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="glass-subtle h-16 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : usersQuery.isError ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-red-600">
          {usersQuery.error instanceof Error ? usersQuery.error.message : "Gagal memuat pengguna."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl glass">
          <table className="w-full text-sm">
            <caption className="sr-only">Daftar pengguna</caption>
            <thead className="bg-white/50 text-[11px] tracking-wider text-stone-500 uppercase dark:bg-stone-900/40">
              <tr>
                <th scope="col" className="px-4 py-3 text-center font-semibold">Pengguna</th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">Peran</th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">Info</th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 dark:divide-white/10">
              {visible.map((user) => (
                <tr key={user.id} className="transition hover:bg-white/40 dark:hover:bg-stone-800/40">
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                        {user.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-800 dark:text-stone-100">{user.name}</p>
                        <p className="truncate text-xs text-stone-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={ROLE_TONE[user.role] ?? "neutral"}>
                      {user.role === "admin" ? <ShieldCheck className="size-3" aria-hidden="true" /> : null}
                      {user.role === "petugas_sppg" ? <Users className="size-3" aria-hidden="true" /> : null}
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-stone-500">
                    {user.sppgOfficer ? (
                      <>
                        <p className="font-medium text-stone-600 dark:text-stone-300">{user.sppgOfficer.sppgUnit}</p>
                        <p>NIP {user.sppgOfficer.nip} • {user.schoolsCount} sekolah</p>
                      </>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={user.isActive ? "brand" : "danger"}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <p className="mt-1 text-[10px] text-stone-400">{formatDateId(user.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        intent="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => toggleActive(user)}
                        loading={updateMutation.isPending && updateMutation.variables?.id === user.id}
                      >
                        {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button
                        intent="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Ubah ${user.name}`}
                        onClick={() => openEdit(user)}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-stone-400">
                    Tidak ada pengguna yang cocok.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen ? (
        <UserDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={editing}
        />
      ) : null}
    </div>
  );
}

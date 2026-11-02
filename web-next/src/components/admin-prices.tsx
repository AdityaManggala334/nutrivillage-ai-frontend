"use client";

import { Check, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
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
import { AdminStatusBadge } from "@/components/admin-table";
import {
  useAdminPrices,
  useCreatePriceMutation,
  useDeletePriceMutation,
  usePriceIngredients,
  useUpdatePriceMutation,
  useVerifyPriceMutation,
} from "@/hooks/use-admin-prices";
import { formatDateId, formatRupiah } from "@/lib/utils";
import {
  AdminPriceCreateSchema,
  AdminPriceUpdateSchema,
  type AdminPrice,
  type PriceStatus,
} from "@/schemas/admin";

const PAGE_SIZE = 50;

const STATUS_FILTERS: ReadonlyArray<{ value: PriceStatus | "all"; label: string }> = [
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "all", label: "Semua" },
];

interface FormState {
  ingredientId: string;
  price: string;
  unit: string;
  source: string;
}

const emptyForm = (): FormState => ({ ingredientId: "", price: "", unit: "kg", source: "" });

function toForm(price: AdminPrice): FormState {
  return {
    ingredientId: String(price.ingredientId),
    price: String(price.price),
    unit: price.unit,
    source: price.source,
  };
}

function CreateDialog({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const ingredients = usePriceIngredients();
  const mutation = useCreatePriceMutation();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const parsed = AdminPriceCreateSchema.safeParse({
      ingredientId: Number(form.ingredientId),
      price: Number(form.price),
      unit: form.unit,
      source: form.source,
      status: "pending",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data belum valid.");
      return;
    }
    mutation.mutate(parsed.data, {
      onSuccess: () => {
        setForm(emptyForm());
        onOpenChange(false);
      },
      onError: (err: unknown) =>
        setError(err instanceof Error ? err.message : "Gagal menyimpan harga."),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Harga Bahan</DialogTitle>
          <DialogDescription>
            Harga baru masuk sebagai <strong>menunggu verifikasi</strong>. Setujui dulu agar
            dipakai mesin rekomendasi.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Bahan</Label>
            <Select
              value={form.ingredientId}
              onChange={(event) => {
                const id = event.target.value;
                const found = ingredients.data?.find((item) => String(item.id) === id);
                setForm({ ...form, ingredientId: id, unit: found?.unit ?? form.unit });
              }}
            >
              <option value="">Pilih bahan…</option>
              {(ingredients.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit})
                </option>
              ))}
            </Select>
            {ingredients.isError ? (
              <FieldError>Gagal memuat daftar bahan.</FieldError>
            ) : null}
          </div>
          <div>
            <Label className="mb-1 block text-xs">Harga</Label>
            <Input
              type="number"
              min={1}
              step={500}
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Satuan</Label>
            <Input
              value={form.unit}
              placeholder="kg / ikat / butir"
              onChange={(event) => setForm({ ...form, unit: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Sumber</Label>
            <Input
              value={form.source}
              placeholder="Pasar Madiun, survei 2 November 2026"
              onChange={(event) => setForm({ ...form, source: event.target.value })}
            />
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" intent="ghost">
              Batal
            </Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  row,
  onOpenChange,
}: {
  readonly row: AdminPrice;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const mutation = useUpdatePriceMutation();
  const [form, setForm] = useState<FormState>(() => toForm(row));
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const parsed = AdminPriceUpdateSchema.safeParse({
      price: Number(form.price),
      unit: form.unit,
      source: form.source,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data belum valid.");
      return;
    }
    mutation.mutate(
      { id: Number(row.id), input: parsed.data },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err: unknown) =>
          setError(err instanceof Error ? err.message : "Gagal menyimpan harga."),
      },
    );
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{row.ingredientName}</DialogTitle>
        <DialogDescription>
          Perubahan harga langsung dipakai mesin setelah statusnya disetujui.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block text-xs">Harga</Label>
          <Input
            type="number"
            min={1}
            step={500}
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs">Satuan</Label>
          <Input
            value={form.unit}
            onChange={(event) => setForm({ ...form, unit: event.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1 block text-xs">Sumber</Label>
          <Input
            value={form.source}
            onChange={(event) => setForm({ ...form, source: event.target.value })}
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" intent="ghost">
            Batal
          </Button>
        </DialogClose>
        <Button type="button" onClick={submit} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Simpan
        </Button>
      </div>
    </DialogContent>
  );
}

export function AdminPrices() {
  const { data, isLoading, isError, error, refetch } = useAdminPrices();
  const verify = useVerifyPriceMutation();
  const remove = useDeletePriceMutation();
  const [status, setStatus] = useState<PriceStatus | "all">("pending");
  const [cari, setCari] = useState("");
  const [halaman, setHalaman] = useState(0);
  const [tambah, setTambah] = useState(false);
  const [edit, setEdit] = useState<AdminPrice | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  const baris = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    return (data ?? []).filter(
      (row) =>
        (status === "all" || row.status === status) &&
        (!kunci || row.ingredientName.toLowerCase().includes(kunci)),
    );
  }, [data, status, cari]);

  const totalHalaman = Math.max(1, Math.ceil(baris.length / PAGE_SIZE));
  const tampil = baris.slice(halaman * PAGE_SIZE, (halaman + 1) * PAGE_SIZE);

  const ubahStatus = (row: AdminPrice, next: "approved" | "rejected") => {
    setPesan(null);
    verify.mutate(
      { id: Number(row.id), status: next },
      {
        onSuccess: () =>
          setPesan(
            `${row.ingredientName}: ${next === "approved" ? "disetujui" : "ditolak"}.`,
          ),
        onError: (err: unknown) =>
          setPesan(err instanceof Error ? err.message : "Gagal mengubah status."),
      },
    );
  };

  const hapus = (row: AdminPrice) => {
    if (!window.confirm(`Hapus harga ${row.ingredientName} (${formatRupiah(row.price)})?`)) {
      return;
    }
    setPesan(null);
    remove.mutate(Number(row.id), {
      onSuccess: () => setPesan(`${row.ingredientName}: harga dihapus.`),
      onError: (err: unknown) =>
        setPesan(err instanceof Error ? err.message : "Gagal menghapus harga."),
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={cari}
            placeholder="Cari bahan…"
            className="pl-9"
            onChange={(event) => {
              setCari(event.target.value);
              setHalaman(0);
            }}
          />
        </div>
        {STATUS_FILTERS.map((item) => (
          <Button
            key={item.value}
            type="button"
            intent={status === item.value ? "primary" : "ghost"}
            onClick={() => {
              setStatus(item.value);
              setHalaman(0);
            }}
          >
            {item.label}
          </Button>
        ))}
        <Button type="button" onClick={() => setTambah(true)}>
          <Plus className="mr-2 size-4" /> Tambah Harga
        </Button>
      </div>

      {pesan ? (
        <p className="mb-3 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
          {pesan}
        </p>
      ) : null}

      {isLoading ? (
        <p className="flex items-center gap-2 py-8 text-sm text-stone-500">
          <Loader2 className="size-4 animate-spin" /> Memuat harga…
        </p>
      ) : isError ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40">
          <p>{error instanceof Error ? error.message : "Gagal memuat harga."}</p>
          <Button intent="ghost" type="button" className="mt-2" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : (
        <>
          <div className="glass overflow-hidden rounded-2xl">
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase dark:bg-stone-800">
                  <tr>
                    <th className="px-4 py-2">Bahan</th>
                    <th className="px-3 py-2 text-right">Harga</th>
                    <th className="px-3 py-2">Satuan</th>
                    <th className="px-3 py-2">Sumber</th>
                    <th className="px-3 py-2">Tanggal</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {tampil.map((row) => {
                    const busy =
                      (verify.isPending && verify.variables?.id === Number(row.id)) ||
                      (remove.isPending && remove.variables === Number(row.id));
                    return (
                      <tr key={row.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                        <td className="px-4 py-2 font-medium text-stone-800 dark:text-stone-100">
                          {row.ingredientName}
                          <span className="ml-2 text-[11px] text-stone-400 uppercase">
                            {row.sourceType}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                          {formatRupiah(row.price)}
                        </td>
                        <td className="px-3 py-2">{row.unit}</td>
                        <td className="px-3 py-2 text-stone-600 dark:text-stone-300">
                          {row.source}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-stone-500">
                          {formatDateId(row.recordedAt)}
                        </td>
                        <td className="px-3 py-2">
                          <AdminStatusBadge status={row.status} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            {row.status === "pending" ? (
                              <>
                                <Button
                                  intent="primary"
                                  size="sm"
                                  disabled={busy}
                                  onClick={() => ubahStatus(row, "approved")}
                                >
                                  <Check className="size-3.5" /> Setujui
                                </Button>
                                <Button
                                  intent="danger"
                                  size="sm"
                                  disabled={busy}
                                  onClick={() => ubahStatus(row, "rejected")}
                                >
                                  <X className="size-3.5" /> Tolak
                                </Button>
                              </>
                            ) : (
                              <Badge tone={row.status === "approved" ? "brand" : "danger"}>
                                {row.status === "approved" ? "Dipakai mesin" : "Tidak dipakai"}
                              </Badge>
                            )}
                            <Button
                              intent="ghost"
                              size="sm"
                              aria-label={`Ubah harga ${row.ingredientName}`}
                              onClick={() => setEdit(row)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              intent="ghost"
                              size="sm"
                              aria-label={`Hapus harga ${row.ingredientName}`}
                              disabled={busy}
                              onClick={() => hapus(row)}
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {tampil.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                        Tidak ada harga pada filter ini.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-stone-500">
            <span>
              Menampilkan {tampil.length} dari {baris.length} data harga
            </span>
            <div className="flex items-center gap-2">
              <Button
                intent="ghost"
                type="button"
                disabled={halaman === 0}
                onClick={() => setHalaman((h) => Math.max(0, h - 1))}
              >
                Sebelumnya
              </Button>
              <span>
                {halaman + 1} / {totalHalaman}
              </span>
              <Button
                intent="ghost"
                type="button"
                disabled={halaman >= totalHalaman - 1}
                onClick={() => setHalaman((h) => Math.min(totalHalaman - 1, h + 1))}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </>
      )}

      {tambah ? <CreateDialog open onOpenChange={setTambah} /> : null}

      <Dialog open={edit !== null} onOpenChange={(open) => !open && setEdit(null)}>
        {edit ? <EditDialog key={edit.id} row={edit} onOpenChange={(open) => !open && setEdit(null)} /> : null}
      </Dialog>
    </div>
  );
}

"use client";

import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
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
  Textarea,
} from "@/components/ui";
import { formatRupiah } from "@/lib/utils";
import {
  AdminIngredientCreateSchema,
  type AdminIngredient,
  type AdminIngredientInput,
} from "@/schemas/admin";

const KATEGORI = ["Pokok", "Protein", "Sayur", "Buah", "Bumbu", "Susu", "Lainnya"];
const SLOT = [
  { value: "", label: "Tanpa slot" },
  { value: "pokok", label: "Pokok" },
  { value: "hewani", label: "Hewani" },
  { value: "nabati", label: "Nabati" },
  { value: "sayur", label: "Sayur" },
  { value: "buah", label: "Buah" },
  { value: "susu", label: "Susu" },
];

interface FormState {
  name: string;
  category: string;
  unit: string;
  description: string;
  mbgSlot: string;
  allergens: string;
  isLocal: boolean;
  isInSeason: boolean;
}

const emptyForm = (): FormState => ({
  name: "",
  category: "Pokok",
  unit: "kg",
  description: "",
  mbgSlot: "",
  allergens: "",
  isLocal: false,
  isInSeason: false,
});

const toForm = (item: AdminIngredient): FormState => ({
  name: item.name,
  category: item.category,
  unit: item.unit,
  description: item.description ?? "",
  mbgSlot: item.mbgSlot ?? "",
  allergens: item.allergens.join(", "),
  isLocal: item.isLocal,
  isInSeason: item.isInSeason,
});

async function simpan(url: string, method: "POST" | "PATCH", body: AdminIngredientInput) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(data?.message ?? "Gagal menyimpan bahan.");
  }
}

function IngredientDialog({
  item,
  onClose,
}: {
  readonly item: AdminIngredient | null;
  readonly onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(item ? toForm(item) : emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    const parsed = AdminIngredientCreateSchema.safeParse({
      name: form.name,
      category: form.category,
      unit: form.unit,
      description: form.description.trim() || null,
      isLocal: form.isLocal,
      isInSeason: form.isInSeason,
      mbgSlot: form.mbgSlot || null,
      allergens: form.allergens
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data belum valid.");
      return;
    }
    setLoading(true);
    try {
      await simpan(
        item ? `/api/admin/ingredients/${item.id}` : "/api/admin/ingredients",
        item ? "PATCH" : "POST",
        parsed.data,
      );
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan bahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Ubah Bahan" : "Tambah Bahan"}</DialogTitle>
          <DialogDescription>
            Perubahan bahan dan gizinya langsung dipakai mesin rekomendasi.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Nama bahan</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Kategori</Label>
            <Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {KATEGORI.map((value) => <option key={value}>{value}</option>)}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Satuan</Label>
            <Input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Slot MBG</Label>
            <Select value={form.mbgSlot} onChange={(event) => setForm({ ...form, mbgSlot: event.target.value })}>
              {SLOT.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Alergen (pisahkan koma)</Label>
            <Input
              value={form.allergens}
              placeholder="kedelai, susu"
              onChange={(event) => setForm({ ...form, allergens: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Deskripsi</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-brand-600"
              checked={form.isLocal}
              onChange={(event) => setForm({ ...form, isLocal: event.target.checked })}
            />
            Pangan lokal
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-brand-600"
              checked={form.isInSeason}
              onChange={(event) => setForm({ ...form, isInSeason: event.target.checked })}
            />
            Sedang musim
          </label>
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild><Button type="button" intent="ghost">Batal</Button></DialogClose>
          <Button type="button" onClick={submit} loading={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null} Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminIngredients({ items }: { readonly items: AdminIngredient[] }) {
  const router = useRouter();
  const [cari, setCari] = useState("");
  const [dialog, setDialog] = useState<AdminIngredient | null | undefined>(undefined);
  const [hapus, setHapus] = useState<string | null>(null);

  const rows = useMemo(() => {
    const key = cari.trim().toLowerCase();
    return items.filter((item) => !key || item.name.toLowerCase().includes(key));
  }, [items, cari]);

  const remove = async (item: AdminIngredient) => {
    if (
      !window.confirm(
        item.usedInMenus > 0
          ? `${item.name} dipakai di ${item.usedInMenus} menu dan tidak bisa dihapus. Hapus dari komposisi menu terlebih dahulu.`
          : `Hapus bahan ${item.name}?`,
      )
    ) {
      return;
    }
    setHapus(item.id);
    try {
      const response = await fetch(`/api/admin/ingredients/${item.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gagal menghapus bahan.");
      }
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus bahan.");
    } finally {
      setHapus(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            className="pl-9"
            value={cari}
            placeholder="Cari bahan…"
            onChange={(event) => setCari(event.target.value)}
          />
        </div>
        <Button type="button" onClick={() => setDialog(null)}>
          <Plus className="mr-2 size-4" /> Tambah Bahan
        </Button>
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase dark:bg-stone-800">
            <tr>
              <th className="px-4 py-2">Nama</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2">Satuan</th>
              <th className="px-3 py-2">Slot</th>
              <th className="px-3 py-2">Lokal</th>
              <th className="px-3 py-2">Musim</th>
              <th className="px-3 py-2 text-right">Dipakai di Menu</th>
              <th className="px-3 py-2 text-right">Harga Terakhir</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2">{item.category}</td>
                <td className="px-3 py-2">{item.unit}</td>
                <td className="px-3 py-2">{item.mbgSlot ?? "—"}</td>
                <td className="px-3 py-2">{item.isLocal ? "Ya" : "Tidak"}</td>
                <td className="px-3 py-2">{item.isInSeason ? "Ya" : "Tidak"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{item.usedInMenus}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {item.latestPrice > 0 ? formatRupiah(item.latestPrice) : "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-center gap-1">
                    <Button intent="ghost" size="sm" aria-label={`Ubah ${item.name}`} onClick={() => setDialog(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      intent="ghost"
                      size="sm"
                      aria-label={`Hapus ${item.name}`}
                      disabled={hapus === item.id}
                      onClick={() => void remove(item)}
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-stone-500">Tidak ada bahan.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-stone-500">Menampilkan {rows.length} dari {items.length} bahan.</p>

      {dialog !== undefined ? (
        <IngredientDialog item={dialog} onClose={() => setDialog(undefined)} />
      ) : null}
    </div>
  );
}

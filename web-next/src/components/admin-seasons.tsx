"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FieldError,
  Label,
  Select,
} from "@/components/ui";
import {
  AdminSeasonCreateSchema,
  type AdminIngredient,
  type AdminSeasonInput,
  type Season,
} from "@/schemas/admin";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const STATUS = [
  { value: "in_season", label: "Musim panen" },
  { value: "shoulder", label: "Peralihan" },
  { value: "off_season", label: "Luar musim" },
];

function DialogMusim({
  item,
  ingredients,
  onClose,
}: {
  readonly item: Season | null;
  readonly ingredients: AdminIngredient[];
  readonly onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<AdminSeasonInput>(
    item
      ? { ingredientId: item.ingredientId, month: item.month, status: item.status }
      : { ingredientId: Number(ingredients[0]?.id ?? 0), month: 1, status: "in_season" },
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const parsed = AdminSeasonCreateSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data belum valid.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        item ? `/api/admin/seasons/${item.id}` : "/api/admin/seasons",
        {
          method: item ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gagal menyimpan data musim.");
      }
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data musim.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{item ? "Ubah Musim" : "Tambah Musim"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="mb-1 block text-xs">Bahan</Label>
            <Select
              value={String(form.ingredientId)}
              onChange={(event) => setForm({ ...form, ingredientId: Number(event.target.value) })}
            >
              {ingredients.map((row) => (
                <option key={row.id} value={row.id}>{row.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Bulan</Label>
            <Select value={String(form.month)} onChange={(event) => setForm({ ...form, month: Number(event.target.value) })}>
              {BULAN.map((nama, index) => (
                <option key={nama} value={index + 1}>{nama}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Status</Label>
            <Select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as AdminSeasonInput["status"] })}
            >
              {STATUS.map((row) => <option key={row.value} value={row.value}>{row.label}</option>)}
            </Select>
          </div>
        </div>
        {error ? <FieldError>{error}</FieldError> : null}
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild><Button type="button" intent="ghost">Batal</Button></DialogClose>
          <Button type="button" onClick={submit} loading={loading}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminSeasons({
  items,
  ingredients,
}: {
  readonly items: Season[];
  readonly ingredients: AdminIngredient[];
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Season | null | undefined>(undefined);
  const [hapus, setHapus] = useState<string | null>(null);

  const remove = async (item: Season) => {
    if (!window.confirm(`Hapus musim ${item.commodity} bulan ${item.monthName}?`)) return;
    setHapus(item.id);
    try {
      const response = await fetch(`/api/admin/seasons/${item.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus data musim.");
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus data musim.");
    } finally {
      setHapus(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={() => setDialog(null)}>
          <Plus className="mr-2 size-4" /> Tambah Musim
        </Button>
      </div>
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase dark:bg-stone-800">
            <tr>
              <th className="px-4 py-2">Bahan</th>
              <th className="px-3 py-2">Bulan</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 font-medium">{item.commodity}</td>
                <td className="px-3 py-2">{item.monthName}</td>
                <td className="px-3 py-2">
                  {STATUS.find((row) => row.value === item.status)?.label ?? item.status}
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-center gap-1">
                    <Button intent="ghost" size="sm" aria-label="Ubah" onClick={() => setDialog(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button intent="ghost" size="sm" aria-label="Hapus" disabled={hapus === item.id} onClick={() => void remove(item)}>
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-500">Belum ada data musim.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-stone-500">Total {items.length} baris musim.</p>
      {dialog !== undefined ? (
        <DialogMusim item={dialog} ingredients={ingredients} onClose={() => setDialog(undefined)} />
      ) : null}
    </div>
  );
}

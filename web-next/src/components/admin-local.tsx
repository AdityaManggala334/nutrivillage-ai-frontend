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
  Input,
  Label,
  Select,
} from "@/components/ui";
import {
  AdminLocalCreateSchema,
  type AdminIngredient,
  type AdminLocalInput,
  type LocalCommodity,
} from "@/schemas/admin";

const LEVEL = [
  { value: "abundant", label: "Melimpah" },
  { value: "available", label: "Tersedia" },
  { value: "limited", label: "Terbatas" },
];

export interface RegionOption {
  readonly id: number;
  readonly name: string;
}

function DialogLokal({
  item,
  ingredients,
  regions,
  onClose,
}: {
  readonly item: LocalCommodity | null;
  readonly ingredients: AdminIngredient[];
  readonly regions: RegionOption[];
  readonly onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<AdminLocalInput>(
    item
      ? {
          ingredientId: item.ingredientId,
          regionId: item.regionId,
          level: item.levelCode,
          source: item.source || null,
        }
      : {
          ingredientId: Number(ingredients[0]?.id ?? 0),
          regionId: Number(regions[0]?.id ?? 0),
          level: "available",
          source: null,
        },
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const parsed = AdminLocalCreateSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data belum valid.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        item ? `/api/admin/local/${item.id}` : "/api/admin/local",
        {
          method: item ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gagal menyimpan komoditas lokal.");
      }
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan komoditas lokal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{item ? "Ubah Komoditas Lokal" : "Tambah Komoditas Lokal"}</DialogTitle></DialogHeader>
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
            <Label className="mb-1 block text-xs">Wilayah</Label>
            <Select
              value={String(form.regionId)}
              onChange={(event) => setForm({ ...form, regionId: Number(event.target.value) })}
            >
              {regions.map((row) => (
                <option key={row.id} value={row.id}>{row.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Tingkat ketersediaan</Label>
            <Select
              value={form.level}
              onChange={(event) => setForm({ ...form, level: event.target.value as AdminLocalInput["level"] })}
            >
              {LEVEL.map((row) => <option key={row.value} value={row.value}>{row.label}</option>)}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Sumber (opsional)</Label>
            <Input
              value={form.source ?? ""}
              placeholder="Survei pasar, dinas pertanian, …"
              onChange={(event) => setForm({ ...form, source: event.target.value.trim() || null })}
            />
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

export function AdminLocal({
  items,
  ingredients,
  regions,
}: {
  readonly items: LocalCommodity[];
  readonly ingredients: AdminIngredient[];
  readonly regions: RegionOption[];
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<LocalCommodity | null | undefined>(undefined);
  const [hapus, setHapus] = useState<string | null>(null);

  const remove = async (item: LocalCommodity) => {
    if (!window.confirm(`Hapus ${item.name} dari ${item.region}?`)) return;
    setHapus(item.id);
    try {
      const response = await fetch(`/api/admin/local/${item.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus komoditas lokal.");
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus komoditas lokal.");
    } finally {
      setHapus(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={() => setDialog(null)}>
          <Plus className="mr-2 size-4" /> Tambah Komoditas
        </Button>
      </div>
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase dark:bg-stone-800">
            <tr>
              <th className="px-4 py-2">Komoditas</th>
              <th className="px-3 py-2">Wilayah</th>
              <th className="px-3 py-2">Tingkat</th>
              <th className="px-3 py-2">Sumber</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2">{item.region}</td>
                <td className="px-3 py-2">{item.level}</td>
                <td className="px-3 py-2 text-stone-500">{item.source || "—"}</td>
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
              <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-500">Belum ada komoditas lokal.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-stone-500">Total {items.length} baris komoditas lokal.</p>
      {dialog !== undefined ? (
        <DialogLokal item={dialog} ingredients={ingredients} regions={regions} onClose={() => setDialog(undefined)} />
      ) : null}
    </div>
  );
}

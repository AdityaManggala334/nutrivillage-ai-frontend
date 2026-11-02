"use client";

import { Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
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
  AdminRecipeCreateSchema,
  type AdminIngredient,
  type AdminRecipe,
  type AdminRecipeInput,
  type FoodSafetyInfo,
} from "@/schemas/admin";

const KATEGORI = ["Makanan Utama", "Sayur", "Lauk", "Berkuah", "Camilan", "Minuman"];

interface Baris {
  ingredientId: string;
  name: string;
  quantity: string;
  unit: string;
  estimatedPrice: string;
  isPantry: boolean;
  note: string;
}

interface FormState {
  name: string;
  category: string;
  description: string;
  servings: string;
  cookingTimeMin: string;
  estimatedCost: string;
  mealKind: "hidangan" | "komponen";
  isLocal: boolean;
  inSeason: boolean;
  tags: string;
  steps: string;
  imageUrl: string;
  imageFileId: string;
  imageAlt: string;
  foodSafetyIds: number[];
  ingredients: Baris[];
}

const emptyBaris = (): Baris => ({
  ingredientId: "",
  name: "",
  quantity: "",
  unit: "kg",
  estimatedPrice: "0",
  isPantry: false,
  note: "",
});

const emptyForm = (): FormState => ({
  name: "",
  category: "Makanan Utama",
  description: "",
  servings: "4",
  cookingTimeMin: "30",
  estimatedCost: "0",
  mealKind: "komponen",
  isLocal: false,
  inSeason: false,
  tags: "",
  steps: "",
  imageUrl: "",
  imageFileId: "",
  imageAlt: "",
  foodSafetyIds: [],
  ingredients: [emptyBaris()],
});

const toForm = (item: AdminRecipe): FormState => ({
  name: item.name,
  category: item.category,
  description: item.description ?? "",
  servings: String(item.servings),
  cookingTimeMin: String(item.cookingTimeMin),
  estimatedCost: String(item.estimatedCost),
  mealKind: item.mealKind,
  isLocal: item.isLocal,
  inSeason: item.inSeason,
  tags: item.tags.join(", "),
  steps: item.steps.join("\n"),
  imageUrl: item.imageUrl ?? "",
  imageFileId: item.imageFileId ?? "",
  imageAlt: item.imageAlt ?? "",
  foodSafetyIds: item.foodSafety.map((entry) => entry.id),
  ingredients: item.ingredients.map((line) => ({
    ingredientId: line.ingredientId === null ? "" : String(line.ingredientId),
    name: line.name,
    quantity: String(line.quantity),
    unit: line.unit,
    estimatedPrice: String(line.estimatedPrice),
    isPantry: line.isPantry,
    note: line.note ?? "",
  })),
});

async function simpan(url: string, method: "POST" | "PATCH", body: AdminRecipeInput) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(data?.message ?? "Gagal menyimpan menu.");
  }
}

function RecipeDialog({
  item,
  ingredients,
  safetyEntries,
  onClose,
}: {
  readonly item: AdminRecipe | null;
  readonly ingredients: AdminIngredient[];
  readonly safetyEntries: FoodSafetyInfo[];
  readonly onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(item ? toForm(item) : emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const unggahGambar = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json().catch(() => null)) as {
        url?: string;
        fileId?: string;
        message?: string;
      } | null;
      if (!response.ok || !data?.url) throw new Error(data?.message ?? "Gagal mengunggah gambar.");
      setForm((current) => ({
        ...current,
        imageUrl: data.url ?? "",
        imageFileId: data.fileId ?? "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  };

  const ubahBaris = (index: number, patch: Partial<Baris>) =>
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((line, pos) =>
        pos === index ? { ...line, ...patch } : line,
      ),
    }));

  const pilihBahan = (index: number, id: string) => {
    const found = ingredients.find((row) => row.id === id);
    ubahBaris(index, {
      ingredientId: id,
      name: found?.name ?? "",
      unit: found?.unit ?? "kg",
    });
  };

  const submit = async () => {
    setError(null);
    const parsed = AdminRecipeCreateSchema.safeParse({
      name: form.name,
      category: form.category,
      description: form.description.trim() || null,
      servings: Number(form.servings),
      cookingTimeMin: Number(form.cookingTimeMin),
      steps: form.steps.split("\n").map((line) => line.trim()).filter(Boolean),
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      isLocal: form.isLocal,
      inSeason: form.inSeason,
      estimatedCost: Number(form.estimatedCost),
      mealKind: form.mealKind,
      imageUrl: form.imageUrl.trim() || null,
      imageFileId: form.imageFileId.trim() || null,
      imageAlt: form.imageAlt.trim() || null,
      foodSafetyIds: form.foodSafetyIds,
      ingredients: form.ingredients.map((line) => ({
        ingredientId: line.ingredientId ? Number(line.ingredientId) : null,
        name: line.name,
        quantity: Number(line.quantity),
        unit: line.unit,
        estimatedPrice: Number(line.estimatedPrice || 0),
        isPantry: line.isPantry,
        note: line.note.trim() || null,
      })),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data belum valid.");
      return;
    }
    setLoading(true);
    try {
      await simpan(
        item ? `/api/admin/recipes/${item.id}` : "/api/admin/recipes",
        item ? "PATCH" : "POST",
        parsed.data,
      );
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan menu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{item ? "Ubah Menu" : "Tambah Menu"}</DialogTitle>
          <DialogDescription>
            Komposisi bahan menentukan gizi menu. Simpan dan gizi dihitung ulang otomatis.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label className="mb-1 block text-xs">Nama menu</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Kategori</Label>
            <Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {KATEGORI.map((value) => <option key={value}>{value}</option>)}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Porsi</Label>
            <Input type="number" min={1} value={form.servings} onChange={(event) => setForm({ ...form, servings: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Waktu masak (menit)</Label>
            <Input type="number" min={1} value={form.cookingTimeMin} onChange={(event) => setForm({ ...form, cookingTimeMin: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Estimasi biaya (Rp)</Label>
            <Input type="number" min={0} value={form.estimatedCost} onChange={(event) => setForm({ ...form, estimatedCost: event.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Jenis</Label>
            <Select
              value={form.mealKind}
              onChange={(event) => setForm({ ...form, mealKind: event.target.value as "hidangan" | "komponen" })}
            >
              <option value="komponen">Komponen</option>
              <option value="hidangan">Hidangan</option>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Tag (pisahkan koma)</Label>
            <Input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
          </div>
          <div className="sm:col-span-3">
            <Label className="mb-1 block text-xs">Gambar menu</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void unggahGambar(file);
                }}
              />
              {uploading ? <span className="text-xs text-stone-500">Mengunggah…</span> : null}
              {form.imageUrl ? (
                <a href={form.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-700 underline">
                  Lihat gambar
                </a>
              ) : null}
            </div>
            {form.imageUrl ? (
              <Input
                className="mt-2"
                value={form.imageAlt}
                placeholder="Teks alternatif gambar (aksesibilitas)"
                onChange={(event) => setForm({ ...form, imageAlt: event.target.value })}
              />
            ) : null}
          </div>
          <div className="sm:col-span-3">
            <Label className="mb-1 block text-xs">Catatan keamanan pangan</Label>
            <div className="flex flex-wrap gap-3">
              {safetyEntries.map((entry) => {
                const active = form.foodSafetyIds.includes(Number(entry.id));
                return (
                  <label key={entry.id} className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      className="size-4 accent-brand-600"
                      checked={active}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          foodSafetyIds: active
                            ? current.foodSafetyIds.filter((id) => id !== Number(entry.id))
                            : [...current.foodSafetyIds, Number(entry.id)],
                        }))
                      }
                    />
                    {entry.topic}
                    <span className="text-stone-400">({entry.verification})</span>
                  </label>
                );
              })}
              {safetyEntries.length === 0 ? (
                <span className="text-xs text-stone-500">Belum ada catatan keamanan pangan.</span>
              ) : null}
            </div>
          </div>
          <div className="sm:col-span-3">
            <Label className="mb-1 block text-xs">Deskripsi</Label>
            <Textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </div>
          <div className="sm:col-span-3">
            <Label className="mb-1 block text-xs">Langkah memasak (satu per baris)</Label>
            <Textarea rows={3} value={form.steps} onChange={(event) => setForm({ ...form, steps: event.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-brand-600" checked={form.isLocal} onChange={(event) => setForm({ ...form, isLocal: event.target.checked })} />
            Pangan lokal
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-brand-600" checked={form.inSeason} onChange={(event) => setForm({ ...form, inSeason: event.target.checked })} />
            Sedang musim
          </label>
        </div>

        <h4 className="mt-4 mb-2 text-sm font-semibold">Komposisi bahan</h4>
        <div className="space-y-2">
          {form.ingredients.map((line, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-stone-200 p-2 sm:grid-cols-12 dark:border-stone-700">
              <div className="sm:col-span-5">
                <Select value={line.ingredientId} onChange={(event) => pilihBahan(index, event.target.value)}>
                  <option value="">Pilih bahan…</option>
                  {ingredients.map((row) => (
                    <option key={row.id} value={row.id}>{row.name}</option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Input type="number" min={0} step="0.01" placeholder="Jumlah" value={line.quantity} onChange={(event) => ubahBaris(index, { quantity: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Input placeholder="satuan" value={line.unit} onChange={(event) => ubahBaris(index, { unit: event.target.value })} />
              </div>
              <div className="sm:col-span-2 flex items-center">
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" className="size-4 accent-brand-600" checked={line.isPantry} onChange={(event) => ubahBaris(index, { isPantry: event.target.checked })} />
                  Pantry
                </label>
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <Button
                  type="button"
                  intent="ghost"
                  size="sm"
                  aria-label="Hapus baris bahan"
                  disabled={form.ingredients.length === 1}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      ingredients: current.ingredients.filter((_, pos) => pos !== index),
                    }))
                  }
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" intent="secondary" size="sm" className="mt-2" onClick={() => setForm((current) => ({ ...current, ingredients: [...current.ingredients, emptyBaris()] }))}>
          <Plus className="size-4" /> Tambah bahan
        </Button>

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

export function AdminRecipes({
  items,
  ingredients,
  safetyEntries,
}: {
  readonly items: AdminRecipe[];
  readonly ingredients: AdminIngredient[];
  readonly safetyEntries: FoodSafetyInfo[];
}) {
  const router = useRouter();
  const [cari, setCari] = useState("");
  const [dialog, setDialog] = useState<AdminRecipe | null | undefined>(undefined);
  const [hapus, setHapus] = useState<string | null>(null);

  const rows = useMemo(() => {
    const key = cari.trim().toLowerCase();
    return items.filter((item) => !key || item.name.toLowerCase().includes(key));
  }, [items, cari]);

  const remove = async (item: AdminRecipe) => {
    if (!window.confirm(`Hapus menu ${item.name}?`)) return;
    setHapus(item.id);
    try {
      const response = await fetch(`/api/admin/recipes/${item.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gagal menghapus menu.");
      }
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus menu.");
    } finally {
      setHapus(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <Input className="pl-9" value={cari} placeholder="Cari menu…" onChange={(event) => setCari(event.target.value)} />
        </div>
        <Button type="button" onClick={() => setDialog(null)}>
          <Plus className="mr-2 size-4" /> Tambah Menu
        </Button>
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase dark:bg-stone-800">
            <tr>
              <th className="px-4 py-2">Nama Menu</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2">Porsi</th>
              <th className="px-3 py-2">Bahan</th>
              <th className="px-3 py-2 text-right">Estimasi Biaya</th>
              <th className="px-3 py-2">Lokal</th>
              <th className="px-3 py-2">Musim</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2">{item.category}</td>
                <td className="px-3 py-2">{item.servings}</td>
                <td className="px-3 py-2">{item.ingredients.length}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatRupiah(item.estimatedCost)}</td>
                <td className="px-3 py-2">{item.isLocal ? "Ya" : "Tidak"}</td>
                <td className="px-3 py-2">{item.inSeason ? "Ya" : "Tidak"}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-center gap-1">
                    <Button intent="ghost" size="sm" aria-label={`Ubah ${item.name}`} onClick={() => setDialog(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button intent="ghost" size="sm" aria-label={`Hapus ${item.name}`} disabled={hapus === item.id} onClick={() => void remove(item)}>
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-stone-500">Tidak ada menu.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-stone-500">Menampilkan {rows.length} dari {items.length} menu.</p>

      {dialog !== undefined ? (
        <RecipeDialog
          item={dialog}
          ingredients={ingredients}
          safetyEntries={safetyEntries}
          onClose={() => setDialog(undefined)}
        />
      ) : null}
    </div>
  );
}

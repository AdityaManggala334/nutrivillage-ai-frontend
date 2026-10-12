"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { AdminCell, AdminPageHeader, AdminTable } from "@/components/admin-table";
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, FieldError, Input, Label, Select, Textarea } from "@/components/ui";
import { useMasterCreate, useMasterDelete, useMasterList, useMasterUpdate, type MasterRow } from "@/hooks/use-master";
import { formatRupiah } from "@/lib/utils";

const RECIPE_CATEGORIES = ["Makanan Utama", "Sayur", "Lauk", "Berkuah", "Camilan", "Minuman"];

interface IngredientRow {
  ingredient_id: number | null;
  name: string;
  quantity: number;
  unit: string;
  estimated_price: number;
}

interface RecipeForm {
  name: string;
  category: string;
  description: string;
  servings: number;
  cooking_time_min: number;
  estimated_cost: number;
  is_local: boolean;
  in_season: boolean;
  is_vegetarian: boolean;
  tags: string;
  steps: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  ingredients: IngredientRow[];
}

const EMPTY: RecipeForm = {
  name: "",
  category: "Makanan Utama",
  description: "",
  servings: 4,
  cooking_time_min: 30,
  estimated_cost: 0,
  is_local: true,
  in_season: true,
  is_vegetarian: false,
  tags: "",
  steps: "",
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fat: 0,
  fiber: 0,
  ingredients: [],
};

function rowToForm(row: MasterRow): RecipeForm {
  const nutrition = (row.nutrition ?? {}) as Record<string, unknown>;
  const ingredients = (row.ingredients ?? []) as MasterRow[];
  return {
    name: String(row.name ?? ""),
    category: String(row.category ?? "Makanan Utama"),
    description: String(row.description ?? ""),
    servings: Number(row.servings ?? 4),
    cooking_time_min: Number(row.cooking_time_min ?? 30),
    estimated_cost: Number(row.estimated_cost ?? 0),
    is_local: Boolean(row.is_local),
    in_season: Boolean(row.in_season),
    is_vegetarian: Boolean(row.is_vegetarian),
    tags: Array.isArray(row.tags) ? (row.tags as string[]).join(", ") : "",
    steps: Array.isArray(row.steps) ? (row.steps as string[]).join("\n") : "",
    calories: Number(nutrition.calories ?? 0),
    protein: Number(nutrition.protein ?? 0),
    carbohydrates: Number(nutrition.carbohydrates ?? 0),
    fat: Number(nutrition.fat ?? 0),
    fiber: Number(nutrition.fiber ?? 0),
    ingredients: ingredients.map((i) => ({
      ingredient_id: i.ingredient_id == null ? null : Number(i.ingredient_id),
      name: String(i.name ?? ""),
      quantity: Number(i.quantity ?? 0),
      unit: String(i.unit ?? "kg"),
      estimated_price: Number(i.estimated_price ?? 0),
    })),
  };
}

function formToBody(form: RecipeForm) {
  return {
    name: form.name,
    category: form.category,
    description: form.description || null,
    servings: Number(form.servings),
    cooking_time_min: Number(form.cooking_time_min),
    estimated_cost: Number(form.estimated_cost),
    is_local: form.is_local,
    in_season: form.in_season,
    is_vegetarian: form.is_vegetarian,
    tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
    steps: form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
    ingredients: form.ingredients
      .filter((i) => i.name.trim().length > 0)
      .map((i) => ({
        ingredient_id: i.ingredient_id,
        name: i.name,
        quantity: Number(i.quantity),
        unit: i.unit,
        estimated_price: Number(i.estimated_price),
        is_pantry: false,
      })),
    nutrition: {
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbohydrates: Number(form.carbohydrates),
      fat: Number(form.fat),
      fiber: Number(form.fiber),
    },
  };
}

export function AdminRecipeManager() {
  const listQuery = useMasterList("recipes");
  const ingredientsQuery = useMasterList("ingredients");
  const createMutation = useMasterCreate("recipes");
  const updateMutation = useMasterUpdate("recipes");
  const deleteMutation = useMasterDelete("recipes");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRow | null>(null);
  const [form, setForm] = useState<RecipeForm>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const ingredients = ingredientsQuery.data ?? [];

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, ingredients: [] });
    setError(null);
    setOpen(true);
  }

  function openEdit(row: MasterRow) {
    setEditing(row);
    setForm(rowToForm(row));
    setError(null);
    setOpen(true);
  }

  function patch(next: Partial<RecipeForm>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  function patchIngredient(index: number, next: Partial<IngredientRow>) {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) => (i === index ? { ...item, ...next } : item)),
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (form.name.trim().length < 1) {
      setError("Nama menu wajib diisi.");
      return;
    }
    try {
      const body = formToBody(form);
      if (editing) {
        await updateMutation.mutateAsync({ id: Number(editing.id), body });
      } else {
        await createMutation.mutateAsync(body);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan menu.");
    }
  }

  async function remove(row: MasterRow) {
    if (!window.confirm("Hapus menu ini?")) return;
    try {
      await deleteMutation.mutateAsync(Number(row.id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus.");
    }
  }

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div>
      <AdminPageHeader
        title="Menu & Resep"
        description="Kelola menu, komposisi bahan, langkah memasak, dan kandungan gizi."
        action={
          <Button intent="primary" size="sm" onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" /> Tambah
          </Button>
        }
      />

      {listQuery.isLoading ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-stone-500">Memuat data…</p>
      ) : listQuery.isError ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-red-600">
          {listQuery.error instanceof Error ? listQuery.error.message : "Gagal memuat data."}
        </p>
      ) : (listQuery.data ?? []).length === 0 ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-stone-500">Belum ada menu.</p>
      ) : (
        <AdminTable headers={["Nama", "Kategori", "Porsi", "Komposisi", "Estimasi Biaya", "Aksi"]}>
          {(listQuery.data ?? []).map((row) => (
            <tr key={String(row.id)} className="transition hover:bg-stone-50 dark:hover:bg-stone-800/40">
              <AdminCell className="font-medium">{String(row.name)}</AdminCell>
              <AdminCell><Badge tone="neutral">{String(row.category)}</Badge></AdminCell>
              <AdminCell>{String(row.servings)} porsi</AdminCell>
              <AdminCell>{((row.ingredients ?? []) as unknown[]).length} bahan</AdminCell>
              <AdminCell>{formatRupiah(Number(row.estimated_cost ?? 0))}</AdminCell>
              <AdminCell>
                <div className="flex items-center justify-center gap-1">
                  <Button intent="ghost" size="sm" className="text-xs" onClick={() => openEdit(row)}>
                    <Pencil className="size-3.5" aria-hidden="true" /> Ubah
                  </Button>
                  <Button intent="ghost" size="icon" className="size-8 text-red-600" aria-label="Hapus" onClick={() => remove(row)} disabled={busy}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </AdminCell>
            </tr>
          ))}
        </AdminTable>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah" : "Tambah"} Menu</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="r-name">Nama menu</Label>
                <Input id="r-name" value={form.name} onChange={(e) => patch({ name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="r-cat">Kategori</Label>
                <Select id="r-cat" value={form.category} onChange={(e) => patch({ category: e.target.value })}>
                  {RECIPE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="r-serv">Jumlah porsi</Label>
                <Input id="r-serv" type="number" min={1} value={form.servings} onChange={(e) => patch({ servings: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="r-time">Waktu masak (menit)</Label>
                <Input id="r-time" type="number" min={1} value={form.cooking_time_min} onChange={(e) => patch({ cooking_time_min: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="r-cost">Estimasi biaya (Rp)</Label>
                <Input id="r-cost" type="number" min={0} value={form.estimated_cost} onChange={(e) => patch({ estimated_cost: Number(e.target.value) })} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="r-desc">Deskripsi</Label>
                <Textarea id="r-desc" value={form.description} onChange={(e) => patch({ description: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="r-tags">Tag (pisahkan koma)</Label>
                <Input id="r-tags" value={form.tags} onChange={(e) => patch({ tags: e.target.value })} placeholder="sayur, hemat" />
              </div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_local} onChange={(e) => patch({ is_local: e.target.checked })} /> Lokal</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.in_season} onChange={(e) => patch({ in_season: e.target.checked })} /> Musim</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_vegetarian} onChange={(e) => patch({ is_vegetarian: e.target.checked })} /> Vegetarian</label>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="r-steps">Langkah memasak (satu per baris)</Label>
                <Textarea id="r-steps" value={form.steps} onChange={(e) => patch({ steps: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-stone-200 p-3 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <Label>Komposisi bahan</Label>
                <Button type="button" intent="ghost" size="sm" onClick={() => patch({ ingredients: [...form.ingredients, { ingredient_id: null, name: "", quantity: 0.1, unit: "kg", estimated_price: 0 }] })}>
                  <Plus className="size-3.5" /> Bahan
                </Button>
              </div>
              {form.ingredients.length === 0 ? (
                <p className="text-xs text-stone-400">Belum ada bahan.</p>
              ) : (
                form.ingredients.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[140px] flex-1 space-y-1">
                      <Select
                        value={item.ingredient_id == null ? "" : String(item.ingredient_id)}
                        onChange={(e) => {
                          const id = e.target.value === "" ? null : Number(e.target.value);
                          const found = ingredients.find((i) => Number(i.id) === id);
                          patchIngredient(index, { ingredient_id: id, name: found ? String(found.name) : item.name });
                        }}
                      >
                        <option value="">— pilih bahan —</option>
                        {ingredients.map((i) => <option key={String(i.id)} value={String(i.id)}>{String(i.name)}</option>)}
                      </Select>
                    </div>
                    <Input className="w-20" type="number" step="any" value={item.quantity} onChange={(e) => patchIngredient(index, { quantity: Number(e.target.value) })} aria-label="Jumlah" />
                    <Input className="w-16" value={item.unit} onChange={(e) => patchIngredient(index, { unit: e.target.value })} aria-label="Satuan" />
                    <Input className="w-24" type="number" value={item.estimated_price} onChange={(e) => patchIngredient(index, { estimated_price: Number(e.target.value) })} aria-label="Harga" />
                    <Button type="button" intent="ghost" size="icon" className="size-8 text-red-600" aria-label="Hapus bahan" onClick={() => patch({ ingredients: form.ingredients.filter((_, i) => i !== index) })}>
                      <X className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 rounded-xl border border-stone-200 p-3 dark:border-stone-700">
              <Label>Kandungan gizi (per resep)</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <div className="space-y-1"><Label htmlFor="n-cal" className="text-xs">Kalori</Label><Input id="n-cal" type="number" value={form.calories} onChange={(e) => patch({ calories: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label htmlFor="n-pro" className="text-xs">Protein</Label><Input id="n-pro" type="number" value={form.protein} onChange={(e) => patch({ protein: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label htmlFor="n-car" className="text-xs">Karbo</Label><Input id="n-car" type="number" value={form.carbohydrates} onChange={(e) => patch({ carbohydrates: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label htmlFor="n-fat" className="text-xs">Lemak</Label><Input id="n-fat" type="number" value={form.fat} onChange={(e) => patch({ fat: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label htmlFor="n-fib" className="text-xs">Serat</Label><Input id="n-fib" type="number" value={form.fiber} onChange={(e) => patch({ fiber: Number(e.target.value) })} /></div>
              </div>
            </div>

            <FieldError>{error}</FieldError>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" intent="ghost" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" intent="primary" loading={busy}>Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

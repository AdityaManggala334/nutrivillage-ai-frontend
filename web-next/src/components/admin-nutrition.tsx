"use client";

import { Loader2, Pencil, Search, Upload } from "lucide-react";
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
  Input,
  Label,
  Select,
} from "@/components/ui";
import { useAdminNutrition, useUpdateNutritionMutation } from "@/hooks/use-admin-nutrition";
import { formatRupiah } from "@/lib/utils";
import {
  NutritionRowUpdateSchema,
  type MbgSlot,
  type NutritionRow,
  type NutritionRowUpdate,
} from "@/schemas/admin";

const PAGE_SIZE = 50;

const SLOT_LABELS: Readonly<Record<MbgSlot, string>> = {
  pokok: "Pokok",
  hewani: "Hewani",
  nabati: "Nabati",
  sayur: "Sayur",
  buah: "Buah",
  susu: "Susu",
};

const CATEGORIES = ["Pokok", "Protein", "Sayur", "Buah", "Bumbu", "Susu", "Lainnya"];

/** Kolom gizi yang boleh disunting. Urutan = urutan tampil di tabel & dialog. */
const NUTRISI = [
  { key: "calories", label: "Energi", unit: "kkal", step: 1 },
  { key: "protein", label: "Protein", unit: "g", step: 0.1 },
  { key: "fat", label: "Lemak", unit: "g", step: 0.1 },
  { key: "carbs", label: "Karbohidrat", unit: "g", step: 0.1 },
  { key: "fiber", label: "Serat", unit: "g", step: 0.1 },
  { key: "sugarG", label: "Gula", unit: "g", step: 0.1 },
  { key: "sodiumMg", label: "Natrium", unit: "mg", step: 1 },
  { key: "calciumMg", label: "Kalsium", unit: "mg", step: 1 },
  { key: "ironMg", label: "Besi", unit: "mg", step: 0.1 },
  { key: "vitaminAMcg", label: "Vit. A", unit: "µg", step: 1 },
  { key: "vitaminCMcg", label: "Vit. C", unit: "mg", step: 0.1 },
  { key: "bddPercent", label: "BDD", unit: "%", step: 1 },
] as const;

type NutritionKey = (typeof NUTRISI)[number]["key"];

const angka = (value: number): string =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);

function NumberField({
  label,
  unit,
  value,
  step,
  onChange,
}: {
  readonly label: string;
  readonly unit: string;
  readonly value: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label className="mb-1 block text-xs">
        {label} <span className="text-stone-400">({unit})</span>
      </Label>
      <Input
        type="number"
        min={0}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function EditDialog({
  row,
  open,
  onOpenChange,
}: {
  readonly row: NutritionRow;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const mutation = useUpdateNutritionMutation();
  const [form, setForm] = useState<NutritionRowUpdate>({
    name: row.name,
    category: row.category,
    unit: row.unit,
    mbgSlot: row.mbgSlot,
    allergens: row.allergens,
    pricePerKg: row.pricePerKg,
    nutrition: {
      calories: row.nutrition?.calories ?? 0,
      protein: row.nutrition?.protein ?? 0,
      carbs: row.nutrition?.carbs ?? 0,
      fat: row.nutrition?.fat ?? 0,
      fiber: row.nutrition?.fiber ?? 0,
      bddPercent: row.nutrition?.bddPercent ?? 100,
      calciumMg: row.nutrition?.calciumMg ?? 0,
      ironMg: row.nutrition?.ironMg ?? 0,
      vitaminAMcg: row.nutrition?.vitaminAMcg ?? 0,
      vitaminCMcg: row.nutrition?.vitaminCMcg ?? 0,
      sugarG: row.nutrition?.sugarG ?? 0,
      sodiumMg: row.nutrition?.sodiumMg ?? 0,
      source: row.nutrition?.source ?? "TKPI Kemenkes RI",
    },
  });
  const [allergenText, setAllergenText] = useState(row.allergens.join(", "));
  const [error, setError] = useState<string | null>(null);

  const setGizi = (key: NutritionKey, value: number) =>
    setForm((prev) => ({ ...prev, nutrition: { ...prev.nutrition, [key]: value } }));

  const handleSave = () => {
    setError(null);
    const parsed = NutritionRowUpdateSchema.safeParse({
      ...form,
      allergens: allergenText
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Data belum valid.");
      return;
    }
    mutation.mutate(
      { id: row.ingredientId, input: parsed.data },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err: unknown) =>
          setError(err instanceof Error ? err.message : "Gagal menyimpan."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{row.name}</DialogTitle>
          <DialogDescription>
            Nilai gizi per 100 g bahan. Perubahan langsung dipakai mesin rekomendasi;
            gizi tiap menu dihitung ulang otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block text-xs">Nama bahan</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Kategori</Label>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Satuan beli</Label>
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Slot MBG</Label>
            <Select
              value={form.mbgSlot ?? ""}
              onChange={(e) =>
                setForm({ ...form, mbgSlot: (e.target.value || null) as MbgSlot | null })
              }
            >
              <option value="">Tidak masuk slot</option>
              {Object.entries(SLOT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Alergen (pisah koma)</Label>
            <Input
              value={allergenText}
              placeholder="kedelai, kacang"
              onChange={(e) => setAllergenText(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Harga (Rp per kg)</Label>
            <Input
              type="number"
              min={0}
              step={500}
              value={form.pricePerKg ?? ""}
              placeholder="belum ada harga"
              onChange={(e) =>
                setForm({
                  ...form,
                  pricePerKg: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
          Kandungan gizi per 100 g
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {NUTRISI.map((item) => (
            <NumberField
              key={item.key}
              label={item.label}
              unit={item.unit}
              step={item.step}
              value={form.nutrition[item.key]}
              onChange={(value) => setGizi(item.key, value)}
            />
          ))}
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild>
            <Button intent="ghost" type="button">
              Batal
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportPanel({ onDone }: { readonly onDone: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [region, setRegion] = useState("Kabupaten Madiun");
  const [report, setReport] = useState<{
    readonly jumlah_error: number;
    readonly dibuat: Record<string, number>;
    readonly diperbarui: Record<string, number>;
    readonly error: ReadonlyArray<{ berkas: string; baris: number; pesan: string }>;
    readonly dry_run?: boolean;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kirim = async (terapkan: boolean) => {
    setError(null);
    setPending(true);
    try {
      const form = new FormData();
      for (const file of files) form.append("berkas", file);
      form.append("region", region);
      form.append("terapkan", String(terapkan));
      const response = await fetch("/api/admin/import", { method: "POST", body: form });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error((body as { message?: string }).message ?? "Impor gagal.");
      setReport(body as typeof report);
      if (terapkan) onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impor gagal.");
    } finally {
      setPending(false);
    }
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Impor dataset CSV</DialogTitle>
        <DialogDescription>
          Unggah berkas yang diawali 01_menu, 02_bahan, 03_resep, 04_harga, 05_akg,
          06_musim, 07_alergen, dan 10_antropometri. Impor ulang memperbarui data,
          bukan menduplikasi.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <div>
          <Label className="mb-1 block text-xs">Wilayah acuan harga</Label>
          <Input value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1 block text-xs">Berkas CSV</Label>
          <Input
            type="file"
            accept=".csv"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </div>
      </div>
      {report ? (
        <div className="mt-3 rounded-xl bg-stone-100 p-3 text-sm dark:bg-stone-800">
          <p className="font-semibold">
            {report.dry_run ? "Pratinjau" : "Diterapkan"} · {report.jumlah_error} baris bermasalah
          </p>
          <p className="text-stone-600 dark:text-stone-300">
            Dibuat: {Object.entries(report.dibuat).map(([k, v]) => `${k} ${v}`).join(", ") || "—"}
            <br />
            Diperbarui:{" "}
            {Object.entries(report.diperbarui).map(([k, v]) => `${k} ${v}`).join(", ") || "—"}
          </p>
          {report.error.slice(0, 5).map((item) => (
            <p key={`${item.berkas}-${item.baris}`} className="mt-1 text-red-600">
              {item.berkas} baris {item.baris}: {item.pesan}
            </p>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button
          intent="ghost"
          type="button"
          disabled={pending || files.length === 0}
          onClick={() => void kirim(false)}
        >
          Pratinjau
        </Button>
        <Button
          type="button"
          disabled={pending || files.length === 0 || Boolean(report && report.jumlah_error)}
          onClick={() => void kirim(true)}
        >
          {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Terapkan
        </Button>
      </div>
    </DialogContent>
  );
}

export function AdminNutrition() {
  const { data, isLoading, isError, error, refetch } = useAdminNutrition();
  const [cari, setCari] = useState("");
  const [hanyaDipakai, setHanyaDipakai] = useState(true);
  const [halaman, setHalaman] = useState(0);
  const [edit, setEdit] = useState<NutritionRow | null>(null);
  const [imporTerbuka, setImporTerbuka] = useState(false);

  const baris = useMemo(() => {
    const daftar = data ?? [];
    const kunci = cari.trim().toLowerCase();
    return daftar.filter(
      (row) =>
        (!hanyaDipakai || row.usedInMenus > 0) &&
        (!kunci || row.name.toLowerCase().includes(kunci)),
    );
  }, [data, cari, hanyaDipakai]);

  const totalHalaman = Math.max(1, Math.ceil(baris.length / PAGE_SIZE));
  const tampil = baris.slice(halaman * PAGE_SIZE, (halaman + 1) * PAGE_SIZE);
  const dipakaiMesin = (data ?? []).filter((row) => row.usedInMenus > 0).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={cari}
            placeholder="Cari bahan…"
            className="pl-9"
            onChange={(e) => {
              setCari(e.target.value);
              setHalaman(0);
            }}
          />
        </div>
        <Button
          intent={hanyaDipakai ? "primary" : "ghost"}
          type="button"
          onClick={() => {
            setHanyaDipakai(true);
            setHalaman(0);
          }}
        >
          Dipakai mesin ({dipakaiMesin})
        </Button>
        <Button
          intent={hanyaDipakai ? "ghost" : "primary"}
          type="button"
          onClick={() => {
            setHanyaDipakai(false);
            setHalaman(0);
          }}
        >
          Semua bahan ({data?.length ?? 0})
        </Button>
        <Button type="button" onClick={() => setImporTerbuka(true)}>
          <Upload className="mr-2 size-4" /> Impor CSV
        </Button>
      </div>

      {isLoading ? (
        <p className="flex items-center gap-2 py-8 text-sm text-stone-500">
          <Loader2 className="size-4 animate-spin" /> Memuat data gizi…
        </p>
      ) : isError ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40">
          <p>{error instanceof Error ? error.message : "Gagal memuat data."}</p>
          <Button intent="ghost" type="button" className="mt-2" onClick={() => void refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : (
        <>
          <div className="glass overflow-hidden rounded-2xl">
            <div className="max-h-[70vh] overflow-auto">
              <table className="min-w-[1600px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-20 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase dark:bg-stone-800">
                  <tr>
                    <th className="sticky left-0 z-30 min-w-[220px] bg-stone-50 px-4 py-2 dark:bg-stone-800">
                      Bahan
                    </th>
                    <th className="px-3 py-2">Kategori</th>
                    <th className="px-3 py-2">Slot MBG</th>
                    <th className="px-3 py-2">Alergen</th>
                    {NUTRISI.map((item) => (
                      <th key={item.key} className="px-3 py-2 text-right whitespace-nowrap">
                        {item.label} <span className="text-stone-400">({item.unit})</span>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right">Harga/kg</th>
                    <th className="px-3 py-2 text-center">Menu</th>
                    <th className="px-3 py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {tampil.map((row) => (
                    <tr key={row.ingredientId} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                      <td className="sticky left-0 z-10 min-w-[220px] bg-white px-4 py-2 dark:bg-stone-900">
                        <span className="font-medium text-stone-800 dark:text-stone-100">
                          {row.name}
                        </span>
                        <span className="ml-2 text-xs text-stone-400">{row.code}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.category}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {row.mbgSlot ? SLOT_LABELS[row.mbgSlot] : "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {row.allergens.length ? (
                          <span className="text-stone-600 dark:text-stone-300">
                            {row.allergens.join(", ")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      {NUTRISI.map((item) => (
                        <td key={item.key} className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                          {row.nutrition ? angka(row.nutrition[item.key]) : "—"}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                        {row.pricePerKg ? formatRupiah(row.pricePerKg) : (
                          <Badge tone="danger">Belum ada</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {row.usedInMenus > 0 ? (
                          <Badge tone="brand">{row.usedInMenus}</Badge>
                        ) : (
                          <span className="text-xs text-stone-400">tidak dipakai</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button intent="ghost" type="button" onClick={() => setEdit(row)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Ubah {row.name}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {tampil.length === 0 ? (
                    <tr>
                      <td colSpan={NUTRISI.length + 7} className="px-4 py-8 text-center text-stone-500">
                        Tidak ada bahan yang cocok.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-stone-500">
            <span>
              Menampilkan {tampil.length} dari {baris.length} bahan
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

      <Dialog open={edit !== null} onOpenChange={(open) => !open && setEdit(null)}>
        {edit ? (
          <EditDialog key={edit.ingredientId} row={edit} open onOpenChange={(open) => !open && setEdit(null)} />
        ) : null}
      </Dialog>

      <Dialog open={imporTerbuka} onOpenChange={setImporTerbuka}>
        {imporTerbuka ? (
          <ImportPanel onDone={() => void refetch()} />
        ) : null}
      </Dialog>
    </div>
  );
}

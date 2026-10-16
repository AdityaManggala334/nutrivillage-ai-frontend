"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { AdminFoodSafetyActions } from "@/components/admin-food-safety-actions";
import { AdminPriceActions } from "@/components/admin-price-actions";
import {
  AdminCell,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTable,
  type AdminStatus,
} from "@/components/admin-table";
import { Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, FieldError, Input, Label, Select, Textarea } from "@/components/ui";
import {
  useMasterCreate,
  useMasterDelete,
  useMasterList,
  useMasterUpdate,
  type MasterResource,
  type MasterRow,
} from "@/hooks/use-master";
import { formatDateId, formatRupiah } from "@/lib/utils";
import type { FoodSafetyVerification, PriceStatus } from "@/schemas/admin";

/* ------------------------------------------------------------------ */
/* Label bantu                                                         */
/* ------------------------------------------------------------------ */
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const INGREDIENT_CATEGORIES = ["Pokok", "Protein", "Sayur", "Buah", "Bumbu", "Susu", "Lainnya"];
const SEASONAL_STATUS: Record<string, string> = {
  in_season: "Musim",
  shoulder: "Peralihan",
  off_season: "Luar Musim",
};
const LOCAL_LEVEL: Record<string, string> = {
  abundant: "Melimpah",
  available: "Tersedia",
  limited: "Terbatas",
};
const ARTICLE_CATEGORIES = ["Gizi Dasar", "Pangan Lokal", "Tips Hemat", "Kesehatan"];
const FOOD_SAFETY_VERIFICATION: Record<string, string> = {
  pending: "Menunggu verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

type Ctx = {
  readonly ingredientName: (id: unknown) => string;
  readonly regionName: (id: unknown) => string;
  readonly ingredients: MasterRow[];
  readonly regions: MasterRow[];
};

type Field = {
  readonly name: string;
  readonly label: string;
  readonly type: "text" | "number" | "textarea" | "select" | "checkbox" | "list" | "date";
  readonly options?: readonly { value: string; label: string }[];
  readonly required?: boolean;
  readonly placeholder?: string;
  readonly help?: string;
};

interface FlatConfig {
  readonly title: string;
  readonly description: string;
  readonly columns: readonly { readonly header: string; readonly render: (row: MasterRow, ctx: Ctx) => ReactNode }[];
  readonly fields: readonly Field[];
  readonly empty: Record<string, unknown>;
  readonly idOf: (row: MasterRow) => number | string;
  /** true = create/update memakai PUT (upsert), mis. nutrisi. */
  readonly upsert?: boolean;
  /** Aksi tambahan di kolom Aksi (mis. tombol verifikasi harga). */
  readonly extraActions?: (row: MasterRow, ctx: Ctx) => ReactNode;
}

function checkboxCell(value: unknown): ReactNode {
  return value ? <Badge tone="brand">Ya</Badge> : <span className="text-stone-400">Tidak</span>;
}

const FLAT_CONFIG: Partial<Record<MasterResource, FlatConfig>> = {
  ingredients: {
    title: "Bahan Pangan",
    description: "Kelola data bahan pangan (nama, kategori, satuan, penanda lokal & musim).",
    columns: [
      { header: "Nama", render: (r) => <span className="font-medium">{String(r.name)}</span> },
      { header: "Kategori", render: (r) => <Badge tone="neutral">{String(r.category)}</Badge> },
      { header: "Satuan", render: (r) => String(r.unit) },
      { header: "Lokal", render: (r) => checkboxCell(r.is_local) },
      { header: "Musim", render: (r) => checkboxCell(r.is_in_season) },
    ],
    fields: [
      { name: "name", label: "Nama bahan", type: "text", required: true },
      { name: "category", label: "Kategori", type: "select", required: true,
        options: INGREDIENT_CATEGORIES.map((c) => ({ value: c, label: c })) },
      { name: "unit", label: "Satuan dasar", type: "text", placeholder: "kg / ikat / liter" },
      { name: "description", label: "Deskripsi (opsional)", type: "textarea" },
      { name: "is_local", label: "Pangan lokal", type: "checkbox" },
      { name: "is_in_season", label: "Sedang musim", type: "checkbox" },
    ],
    empty: { name: "", category: "Pokok", unit: "kg", description: "", is_local: false, is_in_season: false },
    idOf: (r) => Number(r.id),
  },
  seasons: {
    title: "Data Musim",
    description: "Ketersediaan musiman bahan pangan per bulan.",
    columns: [
      { header: "Bahan", render: (r, c) => c.ingredientName(r.ingredient_id) },
      { header: "Bulan", render: (r) => MONTHS[Number(r.month) - 1] ?? String(r.month) },
      { header: "Status", render: (r) => <Badge tone="neutral">{SEASONAL_STATUS[String(r.status)] ?? String(r.status)}</Badge> },
    ],
    fields: [
      { name: "ingredient_id", label: "Bahan", type: "select", required: true, options: [] },
      { name: "month", label: "Bulan", type: "select", required: true,
        options: MONTHS.map((m, i) => ({ value: String(i + 1), label: m })) },
      { name: "status", label: "Status musim", type: "select", required: true,
        options: Object.entries(SEASONAL_STATUS).map(([value, label]) => ({ value, label })) },
    ],
    empty: { ingredient_id: "", month: "1", status: "in_season" },
    idOf: (r) => Number(r.id),
  },
  local: {
    title: "Komoditas Lokal",
    description: "Status ketersediaan lokal bahan pangan per wilayah.",
    columns: [
      { header: "Bahan", render: (r, c) => c.ingredientName(r.ingredient_id) },
      { header: "Wilayah", render: (r, c) => c.regionName(r.region_id) },
      { header: "Tingkat", render: (r) => <Badge tone="neutral">{LOCAL_LEVEL[String(r.level)] ?? String(r.level)}</Badge> },
      { header: "Sumber", render: (r) => (r.source ? String(r.source) : "—") },
    ],
    fields: [
      { name: "ingredient_id", label: "Bahan", type: "select", required: true, options: [] },
      { name: "region_id", label: "Wilayah", type: "select", required: true, options: [] },
      { name: "level", label: "Tingkat ketersediaan", type: "select", required: true,
        options: Object.entries(LOCAL_LEVEL).map(([value, label]) => ({ value, label })) },
      { name: "source", label: "Sumber (opsional)", type: "text" },
    ],
    empty: { ingredient_id: "", region_id: "", level: "available", source: "" },
    idOf: (r) => Number(r.id),
  },
  nutrition: {
    title: "Data Nutrisi",
    description: "Kandungan gizi per 100 g bahan (master TKPI Kemenkes RI).",
    upsert: true,
    columns: [
      { header: "Bahan", render: (r, c) => c.ingredientName(r.ingredient_id) },
      { header: "Kalori", render: (r) => `${r.calories ?? 0} kkal` },
      { header: "Protein", render: (r) => `${r.protein ?? 0} g` },
      { header: "Karbo", render: (r) => `${r.carbs ?? 0} g` },
      { header: "Lemak", render: (r) => `${r.fat ?? 0} g` },
      { header: "Serat", render: (r) => `${r.fiber ?? 0} g` },
    ],
    fields: [
      { name: "ingredient_id", label: "Bahan", type: "select", required: true, options: [] },
      { name: "calories", label: "Kalori (kkal)", type: "number" },
      { name: "protein", label: "Protein (g)", type: "number" },
      { name: "carbs", label: "Karbohidrat (g)", type: "number" },
      { name: "fat", label: "Lemak (g)", type: "number" },
      { name: "fiber", label: "Serat (g)", type: "number" },
      { name: "source", label: "Sumber data", type: "text" },
    ],
    empty: { ingredient_id: "", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, source: "TKPI Kemenkes RI" },
    idOf: (r) => Number(r.ingredient_id),
  },
  prices: {
    title: "Harga Pangan",
    description:
      "Data harga bahan. Masukkan harga manual atau hasil scraper, lalu verifikasi agar boleh dipakai Recommendation Engine.",
    columns: [
      { header: "Bahan", render: (r) => <span className="font-medium">{String(r.ingredient_name)}</span> },
      { header: "Harga", render: (r) => `${formatRupiah(Number(r.price))} / ${String(r.unit)}` },
      { header: "Sumber", render: (r) => String(r.source) },
      { header: "Tanggal", render: (r) => formatDateId(String(r.recorded_date)) },
      { header: "Status", render: (r) => <AdminStatusBadge status={String(r.status) as AdminStatus} /> },
    ],
    fields: [
      { name: "ingredient_id", label: "Bahan", type: "select", required: true, options: [] },
      { name: "price", label: "Harga (Rp)", type: "number", required: true },
      { name: "unit", label: "Satuan", type: "text", placeholder: "kg / ikat / liter", required: true },
      { name: "source", label: "Sumber data", type: "text", required: true, placeholder: "Pasar Madiun / Portal Pasar" },
      { name: "recorded_date", label: "Tanggal pencatatan", type: "date" },
    ],
    empty: {
      ingredient_id: "",
      price: 0,
      unit: "kg",
      source: "",
      recorded_date: new Date().toISOString().slice(0, 10),
    },
    idOf: (r) => Number(r.id),
    extraActions: (r) => (
      <AdminPriceActions id={Number(r.id)} status={String(r.status) as PriceStatus} />
    ),
  },
  "food-safety": {
    title: "Keamanan Pangan",
    description:
      "Kelola penjelasan bahaya & panduan penanganan. Hanya entri terverifikasi yang ditampilkan kepada pengguna.",
    columns: [
      {
        header: "Konteks",
        render: (r) => (
          <div className="min-w-0">
            <p className="font-semibold">{String(r.topic)}</p>
            <p className="mt-1 max-w-md text-xs text-stone-500">{String(r.hazard)}</p>
          </div>
        ),
      },
      { header: "Jenis risiko", render: (r) => String(r.risk_type) },
      {
        header: "Status",
        render: (r) => (
          <Badge tone={r.verification === "verified" ? "brand" : r.verification === "rejected" ? "danger" : "harvest"}>
            {FOOD_SAFETY_VERIFICATION[String(r.verification)] ?? String(r.verification)}
          </Badge>
        ),
      },
      { header: "Sumber", render: (r) => <span className="text-xs text-stone-500">{String(r.source)}</span> },
    ],
    fields: [
      { name: "topic", label: "Bahan / konteks", type: "text", required: true },
      { name: "risk_type", label: "Jenis risiko", type: "text", required: true },
      { name: "hazard", label: "Bahaya", type: "textarea", required: true },
      { name: "handling", label: "Panduan penanganan", type: "textarea", required: true },
      { name: "source", label: "Sumber", type: "text", required: true },
      {
        name: "verification",
        label: "Status verifikasi",
        type: "select",
        options: Object.entries(FOOD_SAFETY_VERIFICATION).map(([value, label]) => ({ value, label })),
      },
    ],
    empty: {
      topic: "",
      risk_type: "",
      hazard: "",
      handling: "",
      source: "",
      verification: "pending",
    },
    idOf: (r) => Number(r.id),
    extraActions: (r) => (
      <AdminFoodSafetyActions
        id={Number(r.id)}
        verification={String(r.verification) as FoodSafetyVerification}
      />
    ),
  },
  articles: {
    title: "Artikel Gizi",
    description:
      "Artikel edukasi yang tampil di halaman publik /artikel. Satu paragraf per baris pada kolom isi.",
    columns: [
      { header: "Judul", render: (r) => <span className="font-medium">{String(r.title)}</span> },
      { header: "Kategori", render: (r) => <Badge tone="neutral">{String(r.category)}</Badge> },
      { header: "Menit baca", render: (r) => `${r.read_minutes ?? 1}` },
      {
        header: "Ringkasan",
        render: (r) => <span className="line-clamp-2 text-xs text-stone-500">{String(r.excerpt)}</span>,
      },
    ],
    fields: [
      { name: "title", label: "Judul", type: "text", required: true },
      { name: "excerpt", label: "Ringkasan", type: "textarea", required: true },
      {
        name: "category",
        label: "Kategori",
        type: "select",
        required: true,
        options: ARTICLE_CATEGORIES.map((c) => ({ value: c, label: c })),
      },
      { name: "read_minutes", label: "Menit baca", type: "number", required: true },
      {
        name: "body",
        label: "Isi artikel (satu paragraf per baris)",
        type: "list",
        required: true,
        placeholder: "Paragraf pertama\nParagraf kedua",
      },
    ],
    empty: {
      title: "",
      excerpt: "",
      category: "Gizi Dasar",
      read_minutes: 3,
      body: [],
    },
    idOf: (r) => Number(r.id),
  },
};

/* ------------------------------------------------------------------ */
/* Form generik                                                        */
/* ------------------------------------------------------------------ */
function FieldInput({
  field,
  value,
  onChange,
  ctx,
}: {
  readonly field: Field;
  readonly value: unknown;
  readonly onChange: (next: unknown) => void;
  readonly ctx: Ctx;
}) {
  if (field.type === "select") {
    const options = field.name === "ingredient_id"
      ? ctx.ingredients.map((i) => ({ value: String(i.id), label: String(i.name) }))
      : field.name === "region_id"
        ? ctx.regions.map((r) => ({ value: String(r.id), label: String(r.name) }))
        : field.options ?? [];
    return (
      <Select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} required={field.required}>
        <option value="">— pilih —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
    );
  }
  if (field.type === "textarea") {
    return <Textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-4 rounded border-stone-300" />
        {field.label}
      </label>
    );
  }
  if (field.type === "list") {
    const text = Array.isArray(value) ? (value as string[]).join("\n") : "";
    return (
      <Textarea
        value={text}
        onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
        placeholder={field.placeholder}
      />
    );
  }
  if (field.type === "date") {
    return (
      <Input
        type="date"
        value={value === null || value === undefined ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <Input
      type={field.type === "number" ? "number" : "text"}
      step={field.type === "number" ? "any" : undefined}
      value={value === null || value === undefined ? "" : String(value)}
      onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
      placeholder={field.placeholder}
      required={field.required}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Komponen utama                                                      */
/* ------------------------------------------------------------------ */
export function AdminMasterManager({
  resource,
  note,
}: {
  readonly resource: MasterResource;
  /** Konten tambahan (mis. catatan kebijakan) di bawah judul halaman. */
  readonly note?: ReactNode;
}) {
  const listQuery = useMasterList(resource);
  const ingredientsQuery = useMasterList("ingredients");
  const regionsQuery = useMasterList("regions");

  const createMutation = useMasterCreate(resource);
  const updateMutation = useMasterUpdate(resource, FLAT_CONFIG[resource]?.upsert);
  const deleteMutation = useMasterDelete(resource);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRow | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const ctx: Ctx = {
    ingredients: ingredientsQuery.data ?? [],
    regions: regionsQuery.data ?? [],
    ingredientName: (id) => String((ingredientsQuery.data ?? []).find((i) => i.id === id)?.name ?? "—"),
    regionName: (id) => String((regionsQuery.data ?? []).find((r) => r.id === id)?.name ?? "—"),
  };

  const config = FLAT_CONFIG[resource];

  function openCreate() {
    setEditing(null);
    setValues(config ? { ...config.empty } : {});
    setFormError(null);
    setOpen(true);
  }

  function openEdit(row: MasterRow) {
    setEditing(row);
    setValues({ ...row });
    setFormError(null);
    setOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!config) return;
    const missing = config.fields.find((f) => {
      if (!f.required) return false;
      const raw = values[f.name];
      if (Array.isArray(raw)) return raw.length === 0;
      return raw === "" || raw === undefined || raw === null;
    });
    if (missing) {
      setFormError(`${missing.label} wajib diisi.`);
      return;
    }
    const body: Record<string, unknown> = {};
    for (const field of config.fields) {
      const raw = values[field.name];
      body[field.name] =
        field.type === "number" ? Number(raw ?? 0)
        : field.name.endsWith("_id") ? (raw === "" ? null : Number(raw))
        : raw;
    }
    try {
      if (config.upsert) {
        await updateMutation.mutateAsync({ id: config.idOf({ ...values }), body });
      } else if (editing) {
        await updateMutation.mutateAsync({ id: config.idOf(editing), body });
      } else {
        await createMutation.mutateAsync(body);
      }
      setOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Gagal menyimpan.");
    }
  }

  async function remove(row: MasterRow) {
    if (!config) return;
    if (!window.confirm("Hapus data ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await deleteMutation.mutateAsync(config.idOf(row));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Gagal menghapus.");
    }
  }

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div>
      <AdminPageHeader
        title={config?.title ?? "Data Master"}
        description={config?.description ?? ""}
        action={
          <Button intent="primary" size="sm" onClick={openCreate} disabled={!config}>
            <Plus className="size-4" aria-hidden="true" /> Tambah
          </Button>
        }
      />

      {note}

      {listQuery.isLoading ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-stone-500">Memuat data…</p>
      ) : listQuery.isError ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-red-600">
          {listQuery.error instanceof Error ? listQuery.error.message : "Gagal memuat data."}
        </p>
      ) : (listQuery.data ?? []).length === 0 ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-stone-500">
          Belum ada data. Klik <b>Tambah</b> untuk membuat.
        </p>
      ) : (
        <AdminTable headers={[...(config?.columns.map((c) => c.header) ?? []), "Aksi"]}>
          {(listQuery.data ?? []).map((row) => (
            <tr key={String(config?.idOf(row))} className="transition hover:bg-stone-50 dark:hover:bg-stone-800/40">
              {config?.columns.map((col) => (
                <AdminCell key={col.header}>{col.render(row, ctx)}</AdminCell>
              ))}
              <AdminCell>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {config?.extraActions ? config.extraActions(row, ctx) : null}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing || FLAT_CONFIG[resource]?.upsert ? "Ubah" : "Tambah"} {config?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            {(config?.fields ?? []).map((field) => (
              <div key={field.name} className="space-y-1">
                {field.type !== "checkbox" ? <Label htmlFor={field.name}>{field.label}</Label> : null}
                <FieldInput
                  field={field}
                  value={values[field.name]}
                  onChange={(next) => setValues((prev) => ({ ...prev, [field.name]: next }))}
                  ctx={ctx}
                />
              </div>
            ))}
            <FieldError>{formError}</FieldError>
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

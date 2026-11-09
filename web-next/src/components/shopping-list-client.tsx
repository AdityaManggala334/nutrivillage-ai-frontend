"use client";

import { Check, ListChecks, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Button, Input, Label, Skeleton, Textarea } from "@/components/ui";
import {
  useAddManualShoppingItemMutation,
  useDeleteShoppingItemMutation,
  useRegenerateShoppingListMutation,
  useShoppingList,
  useToggleShoppingItemMutation,
  useUpdateShoppingNoteMutation,
} from "@/hooks/use-shopping-list";
import { DEFAULT_WEEK_ID } from "@/lib/constants";
import { cn, formatRupiah } from "@/lib/utils";

/** FR-16 & FR-17: checklist belanja, hapus bahan, dan catatan. */
export function ShoppingListClient() {
  const listQuery = useShoppingList();
  const toggleMutation = useToggleShoppingItemMutation();
  const deleteMutation = useDeleteShoppingItemMutation();
  const noteMutation = useUpdateShoppingNoteMutation();
  const regenerateMutation = useRegenerateShoppingListMutation(DEFAULT_WEEK_ID);
  const tambahMutation = useAddManualShoppingItemMutation();

  const [note, setNote] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [noteSaved, setNoteSaved] = useState(false);
  // B5 (FR-06 manual): form tambah bahan di luar jadwal/resep.
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [namaBaru, setNamaBaru] = useState("");
  const [jumlahBaru, setJumlahBaru] = useState("1");
  const [satuanBaru, setSatuanBaru] = useState("kg");
  const [hargaBaru, setHargaBaru] = useState("");
  useEffect(() => {
    if (listQuery.data) setNote(listQuery.data.note);
  }, [listQuery.data]);

  const tambahManual = (event: React.FormEvent) => {
    event.preventDefault();
    setActionError(null);
    const nama = namaBaru.trim();
    const harga = Number(hargaBaru || "0");
    if (nama.length < 2) {
      setActionError("Nama bahan minimal 2 karakter.");
      return;
    }
    const jumlah = Number(jumlahBaru);
    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      setActionError("Jumlah harus angka lebih dari 0.");
      return;
    }
    if (!Number.isFinite(harga) || harga < 0) {
      setActionError("Harga tidak boleh negatif.");
      return;
    }
    tambahMutation.mutate(
      { name: nama, quantity: jumlah, unit: satuanBaru.trim() || "kg", estimatedPrice: harga },
      {
        onSuccess: () => {
          setNamaBaru("");
          setJumlahBaru("1");
          setHargaBaru("");
          setFormTerbuka(false);
        },
        onError: (error) => setActionError(error.message),
      },
    );
  };

  if (listQuery.isPending) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        title="Gagal memuat daftar belanja"
        message={listQuery.error instanceof Error ? listQuery.error.message : "Terjadi kesalahan."}
        action={
          <Button intent="danger" onClick={() => void listQuery.refetch()}>
            Coba lagi
          </Button>
        }
      />
    );
  }

  const list = listQuery.data;
  const checkedCount = list.items.filter((item) => item.checked).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {list.items.length} bahan • {checkedCount} sudah dibeli
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            intent="outline"
            onClick={() => {
              setActionError(null);
              setFormTerbuka((buka) => !buka);
            }}
            aria-expanded={formTerbuka}
          >
            <Plus className="size-4" aria-hidden="true" /> Tambah Manual
          </Button>
          <Button
            intent="harvest"
            onClick={() => {
              setActionError(null);
              regenerateMutation.mutate(undefined, {
                onError: (error) => setActionError(error.message),
              });
            }}
            loading={regenerateMutation.isPending}
          >
            <RefreshCw className="size-4" aria-hidden="true" /> Generate dari Jadwal
          </Button>
        </div>
      </div>

      {/* B5 (FR-06 manual): form tambah bahan di luar jadwal/resep. */}
      {formTerbuka ? (
        <form
          onSubmit={tambahManual}
          className="grid gap-3 rounded-2xl border border-stone-200 p-4 sm:grid-cols-[minmax(0,1fr)_90px_110px_140px_auto] dark:border-stone-800"
        >
          <div className="space-y-1">
            <Label htmlFor="manual-nama">Nama bahan</Label>
            <Input
              id="manual-nama"
              value={namaBaru}
              onChange={(event) => setNamaBaru(event.target.value)}
              placeholder="Contoh: Garam, minyak, tisu"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manual-jumlah">Jumlah</Label>
            <Input
              id="manual-jumlah"
              type="number"
              min="0.1"
              step="any"
              value={jumlahBaru}
              onChange={(event) => setJumlahBaru(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manual-satuan">Satuan</Label>
            <Input
              id="manual-satuan"
              value={satuanBaru}
              onChange={(event) => setSatuanBaru(event.target.value)}
              placeholder="kg / ikat"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="manual-harga">Estimasi (Rp)</Label>
            <Input
              id="manual-harga"
              type="number"
              min="0"
              value={hargaBaru}
              onChange={(event) => setHargaBaru(event.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" intent="primary" loading={tambahMutation.isPending}>
              Tambah
            </Button>
            <Button
              type="button"
              intent="ghost"
              onClick={() => setFormTerbuka(false)}
              aria-label="Batal tambah bahan"
            >
              Batal
            </Button>
          </div>
        </form>
      ) : null}

      {/* E2/E3: umpan balik error aksi (mis. mode tamu atau sesi berakhir). */}
      {actionError ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
        >
          {actionError}
        </p>
      ) : null}

      {list.items.length === 0 ? (
        <EmptyState
          title="Daftar belanja masih kosong"
          description="Jadwalkan menu di Meal Planner, lalu tekan Generate dari Jadwal untuk mengisi daftar belanja."
        />
      ) : (
        <div className="glass rounded-2xl">
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {list.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.checked}
                  aria-label={`Tandai ${item.name}`}
                  onClick={() => {
                    setActionError(null);
                    toggleMutation.mutate(
                      { itemId: item.id, checked: !item.checked },
                      { onError: (error) => setActionError(error.message) },
                    );
                  }}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md border transition",
                    item.checked
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-800",
                  )}
                >
                  {item.checked ? <Check className="size-4" aria-hidden="true" /> : null}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      item.checked
                        ? "text-stone-400 line-through"
                        : "text-stone-800 dark:text-stone-100",
                    )}
                  >
                    {item.name}{" "}
                    <span className="font-normal text-stone-400">
                      {item.quantity} {item.unit}
                    </span>
                  </p>
                </div>
                <span className="text-sm text-stone-600 dark:text-stone-300">
                  {formatRupiah(item.estimatedPrice)}
                </span>
                <Button
                  intent="ghost"
                  size="icon"
                  className="size-8 text-red-500"
                  aria-label={`Hapus ${item.name}`}
                  loading={deleteMutation.isPending && deleteMutation.variables === item.id}
                  onClick={() => {
                    setActionError(null);
                    deleteMutation.mutate(item.id, {
                      onError: (error) => setActionError(error.message),
                    });
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          <p className="flex items-center justify-between border-t border-stone-200 px-4 py-3 text-sm font-semibold text-stone-900 dark:border-stone-800 dark:text-stone-50">
            <span>Total estimasi</span>
            <span>{formatRupiah(list.totalEstimatedCost)}</span>
          </p>
        </div>
      )}

      <div className="glass rounded-2xl p-4">
        <label
          htmlFor="catatan-belanja"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200"
        >
          <ListChecks className="size-4 text-brand-600" aria-hidden="true" /> Catatan Belanja
        </label>
        <Textarea
          id="catatan-belanja"
          value={note}
          placeholder="Contoh: beli di Pasar Sleko, tawar dulu harganya."
          onChange={(event) => {
            setNote(event.target.value);
            setNoteSaved(false);
          }}
        />
        <div className="mt-3 flex items-center justify-end gap-3">
          {noteSaved ? (
            <span
              role="status"
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
            >
              <Check className="size-3.5" aria-hidden="true" /> Tersimpan
            </span>
          ) : null}
          <Button
            intent="secondary"
            size="sm"
            loading={noteMutation.isPending}
            onClick={() => {
              setActionError(null);
              noteMutation.mutate(note, {
                onSuccess: () => setNoteSaved(true),
                onError: (error) => {
                  setNoteSaved(false);
                  setActionError(error.message);
                },
              });
            }}
          >
            <Save className="size-4" aria-hidden="true" /> Simpan Catatan
          </Button>
        </div>
      </div>
    </div>
  );
}

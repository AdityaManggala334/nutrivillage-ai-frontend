"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FieldError,
  Input,
  Label,
  Select,
} from "@/components/ui";
import { useFieldIngredients, useSendPriceMutation } from "@/hooks/use-field-prices";
import { ErrorState } from "@/components/error-state";

/** FR-23: petugas mencatat harga bahan di pasar; menunggu ACC admin. */
export function FieldPriceForm() {
  const bahanQuery = useFieldIngredients();
  const kirim = useSendPriceMutation();

  const [ingredientId, setIngredientId] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [source, setSource] = useState("Pasar Besar Madiun");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));

  const bahan = bahanQuery.data ?? [];
  const dipilih = bahan.find((b) => String(b.id) === ingredientId);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ingredientId || !price) return;
    kirim.mutate(
      {
        ingredient_id: Number(ingredientId),
        price: Number(price),
        unit: unit || dipilih?.unit || "kg",
        source,
        recorded_date: tanggal,
      },
      {
        onSuccess: () => {
          setIngredientId("");
          setPrice("");
        },
      },
    );
  };

  if (bahanQuery.isError) {
    return (
      <ErrorState
        title="Data bahan tidak dapat dimuat"
        message={
          bahanQuery.error instanceof Error
            ? bahanQuery.error.message
            : "Periksa koneksi Anda lalu muat ulang."
        }
        action={
          <Button intent="outline" size="sm" onClick={() => void bahanQuery.refetch()}>
            Coba lagi
          </Button>
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catat Harga Pasar</CardTitle>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Kiriman masuk sebagai <b>menunggu verifikasi</b>. Admin yang menyetujui
          agar angkanya boleh dipakai mesin rekomendasi.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="f-bahan">Bahan</Label>
            <Select
              id="f-bahan"
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
              disabled={bahanQuery.isPending}
            >
              <option value="">
                {bahanQuery.isPending ? "Memuat bahan…" : "— pilih bahan —"}
              </option>
              {bahan.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name} ({b.unit}) — {b.category}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="f-harga">Harga (Rp)</Label>
              <Input
                id="f-harga"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="Contoh: 13500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-satuan">Satuan</Label>
              <Input
                id="f-satuan"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg / ikat / liter"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-sumber">Lokasi / sumber</Label>
            <Input
              id="f-sumber"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="mis. Pasar Besar Madiun, kios 12"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-tanggal">Tanggal pencatatan</Label>
            <Input
              id="f-tanggal"
              type="date"
              value={tanggal}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>

          {kirim.isError ? (
            <FieldError>
              {kirim.error instanceof Error ? kirim.error.message : "Gagal mengirim."}
            </FieldError>
          ) : null}
          {kirim.isSuccess ? (
            <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-800">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Harga terkirim dan menunggu verifikasi admin.
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="submit" intent="primary" loading={kirim.isPending}>
              <Send className="mr-2 size-4" aria-hidden="true" /> Kirim harga
            </Button>
            <Link
              href="/lapangan/kiriman"
              className="self-center text-sm text-brand-700 underline"
            >
              Lihat kiriman saya
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

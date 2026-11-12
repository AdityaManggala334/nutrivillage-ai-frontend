"use client";

import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from "@/components/ui";

/** FR-30: admin mengunggah CSV dataset (pratinjau lalu terapkan). */

// Cerminan konstanta backend (app/services/dataset_import.py). Backend tetap
// yang memutuskan; angka ini hanya supaya batas terlihat sebelum mencoba.
const MAKS_MB = 10;
const MAKS_JUMLAH = 8;

export function AdminImport() {
  const [region, setRegion] = useState("Kabupaten Madiun");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState<"preview" | "apply" | null>(null);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kirim = async (terapkan: boolean) => {
    if (!files || files.length === 0) {
      setError("Pilih berkas CSV dataset terlebih dahulu.");
      return;
    }
    const daftar = Array.from(files);
    if (daftar.length > MAKS_JUMLAH) {
      setError(`Maksimal ${MAKS_JUMLAH} berkas per unggahan. Sekarang ${daftar.length}.`);
      return;
    }
    const terlalu = daftar.filter((f) => f.size > MAKS_MB * 1024 * 1024);
    if (terlalu.length > 0) {
      setError(
        `Berkas melebihi ${MAKS_MB} MB: ${terlalu.map((f) => f.name).join(", ")}. ` +
          "Pecah datasetnya sebelum mengimpor.",
      );
      return;
    }
    setLoading(terapkan ? "apply" : "preview");
    setError(null);
    setReport(null);
    try {
      const body = new FormData();
      for (const file of daftar) body.append("berkas", file);
      body.append("region", region);
      body.append("terapkan", String(terapkan));
      const response = await fetch("/api/admin/import", { method: "POST", body });
      const data = (await response.json().catch(() => null)) as
        | { message?: string; [key: string]: unknown }
        | null;
      if (!response.ok) throw new Error(data?.message ?? "Impor gagal.");
      setReport(data ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impor gagal.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,24rem)_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Unggah Dataset CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="impor-region">Wilayah data</Label>
            <Select id="impor-region" value={region} onChange={(event) => setRegion(event.target.value)}>
              <option value="Kabupaten Madiun">Kabupaten Madiun</option>
              <option value="Kota Madiun">Kota Madiun</option>
              <option value="Luar Daerah">Lainnya (luar wilayah Madiun)</option>
            </Select>
            <p className="text-xs text-stone-500">
              Data di luar Kabupaten/Kota Madiun masuk sebagai wilayah{" "}
              <b>Luar Daerah</b>, bukan nama baru, agar daftar wilayah tetap rapi.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="impor-files">Berkas CSV</Label>
            <Input
              id="impor-files"
              type="file"
              multiple
              accept=".csv,text/csv"
              onChange={(event) => setFiles(event.target.files)}
            />
            <p className="text-xs text-stone-500">
              Pilih berkas 01 sampai 07 plus 10 (antropometri) sekaligus (maks{" "}
              {MAKS_JUMLAH} berkas, {MAKS_MB} MB per berkas). Berkas 08/09/11 diabaikan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" intent="secondary" onClick={() => void kirim(false)} loading={loading === "preview"}>
              Pratinjau
            </Button>
            <Button type="button" onClick={() => void kirim(true)} loading={loading === "apply"}>
              <Upload className="mr-2 size-4" /> Terapkan
            </Button>
          </div>
          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Laporan Impor</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-stone-500">
              <Loader2 className="size-4 animate-spin" /> Memproses…
            </p>
          ) : report ? (
            <div className="space-y-3">
              {(() => {
                const harga = report.harga as
                  | { approved?: number; pending?: number; rejected?: number;
                      bahan_tanpa_harga?: number; contoh_bahan_tanpa_harga?: string[] }
                  | undefined;
                if (!harga) return null;
                return (
                  <div className="rounded-xl border border-stone-200 p-3 text-sm dark:border-stone-700">
                    <p className="font-medium">
                      Harga disetujui: {harga.approved ?? 0} · menunggu: {harga.pending ?? 0} · ditolak: {harga.rejected ?? 0}
                    </p>
                    {harga.bahan_tanpa_harga ? (
                      <p className="mt-1 text-red-600">
                        {harga.bahan_tanpa_harga} bahan dipakai menu belum punya harga disetujui
                        {harga.contoh_bahan_tanpa_harga?.length
                          ? `: ${harga.contoh_bahan_tanpa_harga.join(", ")}`
                          : ""}. Lengkapi di halaman Verifikasi Harga.
                      </p>
                    ) : (
                      <p className="mt-1 text-emerald-700">
                        Semua bahan yang dipakai menu sudah punya harga disetujui.
                      </p>
                    )}
                  </div>
                );
              })()}
              <pre className="max-h-[28rem] overflow-auto rounded-xl bg-stone-900 p-4 text-xs text-stone-100">
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-stone-500">
              Pratinjau menampilkan jumlah baris yang akan dibuat/diperbarui tanpa menulis ke database.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

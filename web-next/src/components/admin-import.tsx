"use client";

import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from "@/components/ui";

/** FR-30: admin mengunggah CSV dataset (pratinjau lalu terapkan). */
export function AdminImport() {
  const [region, setRegion] = useState("Kabupaten Madiun");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState<"preview" | "apply" | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kirim = async (terapkan: boolean) => {
    if (!files || files.length === 0) {
      setError("Pilih berkas CSV dataset terlebih dahulu.");
      return;
    }
    setLoading(terapkan ? "apply" : "preview");
    setError(null);
    setReport(null);
    try {
      const body = new FormData();
      for (const file of Array.from(files)) body.append("berkas", file);
      body.append("region", region);
      body.append("terapkan", String(terapkan));
      const response = await fetch("/api/admin/import", { method: "POST", body });
      const data = (await response.json().catch(() => null)) as
        | { message?: string; [key: string]: unknown }
        | null;
      if (!response.ok) throw new Error(data?.message ?? "Impor gagal.");
      setReport(JSON.stringify(data, null, 2));
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
              <option>Kabupaten Madiun</option>
              <option>Kota Madiun</option>
              <option>Kabupaten Tangerang</option>
            </Select>
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
              Pilih berkas 01 sampai 07 sekaligus. Berkas 08/09/11 diabaikan.
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
            <pre className="max-h-[28rem] overflow-auto rounded-xl bg-stone-900 p-4 text-xs text-stone-100">
              {report}
            </pre>
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

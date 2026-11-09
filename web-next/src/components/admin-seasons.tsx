"use client";

import { useState } from "react";
import {
  AdminCell,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTable,
} from "@/components/admin-table";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FieldError,
  Label,
  Select,
} from "@/components/ui";
import { useMasterList, useMasterUpdate, type MasterRow } from "@/hooks/use-master";
import { MONTH_LABELS } from "@/lib/constants";

/** Satu baris tabel = satu bahan, bukan satu bulan. */
interface BarisMusim {
  readonly ingredientId: number;
  readonly nama: string;
  readonly rentang: string;
  readonly status: string;
  readonly bulan: readonly number[];
}

function label(m: number): string {
  return MONTH_LABELS[m - 1] ?? String(m);
}

/** Bulan berturut-turut (boleh memotong tahun) dirangkum jadi "Januari - Maret". */
function rangkum(bulan: readonly number[]): string {
  const urut = [...new Set(bulan)].sort((a, b) => a - b);
  if (urut.length === 0) return "-";
  if (urut.length === 1) return label(urut[0] ?? 1);
  if (urut.length === 12) return "Sepanjang tahun";

  // Pada urutan melingkar, satu rentang utuh punya tepat satu celah.
  const celah = urut
    .map((m, i) => ({ m, i }))
    .filter(({ m, i }) => {
      const berikut = urut[(i + 1) % urut.length] ?? 1;
      return (berikut - m + 12) % 12 !== 1;
    })
    .map(({ i }) => i);

  if (celah.length <= 1) {
    const idxAkhir = celah[0] ?? urut.length - 1;
    const akhir = urut[idxAkhir] ?? urut[urut.length - 1] ?? 1;
    const mulai = urut[(idxAkhir + 1) % urut.length] ?? akhir;
    return mulai === akhir ? label(mulai) : `${label(mulai)} - ${label(akhir)}`;
  }

  // Beberapa segmen, mis. Januari - Februari dan Juni - Juli.
  const segmen: number[][] = [[urut[0] ?? 1]];
  for (const m of urut.slice(1)) {
    const aktif = segmen[segmen.length - 1] ?? [m];
    if (m === (aktif[aktif.length - 1] ?? 0) + 1) aktif.push(m);
    else segmen.push([m]);
  }
  return segmen
    .map((s) => {
      const a = s[0] ?? 1;
      const b = s[s.length - 1] ?? a;
      return s.length === 1 ? label(a) : `${label(a)} - ${label(b)}`;
    })
    .join(", ");
}

export function AdminSeasons() {
  const listQuery = useMasterList("seasons");
  const bahanQuery = useMasterList("ingredients");
  const simpan = useMasterUpdate("seasons", true);

  const [edit, setEdit] = useState<BarisMusim | null>(null);
  const [start, setStart] = useState("1");
  const [end, setEnd] = useState("12");
  const [status, setStatus] = useState("in_season");
  const [pesan, setPesan] = useState<string | null>(null);

  const namaBahan = new Map<number, string>(
    (bahanQuery.data ?? []).map((b) => [Number(b.id), String(b.name)]),
  );

  const baris: BarisMusim[] = [];
  const kelompok = new Map<string, number[]>();
  for (const r of listQuery.data ?? []) {
    const kunci = `${r.ingredient_id}|${r.status}`;
    const daftar = kelompok.get(kunci) ?? [];
    daftar.push(Number(r.month));
    kelompok.set(kunci, daftar);
  }
  for (const [kunci, bulan] of kelompok) {
    const bagian = kunci.split("|");
    const ingredientId = Number(bagian[0]);
    const statusKey = bagian[1] ?? "in_season";
    baris.push({
      ingredientId,
      nama: namaBahan.get(ingredientId) ?? `Bahan #${ingredientId}`,
      rentang: rangkum(bulan),
      status: statusKey,
      bulan,
    });
  }
  baris.sort((a, b) => a.nama.localeCompare(b.nama, "id"));

  const buka = (row: BarisMusim) => {
    setEdit(row);
    const urut = [...row.bulan].sort((a, b) => a - b);
    setStart(String(urut[0]));
    setEnd(String(urut[urut.length - 1]));
    setStatus(row.status);
    setPesan(null);
  };

  const tutup = () => setEdit(null);

  const kirim = async () => {
    if (edit === null) return;
    setPesan(null);
    try {
      await simpan.mutateAsync({
        id: edit.ingredientId,
        body: {
          start_month: Number(start),
          end_month: Number(end),
          status,
        },
      });
      tutup();
    } catch (error) {
      setPesan(error instanceof Error ? error.message : "Gagal menyimpan rentang bulan.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Data Musim"
        description="Ketersediaan musiman bahan pangan. Satu bahan disimpan sebagai rentang bulan; bulan di luar rentang otomatis dilepas."
      />

      {listQuery.isPending ? (
        <p className="text-sm text-stone-500">Memuat data musim…</p>
      ) : baris.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500 dark:border-stone-700">
          Belum ada data musim. Tambahkan lewat halaman Bahan atau impor dataset.
        </p>
      ) : (
        <AdminTable headers={["Bahan", "Rentang bulan", "Status", "Aksi"]} aligns={["left", "left", "center", "right"]}>
          {baris.map((row) => (
            <tr
              key={`${row.ingredientId}-${row.status}`}
              className="transition hover:bg-stone-50 dark:hover:bg-stone-800/40"
            >
              <AdminCell className="font-medium">{row.nama}</AdminCell>
              <AdminCell>{row.rentang}</AdminCell>
              <AdminCell align="center">
                <Badge tone={row.status === "in_season" ? "brand" : "neutral"}>
                  {row.status === "in_season" ? "Musim" : "Di luar musim"}
                </Badge>
              </AdminCell>
              <AdminCell align="right">
                <Button intent="ghost" size="sm" className="text-xs" onClick={() => buka(row)}>
                  Ubah
                </Button>
              </AdminCell>
            </tr>
          ))}
        </AdminTable>
      )}

      <Dialog open={edit !== null} onOpenChange={(buka) => (buka ? null : tutup())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rentang bulan: {edit?.nama}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="musim-start">Dari bulan</Label>
                <Select
                  id="musim-start"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                >
                  {MONTH_LABELS.map((label, i) => (
                    <option key={label} value={String(i + 1)}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="musim-end">Sampai bulan</Label>
                <Select id="musim-end" value={end} onChange={(e) => setEnd(e.target.value)}>
                  {MONTH_LABELS.map((label, i) => (
                    <option key={label} value={String(i + 1)}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <FieldError>Boleh memotong tahun, misalnya November sampai Februari.</FieldError>
            <div className="space-y-1.5">
              <Label htmlFor="musim-status">Status</Label>
              <Select id="musim-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="in_season">Musim (melimpah)</option>
                <option value="off_season">Di luar musim</option>
              </Select>
            </div>
            {pesan ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{pesan}</p>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button intent="ghost" onClick={tutup}>
                Batal
              </Button>
              <Button intent="primary" loading={simpan.isPending} onClick={() => void kirim()}>
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

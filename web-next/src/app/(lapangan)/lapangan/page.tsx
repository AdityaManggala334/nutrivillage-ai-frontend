import type { Metadata } from "next";
import { FieldPriceForm } from "@/components/lapangan/field-price-form";

export const metadata: Metadata = {
  title: "Input Harga Pasar",
  description:
    "Catat harga bahan pangan dari pasar lokal Madiun. Kiriman menunggu verifikasi admin sebelum dipakai mesin rekomendasi.",
  robots: { index: false, follow: false },
};

/** FR-23: halaman utama Petugas Lapangan. */
export default function LapanganPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Survei Harga Pasar</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          Isikan harga yang Anda temui di lapangan. Satu bahan, satu harga, satu tanggal.
        </p>
      </header>
      <FieldPriceForm />
    </div>
  );
}

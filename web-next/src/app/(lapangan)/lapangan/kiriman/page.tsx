import type { Metadata } from "next";
import { FieldSubmissions } from "@/components/lapangan/field-submissions";

export const metadata: Metadata = {
  title: "Kiriman Saya",
  description: "Daftar harga yang Anda catat beserta status verifikasinya.",
  robots: { index: false, follow: false },
};

/** Status kiriman petugas lapangan. */
export default function KirimanPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Kiriman Saya</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          Baris berstatus <b>Menunggu</b> masih bisa Anda tarik. Setelah disetujui atau
          ditolak admin, data terkunci sebagai jejak audit.
        </p>
      </header>
      <FieldSubmissions />
    </div>
  );
}

import type { Metadata } from "next";
import { AdminMasterManager } from "@/components/admin-master-manager";

export const metadata: Metadata = {
  title: "Verifikasi Harga",
  robots: { index: false, follow: false },
};

/**
 * FR-23: verifikasi data harga.
 * Data disimpan di tabel `prices` (TiDB) — admin dapat menambah, mengubah,
 * menghapus, dan memverifikasi sebelum harga dipakai Recommendation Engine.
 */
export default function AdminPricesPage() {
  return <AdminMasterManager resource="prices" />;
}

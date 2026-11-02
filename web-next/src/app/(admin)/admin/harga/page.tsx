import type { Metadata } from "next";
import { AdminPrices } from "@/components/admin-prices";
import { AdminPageHeader } from "@/components/admin-table";

export const metadata: Metadata = {
  title: "Verifikasi Harga",
  robots: { index: false, follow: false },
};

/** FR-23: kelola & verifikasi data harga (sumber: tabel `prices`). */
export default function AdminPricesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Verifikasi Harga"
        description="Tambah, ubah, setujui, atau hapus harga bahan. Hanya harga berstatus disetujui yang dipakai Recommendation Engine."
      />
      <AdminPrices />
    </div>
  );
}

import type { Metadata } from "next";
import { AdminFoodSafety } from "@/components/admin-food-safety";
import { AdminPageHeader } from "@/components/admin-table";
import { listFoodSafety } from "@/server/admin-master";

export const metadata: Metadata = {
  title: "Informasi Keamanan Pangan",
  robots: { index: false, follow: false },
};

/** Pengelolaan & verifikasi informasi keamanan pangan (edukasi terverifikasi). */
export default async function AdminFoodSafetyPage() {
  const items = await listFoodSafety();

  return (
    <div>
      <AdminPageHeader
        title="Informasi Keamanan Pangan"
        description="Tambah, ubah, hapus, dan verifikasi catatan. Hanya entri terverifikasi yang tampil sebagai fakta kepada pengguna."
      />
      <p className="mb-4 rounded-xl bg-harvest-50 px-4 py-3 text-xs text-harvest-900 dark:bg-harvest-900/30 dark:text-harvest-100">
        Informasi ini bersifat edukatif dan menggantikan kebutuhan fitur pemindaian bahan. Sistem
        tidak mendeteksi racun melalui kamera.
      </p>
      <AdminFoodSafety items={items} />
    </div>
  );
}

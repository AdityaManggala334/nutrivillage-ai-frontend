import type { Metadata } from "next";
import { AdminMasterManager } from "@/components/admin-master-manager";

export const metadata: Metadata = {
  title: "Informasi Keamanan Pangan",
  robots: { index: false, follow: false },
};

/**
 * Pengelolaan & verifikasi informasi keamanan pangan (edukasi terverifikasi).
 * Tersimpan di tabel `food_safety_info`; hanya entri berstatus "Terverifikasi"
 * yang ditampilkan kepada pengguna.
 */
export default function AdminFoodSafetyPage() {
  return (
    <AdminMasterManager
      resource="food-safety"
      note={
        <p className="mb-4 rounded-xl bg-harvest-50 px-4 py-3 text-xs text-harvest-900 dark:bg-harvest-900/30 dark:text-harvest-100">
          Informasi ini bersifat edukatif dan menggantikan kebutuhan fitur pemindaian bahan. Sistem
          tidak mendeteksi racun melalui kamera. Hanya entri berstatus <b>Terverifikasi</b> yang
          tampil kepada pengguna.
        </p>
      }
    />
  );
}

import type { Metadata } from "next";
import { AdminUsersManager } from "@/components/admin-users-manager";
import { AdminPageHeader } from "@/components/admin-table";

export const metadata: Metadata = {
  title: "Kelola Pengguna",
  robots: { index: false, follow: false },
};

/** Manajemen pengguna (masyarakat, petugas SPPG, admin) oleh admin. */
export default function AdminUsersPage() {
  return (
    <div>
      <AdminPageHeader
        title="Kelola Pengguna"
        description="Kelola akun masyarakat umum, petugas SPPG, dan admin: tambah akun, ubah peran, serta aktif/nonaktifkan."
      />
      <AdminUsersManager />
    </div>
  );
}

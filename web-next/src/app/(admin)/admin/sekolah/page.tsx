import type { Metadata } from "next";
import { AdminSchools } from "@/components/admin-schools";
import { AdminPageHeader } from "@/components/admin-table";

export const metadata: Metadata = {
  title: "Data Sekolah & SPPG",
  robots: { index: false, follow: false },
};

/** Referensi admin: seluruh sekolah, petugas pengelola, dan jumlah siswa. */
export default function AdminSchoolsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Data Sekolah & SPPG"
        description="Referensi sekolah dari seluruh petugas SPPG beserta jumlah siswa per jenjang. Pengelolaan operasional tetap milik petugas terkait."
      />
      <AdminSchools />
    </div>
  );
}

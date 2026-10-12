import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { SchoolManager } from "@/components/sppg/school-manager";

export const metadata: Metadata = {
  title: "Data Sekolah",
  description:
    "Kelola sekolah yang Anda dampingi, kelompok penerima manfaat, dan jumlah siswa (FR-11).",
  robots: { index: false, follow: false },
};

/** FR-11: halaman pengelolaan data sekolah. */
export default function SppgSchoolsPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="FR-11"
        title="Data Sekolah"
        description="Satu petugas dapat mengelola beberapa sekolah. Tambahkan sekolah, lalu atur jumlah siswa per kelompok penerima manfaat."
      />
      <SchoolManager />
    </div>
  );
}

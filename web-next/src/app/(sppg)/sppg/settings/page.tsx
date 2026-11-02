import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { SppgSettings } from "@/components/sppg/sppg-settings";

export const metadata: Metadata = {
  title: "Pengaturan SPPG",
  description: "Identitas unit SPPG dan akses pengelolaan data sekolah yang Anda dampingi.",
  robots: { index: false, follow: false },
};

/** Pengaturan Petugas SPPG. */
export default function SppgSettingsPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Pengaturan"
        title="Pengaturan SPPG"
        description="Kelola data unit dan sekolah. Perubahan jumlah siswa memengaruhi perhitungan rencana dan daftar belanja yang dibuat setelahnya."
      />
      <SppgSettings />
    </div>
  );
}

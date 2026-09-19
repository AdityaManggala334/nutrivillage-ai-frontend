import type { Metadata } from "next";
import { ProfileSettings } from "@/components/profile-settings";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Profil & Pengaturan",
  description: "Kelola data diri, data keluarga, preferensi, dan pengaturan akun.",
  robots: { index: false, follow: false },
};

/** FR-18, FR-19, FR-21: halaman profil & pengaturan akun. */
export default function ProfilePage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Akun"
        title="Profil & Pengaturan"
        description="Kelola data diri, data keluarga, preferensi makanan, dan pengaturan akun."
      />
      <ProfileSettings />
    </div>
  );
}

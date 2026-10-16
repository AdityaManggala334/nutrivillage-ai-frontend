import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { NotificationList } from "@/components/notification-list";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Notifikasi",
  description: "Pemberitahuan rekomendasi, harga, dan jadwal masak.",
  robots: { index: false, follow: false },
};

/**
 * FR-21: halaman notifikasi pengguna.
 *
 * Kerangka halaman ini statis; daftar notifikasi dimuat di sisi klien
 * (`NotificationList`) agar perpindahan halaman tidak menunggu render server.
 */
export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Pemberitahuan"
        title="Notifikasi"
        description="Informasi terbaru seputar rekomendasi, harga bahan, dan jadwal masak."
      />

      <NotificationList />

      <p className="flex items-center gap-2 text-xs text-stone-400">
        <Bell className="size-3.5" aria-hidden="true" /> Notifikasi bersifat informasi pada versi
        ini.
      </p>
    </div>
  );
}

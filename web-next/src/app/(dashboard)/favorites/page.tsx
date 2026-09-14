import type { Metadata } from "next";
import { HistoryList } from "@/components/history-list";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Menu Favorit",
  description: "Daftar menu yang ditandai favorit oleh pengguna.",
  robots: { index: false, follow: false },
};

/** FR-20: halaman menu favorit (riwayat dengan filter favorit dikunci). */
export default function FavoritesPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Favorit"
        title="Menu Favorit"
        description="Menu yang kamu tandai favorit dari halaman Riwayat akan tampil di sini."
      />
      <HistoryList lockedFilter="favorite" />
    </div>
  );
}

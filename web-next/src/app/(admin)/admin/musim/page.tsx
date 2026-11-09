import type { Metadata } from "next";
import { AdminSeasons } from "@/components/admin-seasons";

export const metadata: Metadata = {
  title: "Data Musim",
  robots: { index: false, follow: false },
};

/** FR-31: ketersediaan musiman per bahan, ditampilkan & disimpan sebagai rentang bulan. */
export default function AdminSeasonsPage() {
  return <AdminSeasons />;
}

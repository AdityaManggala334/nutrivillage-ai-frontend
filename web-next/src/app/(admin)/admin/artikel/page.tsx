import type { Metadata } from "next";
import { AdminMasterManager } from "@/components/admin-master-manager";

export const metadata: Metadata = {
  title: "Artikel Gizi",
  robots: { index: false, follow: false },
};

/** FR-03: kelola artikel edukasi yang tampil di halaman publik `/artikel`. */
export default function AdminArticlesPage() {
  return <AdminMasterManager resource="articles" />;
}

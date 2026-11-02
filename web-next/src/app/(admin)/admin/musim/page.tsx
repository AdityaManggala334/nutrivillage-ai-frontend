import type { Metadata } from "next";
import { AdminMasterManager } from "@/components/admin-master-manager";

export const metadata: Metadata = {
  title: "Data Musim",
  robots: { index: false, follow: false },
};

/** FR-31: CRUD ketersediaan musiman per bahan per bulan. */
export default function AdminSeasonsPage() {
  return <AdminMasterManager resource="seasons" />;
}

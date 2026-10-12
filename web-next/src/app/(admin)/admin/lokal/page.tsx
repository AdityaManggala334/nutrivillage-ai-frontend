import type { Metadata } from "next";
import { AdminMasterManager } from "@/components/admin-master-manager";

export const metadata: Metadata = {
  title: "Komoditas Lokal",
  robots: { index: false, follow: false },
};

/** FR-32: CRUD status komoditas lokal per wilayah. */
export default function AdminLocalPage() {
  return <AdminMasterManager resource="local" />;
}

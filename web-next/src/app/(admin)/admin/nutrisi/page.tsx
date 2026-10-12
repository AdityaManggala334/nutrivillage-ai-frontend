import type { Metadata } from "next";
import { AdminMasterManager } from "@/components/admin-master-manager";

export const metadata: Metadata = {
  title: "Data Nutrisi",
  robots: { index: false, follow: false },
};

/** FR-24: CRUD data nutrisi bahan (master TKPI). */
export default function AdminNutritionPage() {
  return <AdminMasterManager resource="nutrition" />;
}

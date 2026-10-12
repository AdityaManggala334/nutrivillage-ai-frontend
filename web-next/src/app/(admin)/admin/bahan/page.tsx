import type { Metadata } from "next";
import { AdminMasterManager } from "@/components/admin-master-manager";

export const metadata: Metadata = {
  title: "Bahan Pangan",
  robots: { index: false, follow: false },
};

/** FR-22: CRUD data bahan pangan. */
export default function AdminIngredientsPage() {
  return <AdminMasterManager resource="ingredients" />;
}

import type { Metadata } from "next";
import { AdminRecipeManager } from "@/components/admin-recipe-manager";

export const metadata: Metadata = {
  title: "Menu & Resep",
  robots: { index: false, follow: false },
};

/** FR-24: CRUD menu, komposisi bahan, langkah memasak, dan gizi. */
export default function AdminMenuPage() {
  return <AdminRecipeManager />;
}

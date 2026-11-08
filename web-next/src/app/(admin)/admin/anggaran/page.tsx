import type { Metadata } from "next";
import { AdminBudgetPolicies } from "@/components/admin-budget-policies";
import { AdminPageHeader } from "@/components/admin-table";

export const metadata: Metadata = {
  title: "Kebijakan Anggaran",
  robots: { index: false, follow: false },
};

/** FR-11: batas anggaran bahan per porsi untuk rekomendasi SPPG. */
export default function AdminBudgetPage() {
  return (
    <div>
      <AdminPageHeader
        title="Kebijakan Anggaran"
        description="Tetapkan batas anggaran bahan per porsi per jenjang. Kosongkan untuk memakai standar BGN."
      />
      <AdminBudgetPolicies />
    </div>
  );
}

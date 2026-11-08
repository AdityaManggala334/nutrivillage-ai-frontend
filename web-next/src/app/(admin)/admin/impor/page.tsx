import type { Metadata } from "next";
import { AdminImport } from "@/components/admin-import";
import { AdminPageHeader } from "@/components/admin-table";

export const metadata: Metadata = {
  title: "Impor Dataset",
  robots: { index: false, follow: false },
};

/** FR-30: impor dataset CSV (bahan, gizi, menu, harga, AKG, musim, alergen). */
export default function AdminImportPage() {
  return (
    <div>
      <AdminPageHeader
        title="Impor Dataset"
        description="Unggah CSV dataset v2.2. Impor bersifat idempoten memakai kode bahan/menu, jadi unggah ulang akan memperbarui data."
      />
      <AdminImport />
    </div>
  );
}

import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { SppgShoppingList } from "@/components/sppg/sppg-shopping-list";

export const metadata: Metadata = {
  title: "Daftar Belanja SPPG",
  description:
    "Kebutuhan bahan pangan dan estimasi biaya dari rencana menu sekolah, memperhitungkan yield resep dan jumlah porsi.",
  robots: { index: false, follow: false },
};

/** Shopping List khusus Petugas SPPG. */
export default function SppgShoppingListPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Kebutuhan Bahan Pangan"
        title="Daftar Belanja SPPG"
        description="Dihitung dari Meal Planner yang dipilih. Bahan yang sama digabung setelah satuan diseragamkan. Hanya biaya bahan pangan, bukan biaya operasional."
      />
      <SppgShoppingList />
    </div>
  );
}

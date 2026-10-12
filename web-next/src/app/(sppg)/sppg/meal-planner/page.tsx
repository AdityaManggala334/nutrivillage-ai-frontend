import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { SppgMealPlanner } from "@/components/sppg/sppg-meal-planner";

export const metadata: Metadata = {
  title: "Meal Planner SPPG",
  description:
    "Susun rencana menu beberapa hari untuk sekolah dan kelompok penerima tertentu, beserta estimasi biaya bahan pangan.",
  robots: { index: false, follow: false },
};

/** Meal Planner khusus Petugas SPPG. */
export default function SppgMealPlannerPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Perencanaan Menu"
        title="Meal Planner SPPG"
        description="Rencana selalu terikat pada satu sekolah dan satu kelompok penerima. Menu dari kelompok berbeda tidak dicampur dalam satu perhitungan."
      />
      <SppgMealPlanner />
    </div>
  );
}

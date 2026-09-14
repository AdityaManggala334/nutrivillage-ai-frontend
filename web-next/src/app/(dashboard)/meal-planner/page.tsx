import type { Metadata } from "next";
import { MealPlannerBoard } from "@/components/meal-planner-board";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Meal Planner",
  description:
    "Susun jadwal masak mingguan (7 hari, sarapan/makan siang/makan malam) lalu generate daftar belanja otomatis dari menu terjadwal.",
};

/** FR-26, FR-27, FR-28: kalender jadwal masak mingguan. */
export default function MealPlannerPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Jadwal Masak"
        title="Meal Planner Mingguan"
        description="Klik slot untuk memilih menu atau seret menu dari daftar. Jadwal tersimpan otomatis dan dapat diubah kapan saja."
      />
      <MealPlannerBoard />
    </div>
  );
}

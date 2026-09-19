import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { ShoppingListClient } from "@/components/shopping-list-client";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Daftar Belanja",
  description: "Checklist bahan belanja dari menu yang dijadwalkan pada Meal Planner.",
  robots: { index: false, follow: false },
};

/** FR-15, FR-16, FR-17: checklist daftar belanja + catatan. */
export default function ShoppingListPage() {
  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Belanja"
        title="Daftar Belanja"
        description="Centang bahan yang sudah dibeli, hapus bila tidak jadi, dan tambahkan catatan."
        action={
          <ButtonLink intent="secondary" href="/meal-planner">
            Atur di Meal Planner
          </ButtonLink>
        }
      />
      <ShoppingListClient />
    </div>
  );
}

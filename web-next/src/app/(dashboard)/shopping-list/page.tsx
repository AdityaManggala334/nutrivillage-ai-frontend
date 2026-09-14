import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { ShoppingListPanel } from "@/components/shopping-list-panel";
import { ButtonLink } from "@/components/ui";
import { DEFAULT_WEEK_ID } from "@/lib/constants";
import { generateShoppingList } from "@/server/data";

export const metadata: Metadata = {
  title: "Daftar Belanja",
  description: "Daftar belanja gabungan dari menu yang dijadwalkan pada Meal Planner.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** FR-15 & FR-16: halaman daftar belanja (dibuat dari jadwal Meal Planner). */
export default async function ShoppingListPage() {
  const shoppingList = await generateShoppingList(DEFAULT_WEEK_ID);

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Belanja"
        title="Daftar Belanja"
        description="Bahan gabungan dari menu yang dijadwalkan pada Meal Planner."
        action={
          <ButtonLink intent="secondary" href="/meal-planner">
            Atur di Meal Planner
          </ButtonLink>
        }
      />
      <ShoppingListPanel shoppingList={shoppingList} />
    </div>
  );
}

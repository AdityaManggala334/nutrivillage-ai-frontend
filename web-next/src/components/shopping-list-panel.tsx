import { ShoppingBasket } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { ShoppingList } from "@/schemas/domain";

export interface ShoppingListPanelProps {
  readonly shoppingList: ShoppingList | null;
}

/** FR-29: panel hasil generate daftar belanja dari Meal Planner. */
export function ShoppingListPanel({ shoppingList }: ShoppingListPanelProps) {
  if (!shoppingList) return null;

  return (
    <section
      aria-labelledby="belanja-heading"
      className="rounded-2xl border border-harvest-200 bg-harvest-50/60 p-5 dark:border-harvest-900 dark:bg-harvest-950/30"
    >
      <div className="mb-3 flex items-center gap-2">
        <ShoppingBasket className="size-5 text-harvest-600" aria-hidden="true" />
        <h2 id="belanja-heading" className="text-base font-semibold text-harvest-900 dark:text-harvest-100">
          {shoppingList.title}
        </h2>
      </div>

      {shoppingList.items.length === 0 ? (
        <p className="text-sm text-harvest-800 dark:text-harvest-200">
          Belum ada menu terjadwal, jadwalkan menu terlebih dahulu.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-harvest-200/70 dark:divide-harvest-900/60">
            {shoppingList.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-stone-700 dark:text-stone-200">
                  {item.name}{" "}
                  <span className="text-stone-400">
                    {item.quantity} {item.unit}
                  </span>
                </span>
                <span className="font-medium text-stone-700 dark:text-stone-200">
                  {formatRupiah(item.estimatedPrice)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center justify-between border-t border-harvest-300/70 pt-3 text-sm font-semibold text-harvest-900 dark:border-harvest-800 dark:text-harvest-100">
            <span>Total estimasi</span>
            <span>{formatRupiah(shoppingList.totalEstimatedCost)}</span>
          </p>
        </>
      )}
    </section>
  );
}

import { AlertTriangle, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui";
import type { Recipe } from "@/schemas/domain";

/** FR-33: ambang batas umur data harga terverifikasi (hari). */
export const PRICE_STALE_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Menghitung umur data harga dalam hari. */
export function priceAgeInDays(priceUpdatedAt: string): number {
  const diff = Date.now() - new Date(priceUpdatedAt).getTime();
  return Math.floor(diff / MS_PER_DAY);
}

/** FR-33: true bila data harga terverifikasi berusia lebih dari 7 hari. */
export function isPriceStale(priceUpdatedAt: string): boolean {
  return priceAgeInDays(priceUpdatedAt) > PRICE_STALE_DAYS;
}

export interface PriceFreshnessBadgeProps {
  readonly recipe: Pick<Recipe, "priceUpdatedAt">;
}

/**
 * FR-33: warning badge bila data harga terverifikasi berusia > 7 hari.
 * React Server Component — tidak ada JS klien.
 */
export function PriceFreshnessBadge({ recipe }: PriceFreshnessBadgeProps) {
  const ageDays = priceAgeInDays(recipe.priceUpdatedAt);

  if (isPriceStale(recipe.priceUpdatedAt)) {
    return (
      <Badge tone="danger" title={`Data harga diperbarui ${ageDays} hari lalu`}>
        <AlertTriangle className="size-3" aria-hidden="true" /> Harga &gt; 7 hari
      </Badge>
    );
  }

  return (
    <Badge tone="info" title={`Data harga diperbarui ${ageDays} hari lalu`}>
      <BadgeCheck className="size-3" aria-hidden="true" /> Harga terverifikasi
    </Badge>
  );
}

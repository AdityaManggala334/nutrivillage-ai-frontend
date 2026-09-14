import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PriceDisclaimerProps {
  readonly className?: string;
}

/**
 * NFR-06 & Critical Design Review butir 4: disclaimer estimasi harga.
 * Harga bersumber dari data pasar yang diverifikasi admin dan dapat berbeda
 * dengan harga aktual. React Server Component.
 */
export function PriceDisclaimer({ className }: PriceDisclaimerProps) {
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-xs text-stone-500 dark:text-stone-400",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0 text-stone-400" aria-hidden="true" />
      <span>
        Harga adalah <strong className="font-medium">estimasi</strong> dari data pasar yang
        diverifikasi admin dan dapat berbeda dengan harga aktual di pasar.
      </span>
    </p>
  );
}

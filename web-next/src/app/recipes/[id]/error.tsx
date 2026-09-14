"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";
import { Button, ButtonLink } from "@/components/ui";

export interface RecipeErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/** Modul 6: error boundary untuk segmen detail resep. */
export default function RecipeError({ error, reset }: RecipeErrorProps) {
  useEffect(() => {
    console.error("[NutriVillage][recipe] error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <ErrorState
        title="Gagal memuat detail resep"
        message={error.message || "Terjadi kesalahan saat memuat resep. Silakan coba lagi."}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button intent="danger" onClick={reset}>
              Coba lagi
            </Button>
            <ButtonLink intent="secondary" href="/explore">
              Kembali ke Explore
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}

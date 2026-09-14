"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui";

export interface GlobalErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/** Modul 6: error boundary global App Router (Client Component). */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[NutriVillage] Unhandled error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <ErrorState
        title="Terjadi kesalahan"
        message={error.message || "Terjadi kesalahan tak terduga saat memuat halaman."}
        action={
          <Button intent="danger" onClick={reset}>
            Coba lagi
          </Button>
        }
      />
    </div>
  );
}

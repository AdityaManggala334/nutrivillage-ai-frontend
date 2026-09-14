"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui";

export interface DashboardErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/** Modul 6: error boundary untuk segmen (dashboard). */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[NutriVillage][dashboard] error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Gagal memuat halaman dashboard"
      message={error.message || "Terjadi kesalahan saat memuat data. Silakan coba lagi."}
      action={
        <Button intent="danger" onClick={reset}>
          Coba lagi
        </Button>
      }
    />
  );
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import type { PriceStatus } from "@/schemas/admin";

export interface AdminPriceActionsProps {
  readonly id: number;
  readonly status: PriceStatus;
}

/** FR-23: admin memverifikasi data harga (setujui / tolak). */
export function AdminPriceActions({ id, status }: AdminPriceActionsProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<PriceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setStatus = async (next: PriceStatus) => {
    setLoading(next);
    setError(null);
    try {
      const response = await fetch(`/api/admin/prices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          typeof body === "object" && body !== null && "message" in body
            ? String((body as { message: unknown }).message)
            : "Gagal memperbarui status harga";
        throw new Error(message);
      }
      // Muat ulang daftar harga & statistik dashboard.
      await queryClient.invalidateQueries({ queryKey: ["admin-master", "prices"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal");
    } finally {
      setLoading(null);
    }
  };

  if (status !== "pending") {
    return (
      <span
        className={
          status === "approved"
            ? "text-xs font-semibold text-brand-700"
            : "text-xs font-semibold text-red-600"
        }
      >
        {status === "approved" ? "Disetujui" : "Ditolak"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      <Button
        intent="primary"
        size="sm"
        loading={loading === "approved"}
        onClick={() => void setStatus("approved")}
      >
        <Check className="size-3.5" aria-hidden="true" /> Setujui
      </Button>
      <Button
        intent="outline"
        size="sm"
        loading={loading === "rejected"}
        onClick={() => void setStatus("rejected")}
      >
        <X className="size-3.5" aria-hidden="true" /> Tolak
      </Button>
    </div>
  );
}

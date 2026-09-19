"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import type { PriceStatus } from "@/schemas/admin";

export interface AdminPriceActionsProps {
  readonly id: string;
  readonly status: PriceStatus;
}

/** FR-23: admin memverifikasi data harga (setujui / tolak). */
export function AdminPriceActions({ id, status }: AdminPriceActionsProps) {
  const [current, setCurrent] = useState<PriceStatus>(status);
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
      if (!response.ok) throw new Error("Gagal memperbarui status harga");
      setCurrent(next);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal");
    } finally {
      setLoading(null);
    }
  };

  if (current !== "pending") {
    return (
      <span className={current === "approved" ? "text-xs font-semibold text-brand-700" : "text-xs font-semibold text-red-600"}>
        {current === "approved" ? "Disetujui" : "Ditolak"}
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

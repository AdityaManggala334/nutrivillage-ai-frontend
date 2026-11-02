"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import type { FoodSafetyVerification } from "@/schemas/admin";

export interface AdminFoodSafetyActionsProps {
  readonly id: number;
  readonly verification: FoodSafetyVerification;
}

/** Verifikasi informasi keamanan pangan (setujui / tolak) oleh admin. */
export function AdminFoodSafetyActions({ id, verification }: AdminFoodSafetyActionsProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<FoodSafetyVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setStatus = async (next: FoodSafetyVerification) => {
    setLoading(next);
    setError(null);
    try {
      const response = await fetch(`/api/admin/food-safety/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification: next }),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          typeof body === "object" && body !== null && "message" in body
            ? String((body as { message: unknown }).message)
            : "Gagal memperbarui status";
        throw new Error(message);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-master", "food-safety"] });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Gagal");
    } finally {
      setLoading(null);
    }
  };

  if (verification !== "pending") {
    return (
      <span
        className={
          verification === "verified"
            ? "text-xs font-semibold text-brand-700"
            : "text-xs font-semibold text-red-600"
        }
      >
        {verification === "verified" ? "Terverifikasi" : "Ditolak"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      <Button
        intent="primary"
        size="sm"
        loading={loading === "verified"}
        onClick={() => void setStatus("verified")}
      >
        <Check className="size-3.5" aria-hidden="true" /> Verifikasi
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

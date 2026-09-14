"use client";

import { useSaveHistoryMutation } from "@/hooks/use-history";
import { Button } from "@/components/ui";
import { BookmarkPlus, Check } from "lucide-react";

export interface SaveRecipeButtonProps {
  readonly recipeId: string;
  readonly kind?: "recommendation" | "meal-plan";
  readonly note?: string;
}

/** FR-12: simpan rekomendasi ke riwayat (mutasi + invalidasi cache). */
export function SaveRecipeButton({
  recipeId,
  kind = "recommendation",
  note = "",
}: SaveRecipeButtonProps) {
  const mutation = useSaveHistoryMutation();

  return (
    <Button
      intent={mutation.isSuccess ? "secondary" : "primary"}
      size="sm"
      loading={mutation.isPending}
      onClick={() => mutation.mutate({ recipeId, kind, note })}
      aria-label="Simpan menu ke riwayat"
    >
      {mutation.isSuccess ? (
        <>
          <Check className="size-4" aria-hidden="true" /> Tersimpan
        </>
      ) : (
        <>
          <BookmarkPlus className="size-4" aria-hidden="true" /> Simpan
        </>
      )}
    </Button>
  );
}

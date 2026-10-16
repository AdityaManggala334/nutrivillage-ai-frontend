"use client";

import { BookmarkPlus, Check, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui";
import { useSaveHistoryMutation } from "@/hooks/use-history";

export interface SaveRecipeButtonProps {
  readonly recipeId: string;
  readonly kind?: "recommendation" | "meal-plan";
  readonly note?: string;
}

/**
 * FR-12: simpan rekomendasi ke riwayat (mutasi + invalidasi cache).
 * E2: menampilkan umpan balik sukses ("Tersimpan") sekaligus pesan error
 * (mis. sesi tamu / sesi berakhir) agar aksi tidak terasa menggantung.
 */
export function SaveRecipeButton({
  recipeId,
  kind = "recommendation",
  note = "",
}: SaveRecipeButtonProps) {
  const mutation = useSaveHistoryMutation();

  return (
    <>
      <Button
        intent={mutation.isError ? "danger" : mutation.isSuccess ? "secondary" : "primary"}
        size="sm"
        loading={mutation.isPending}
        onClick={() => mutation.mutate({ recipeId, kind, note })}
        aria-label="Simpan menu ke riwayat"
      >
        {mutation.isError ? (
          <>
            <TriangleAlert className="size-4" aria-hidden="true" /> Coba lagi
          </>
        ) : mutation.isSuccess ? (
          <>
            <Check className="size-4" aria-hidden="true" /> Tersimpan
          </>
        ) : (
          <>
            <BookmarkPlus className="size-4" aria-hidden="true" /> Simpan
          </>
        )}
      </Button>
      {mutation.isError ? (
        <span role="alert" className="self-center text-xs text-red-600 dark:text-red-400">
          {mutation.error instanceof Error ? mutation.error.message : "Gagal menyimpan menu."}
        </span>
      ) : null}
    </>
  );
}

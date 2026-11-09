"use client";

import { BookmarkPlus, Check, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui";
import { useSaveHistoryMutation } from "@/hooks/use-history";

export interface SaveRecipeButtonProps {
  readonly recipeId: string;
  readonly kind?: "recommendation" | "meal-plan";
  readonly note?: string;
  /** B4: mode ringkas untuk dipasang di kartu rekomendasi Explore. */
  readonly compact?: boolean;
  /** B4: aksi tetap boleh diulang tanpa membuat baris duplikat. */
  readonly allowRepeat?: boolean;
}

/**
 * FR-12: simpan rekomendasi ke riwayat (mutasi + invalidasi cache).
 * E2: menampilkan umpan balik sukses ("Tersimpan") sekaligus pesan error
 * (mis. sesi tamu / sesi berakhir) agar aksi tidak terasa menggantung.
 *
 * B4: backend sudah idempoten (menyimpan resep yang sama tidak membuat
 * baris baru), jadi tombol ini aman dipasang di Explore dan Meal Planner,
 * dan bisa dipakai ulang tanpa mengunci tampilan "Tersimpan" selamanya.
 */
export function SaveRecipeButton({
  recipeId,
  kind = "recommendation",
  note = "",
  compact = false,
  allowRepeat = false,
}: SaveRecipeButtonProps) {
  const mutation = useSaveHistoryMutation();

  const suksesTampil = allowRepeat ? mutation.isSuccess && !compact : mutation.isSuccess;

  return (
    <>
      <Button
        intent={mutation.isError ? "danger" : suksesTampil ? "secondary" : "primary"}
        size="sm"
        loading={mutation.isPending}
        onClick={() => mutation.mutate({ recipeId, kind, note })}
        aria-label="Simpan menu ke riwayat"
      >
        {mutation.isError ? (
          <>
            <TriangleAlert className="size-4" aria-hidden="true" /> {compact ? "" : "Coba lagi"}
          </>
        ) : suksesTampil ? (
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
